import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sukristiyo.my.id'
  const locales = ['en', 'id']

  // Get all published blog posts
  let blogUrls: MetadataRoute.Sitemap = []
  
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true }
    })

    blogUrls = posts.flatMap((post) => 
      locales.map(locale => ({
        url: `${baseUrl}/${locale}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    )
  } catch (error) {
    console.error('Failed to fetch blog posts for sitemap:', error)
  }

  const staticPaths = ['', '/about', '/portfolio', '/resume', '/blog', '/contact']
  
  const staticRoutes = staticPaths.flatMap((route) => 
    locales.map(locale => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: route === '' ? 1 : 0.8,
    }))
  )

  return [...staticRoutes, ...blogUrls]
}
