import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const linkUpdateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-_]+$/, 'Slug can only contain lowercase letters, numbers, hyphens, and underscores')
    .optional(),
  targetUrl: z.string().url('Target URL must be a valid URL').optional(),
  description: z.string().max(500).optional().nullable(),
  category: z.string().max(50).optional(),
  badge: z.string().max(30).optional().nullable(),
  icon: z.string().max(30).optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
})

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await props.params
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    const parsed = linkUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Validation error' },
        { status: 400 }
      )
    }

    const existing = await prisma.shortLink.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    // Check slug collision if slug is being updated
    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const cleanSlug = parsed.data.slug.toLowerCase().trim()
      const slugConflict = await prisma.shortLink.findUnique({
        where: { slug: cleanSlug },
      })
      if (slugConflict) {
        return NextResponse.json(
          { error: `Slug '/go/${cleanSlug}' is already taken.` },
          { status: 409 }
        )
      }
      parsed.data.slug = cleanSlug
    }

    const updated = await prisma.shortLink.update({
      where: { id },
      data: parsed.data,
    })

    return NextResponse.json({ link: updated })
  } catch (error) {
    console.error('[PATCH /api/admin/links/[id]] error:', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await props.params

    const existing = await prisma.shortLink.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    await prisma.shortLink.delete({
      where: { id },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[DELETE /api/admin/links/[id]] error:', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
