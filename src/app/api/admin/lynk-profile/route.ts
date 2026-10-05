import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const lynkProfileSchema = z.object({
  displayName: z.string().max(100).optional().nullable(),
  tagline: z.string().max(200).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  verifiedBadge: z.boolean().default(true),
  showMainPortfolio: z.boolean().default(true),
  mainPortfolioLabel: z.string().max(50).default('Main Portfolio'),
  mainPortfolioUrl: z.string().default('/en'),
  showDownloadCv: z.boolean().default(true),
  downloadCvLabel: z.string().max(50).default('Download CV'),
  downloadCvUrl: z.string().optional().nullable(),
  customCtaLabel: z.string().max(50).optional().nullable(),
  customCtaUrl: z.string().optional().nullable(),
  theme: z.string().default('default'),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let profile = await prisma.lynkProfile.findFirst()
    if (!profile) {
      // Create initial profile based on SiteSettings if none exists
      const settings = await prisma.siteSettings.findFirst()
      profile = await prisma.lynkProfile.create({
        data: {
          displayName: settings?.nameEn || 'Sukristiyo',
          tagline: settings?.subtitleEn || 'DevOps · SRE · Cloud Infrastructure Specialist',
          location: settings?.location || 'Jakarta, Indonesia',
          avatarUrl: settings?.profilePhotoUrl || null,
          downloadCvUrl: settings?.cvUrl || null,
        },
      })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('[GET /api/admin/lynk-profile] error:', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    const parsed = lynkProfileSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Validation error' },
        { status: 400 }
      )
    }

    const existing = await prisma.lynkProfile.findFirst()
    let profile

    if (existing) {
      profile = await prisma.lynkProfile.update({
        where: { id: existing.id },
        data: parsed.data,
      })
    } else {
      profile = await prisma.lynkProfile.create({
        data: parsed.data,
      })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('[PATCH /api/admin/lynk-profile] error:', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
