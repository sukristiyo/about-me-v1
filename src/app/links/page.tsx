import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { LinksClient } from './LinksClient'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const [settings, lynkProfile] = await Promise.all([
    prisma.siteSettings.findFirst(),
    prisma.lynkProfile.findFirst(),
  ])

  const name = lynkProfile?.displayName || settings?.nameEn || 'Sukristiyo'
  const tagline = lynkProfile?.tagline || settings?.subtitleEn || 'DevOps · SRE · Cloud Engineer'

  return {
    title: `${name} | Links & Curated Resources`,
    description: tagline,
    openGraph: {
      title: `${name} | Links & Curated Resources`,
      description: tagline,
      url: 'https://link.sukristiyo.site',
    },
  }
}

export default async function LinksPage() {
  const [settings, lynkProfile, links, socialLinks] = await Promise.all([
    prisma.siteSettings.findFirst(),
    prisma.lynkProfile.findFirst(),
    prisma.shortLink.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.socialLink.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    }),
  ])

  return (
    <LinksClient
      settings={settings}
      lynkProfile={lynkProfile}
      links={links}
      socialLinks={socialLinks}
    />
  )
}
