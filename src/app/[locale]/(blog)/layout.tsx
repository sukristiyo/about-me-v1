import { prisma } from '@/lib/prisma'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { ReactNode } from 'react'
import BlogLayoutClient from '@/components/layout/BlogLayoutClient'
import ParticleBackground from '@/components/layout/ParticleBackground'
import type { SiteSettings, SocialLink } from '@prisma/client'

async function getData(): Promise<{ settings: SiteSettings | null; socialLinks: SocialLink[] }> {
  try {
    const [settings, socialLinks] = await Promise.all([
      prisma.siteSettings.findFirst(),
      prisma.socialLink.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
    ])
    return { settings, socialLinks }
  } catch {
    return { settings: null, socialLinks: [] }
  }
}

import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { settings } = await getData();
  
  const isId = locale === 'id';
  const name = (isId ? settings?.nameId : settings?.nameEn) || settings?.nameEn || 'Sukristiyo';
  const subtitle = (isId ? settings?.subtitleId : settings?.subtitleEn) || settings?.subtitleEn || 'DevOps, SRE & Cloud Engineer';
  const fullTitle = `Blog | ${name} — ${subtitle}`;
  
  const BASE_URL = 'https://sukristiyo.my.id';
  const ogImageUrl = `${BASE_URL}/api/og`;
  const ogImages = [{ url: ogImageUrl, width: 400, height: 400, alt: 'Blog OG Image' }];

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: fullTitle,
      template: `%s | Blog | ${name}`,
    },
    icons: {
      icon: settings?.profilePhotoUrl || ogImageUrl,
      apple: settings?.profilePhotoUrl || ogImageUrl,
    },
    description: `Read the latest articles from ${name} about technology, cloud, and engineering.`,
    authors: [{ name, url: BASE_URL }],
    creator: name,
    openGraph: {
      type: 'website',
      locale: locale === 'id' ? 'id_ID' : 'en_US',
      alternateLocale: locale === 'id' ? 'en_US' : 'id_ID',
      url: `${BASE_URL}/${locale}/blog`,
      siteName: `${name} Portfolio`,
      title: fullTitle,
      images: ogImages,
    },
    twitter: {
      card: 'summary',
      title: fullTitle,
      images: ogImages.map((img) => img.url),
    },
  };
}

export default async function BlogArticleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const { settings, socialLinks } = await getData()
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div className="min-h-screen bg-[var(--bg-primary)] relative">
        <ParticleBackground />
        <BlogLayoutClient settings={settings} socialLinks={socialLinks}>
          {children}
        </BlogLayoutClient>
      </div>
    </NextIntlClientProvider>
  )
}
