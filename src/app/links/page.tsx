import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { LinksClient } from './LinksClient'

export const revalidate = 60 // Revalidate every 60 seconds

export const metadata: Metadata = {
  title: 'Sukristiyo | Links & Curated Resources',
  description:
    'Curated DevOps tools, cloud credits, infrastructure promotions, and official links by Sukristiyo.',
  openGraph: {
    title: 'Sukristiyo | Links & Curated Resources',
    description: 'DevOps, SRE & Cloud Engineer. Curated resources, tools, and official links.',
    url: 'https://link.sukristiyo.site',
  },
}

export default async function LinksPage() {
  const [settings, links, socialLinks] = await Promise.all([
    prisma.siteSettings.findFirst(),
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
      links={links}
      socialLinks={socialLinks}
    />
  )
}
