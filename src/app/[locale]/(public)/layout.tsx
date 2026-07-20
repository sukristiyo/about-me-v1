import { prisma } from '@/lib/prisma'
import PublicLayoutClient from '@/components/layout/PublicLayoutClient'
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ReactNode } from 'react';

async function getData() {
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
  const fullTitle = `${name} — ${subtitle}`;
  
  const aboutText = (isId ? settings?.aboutTextId : settings?.aboutTextEn) || settings?.aboutTextEn || '';
  const description = aboutText 
    ? (aboutText.length > 150 ? aboutText.substring(0, 150) + '...' : aboutText)
    : `Personal portfolio of ${name} — IT professional specializing in DevOps, Site Reliability Engineering, Cloud Infrastructure, and Data Center management.`;

  const BASE_URL = 'https://sukristiyo.my.id';
  const ogImageUrl = `${BASE_URL}/api/og`;
  const ogImages = [{ url: ogImageUrl, width: 400, height: 400, alt: 'Portfolio OG Image' }];

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: fullTitle,
      template: `%s | ${name}`,
    },
    icons: {
      icon: settings?.profilePhotoUrl || ogImageUrl,
      apple: settings?.profilePhotoUrl || ogImageUrl,
    },
    description,
    keywords: [name, 'DevOps Engineer', 'SRE', 'Cloud Engineer', 'Data Center', 'Portfolio'],
    authors: [{ name, url: BASE_URL }],
    creator: name,
    openGraph: {
      type: 'website',
      locale: locale === 'id' ? 'id_ID' : 'en_US',
      alternateLocale: locale === 'id' ? 'en_US' : 'id_ID',
      url: `${BASE_URL}/${locale}`,
      siteName: `${name} Portfolio`,
      title: fullTitle,
      description,
      images: ogImages,
    },
    twitter: {
      card: 'summary',
      title: fullTitle,
      description,
      images: ogImages.map((img) => img.url),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function PublicLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{locale: string}>;
}) {
  const { locale } = await params;
  const { settings, socialLinks } = await getData()
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <PublicLayoutClient settings={settings} socialLinks={socialLinks}>
        {children}
      </PublicLayoutClient>
    </NextIntlClientProvider>
  )
}
