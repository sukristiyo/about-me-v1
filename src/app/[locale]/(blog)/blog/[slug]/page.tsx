import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import BlogDetailClient from '@/components/public/blog/BlogDetailClient'
import { estimateReadingTime } from '@/lib/utils'

import { cache } from 'react'

export const dynamic = 'force-dynamic'
// Vercel function timeout 30s — gives Neon DB time to wake up on cold start
export const maxDuration = 30

interface PageProps {
  params: Promise<{ slug: string; locale: string }>
}

// React cache deduplicates the DB call across generateMetadata + page render
const getBlogPost = cache(async (slug: string) => {
  for (let i = 0; i <= 3; i++) {
    try {
      const post = await prisma.blogPost.findUnique({ where: { slug } })
      if (!post || post.status !== 'published') return null
      return post
    } catch (err) {
      if (i < 3) {
        // Progressive backoff: 1s, 2s, 3s — for Neon cold start
        await new Promise((r) => setTimeout(r, (i + 1) * 1000))
      } else {
        console.error('[getBlogPost] DB error after retries:', err)
        return null
      }
    }
  }
  return null
})

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    return {
      title: 'Blog | Sukristiyo',
      openGraph: { title: 'Blog | Sukristiyo', siteName: 'Sukristiyo Portfolio' },
    }
  }

  const title = locale === 'id' ? post.titleId || post.title : post.title
  const description = locale === 'id' ? post.excerptId || post.excerptEn : post.excerptEn

  const siteUrl = 'https://sukristiyo.my.id'
  const postUrl = `${siteUrl}/${locale}/blog/${slug}`
  const ogImage = post.thumbnailUrl
    ? [{ url: post.thumbnailUrl, width: 1200, height: 630, alt: title }]
    : []

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: postUrl,
      siteName: 'Sukristiyo Portfolio',
      locale: locale === 'id' ? 'id_ID' : 'en_US',
      publishedTime: post.publishedAt?.toISOString(),
      authors: ['Sukristiyo'],
      images: ogImage,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.thumbnailUrl ? [post.thumbnailUrl] : [],
    },
  }
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug, locale } = await params
  const post = await getBlogPost(slug)

  if (!post) notFound()

  // Calculate reading time based on locale
  const content = locale === 'id' ? post.contentId || post.contentEn : post.contentEn
  const readingTime = estimateReadingTime(content)

  // Serialize Date fields to strings for client component compatibility
  const serializedPost = {
    ...post,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  }

  const title = locale === 'id' ? post.titleId || post.title : post.title
  const description = locale === 'id' ? post.excerptId || post.excerptEn : post.excerptEn
  const siteUrl = 'https://sukristiyo.my.id'
  const postUrl = `${siteUrl}/${locale}/blog/${slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    image: post.thumbnailUrl ? [post.thumbnailUrl] : [],
    datePublished: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: [{
      '@type': 'Person',
      name: 'Sukristiyo',
      url: siteUrl
    }]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogDetailClient post={serializedPost} readingTime={readingTime} />
    </>
  )
}
