import type { Metadata } from 'next'
import { Inter, Outfit, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { prisma } from '@/lib/prisma'

export const revalidate = 3600 // Cache pages for 1 hour to fix high TTFB

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})
import { Toaster } from '@/components/ui/sonner'

const BASE_URL = 'https://sukristiyo.my.id'

// Metadata is now handled dynamically in [locale]/layout.tsx for localization

import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import NextTopLoader from 'nextjs-toploader'

import { ThemeProvider } from '@/components/layout/ThemeProvider'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let settings;
  try {
    settings = await prisma.siteSettings.findFirst();
  } catch (error) {
    console.error("Failed to fetch settings for layout:", error);
  }
  const name = settings?.nameEn || 'Sukristiyo';
  const subtitle = settings?.subtitleEn || 'DevOps, SRE & Cloud Engineer';

  const sameAsUrls = [
    settings?.githubUrl,
    settings?.linkedinUrl,
    settings?.twitterUrl,
    settings?.instagramUrl,
    settings?.facebookUrl,
  ].filter(Boolean) as string[];

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} antialiased transition-colors duration-500`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
        >
          <NextTopLoader color="var(--gold)" showSpinner={false} />
          {children}
          <Analytics />
          <SpeedInsights />
          <Toaster
            richColors
            position="bottom-right"
          />
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": name,
              "url": "https://sukristiyo.my.id",
              "jobTitle": subtitle,
              "sameAs": sameAsUrls.length > 0 ? sameAsUrls : [
                "https://github.com/sukristiyo",
                "https://www.linkedin.com/in/sukristiyo/"
              ]
            })
          }}
        />
      </body>
    </html>
  )
}
