import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const linkCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50)
    .regex(/^[a-z0-9-_]+$/, 'Slug can only contain lowercase letters, numbers, hyphens, and underscores'),
  targetUrl: z.string().url('Target URL must be a valid URL (http/https)'),
  description: z.string().max(500).optional().nullable(),
  category: z.string().max(50).default('General'),
  badge: z.string().max(30).optional().nullable(),
  icon: z.string().max(30).default('Globe'),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const links = await prisma.shortLink.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ links })
  } catch (error) {
    console.error('[GET /api/admin/links] error:', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    const parsed = linkCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Validation error' },
        { status: 400 }
      )
    }

    const { title, slug, targetUrl, description, category, badge, icon, order, isActive } = parsed.data
    const cleanSlug = slug.toLowerCase().trim()

    // Check slug collision
    const existing = await prisma.shortLink.findUnique({
      where: { slug: cleanSlug },
    })

    if (existing) {
      return NextResponse.json(
        { error: `Slug '/go/${cleanSlug}' is already taken. Please choose another.` },
        { status: 409 }
      )
    }

    const link = await prisma.shortLink.create({
      data: {
        title: title.trim(),
        slug: cleanSlug,
        targetUrl: targetUrl.trim(),
        description: description?.trim() || null,
        category: category?.trim() || 'General',
        badge: badge?.trim() || null,
        icon: icon?.trim() || 'Globe',
        order: order || 0,
        isActive,
      },
    })

    return NextResponse.json({ link }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/links] error:', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
