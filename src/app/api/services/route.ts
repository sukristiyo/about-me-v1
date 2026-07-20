import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

const schema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  iconName: z.string().min(1),
  colorClass: z.string().min(1),
  iconColor: z.string().min(1),
  order: z.number().int().default(0),
})

export async function GET() {
  try {
    const items = await prisma.service.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(items)
  } catch (error) {
    console.error('[GET /api/services]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 })
    }

    const service = await prisma.service.create({ data: parsed.data })
    revalidatePath('/', 'layout');
    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('[POST /api/services]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
