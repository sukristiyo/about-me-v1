import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { NextResponse } from 'next/server'
import { sendContactNotification } from '@/lib/resend'

const contactSchema = z.object({
  fullName: z.string().trim().min(2, 'Name too short').max(100, 'Name too long'),
  email: z.string().trim().email('Invalid email').max(255, 'Email too long'),
  message: z.string().trim().min(10, 'Message too short').max(5000, 'Message too long'),
})

// Simple in-memory rate limiter: max 5 requests per 10 minutes per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 })
    return false
  }

  if (record.count >= 5) {
    return true
  }

  record.count += 1
  return false
}

export async function POST(request: Request) {
  try {
    // Rate limit by client IP
    const forwardedFor = request.headers.get('x-forwarded-for')
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : 'anonymous'

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a few minutes before sending another message.' },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Honeypot check — bots fill this field, humans don't see it
    if (body.website && String(body.website).trim() !== '') {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    const parsed = contactSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 })
    }

    const { fullName, email, message } = parsed.data

    const contactMessage = await prisma.contactMessage.create({
      data: { fullName, email, message },
    })

    await sendContactNotification({ fullName, email, message })

    return NextResponse.json(contactMessage, { status: 201 })
  } catch (error) {
    console.error('[POST /api/contact]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
