import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import PortfolioClient from '@/components/public/portfolio/PortfolioClient'

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Explore recent projects, web applications, and infrastructure implementations by Sukristiyo.',
}

async function getPortfolioProjects() {
  try {
    const projects = await prisma.portfolioProject.findMany({
      orderBy: [
        { order: 'asc' },
        { year: 'desc' },
      ],
    })
    return projects
  } catch {
    return []
  }
}

export default async function PortfolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const projects = await getPortfolioProjects()

  const siteUrl = 'https://sukristiyo.my.id'
  const isId = locale === 'id'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: isId ? 'Portofolio | Sukristiyo' : 'Portfolio | Sukristiyo',
    description: isId 
      ? 'Jelajahi proyek terbaru, aplikasi web, dan implementasi infrastruktur oleh Sukristiyo.' 
      : 'Explore recent projects, web applications, and infrastructure implementations by Sukristiyo.',
    url: `${siteUrl}/${locale}/portfolio`,
    hasPart: projects.map(project => ({
      '@type': 'CreativeWork',
      name: project.title,
      description: isId ? project.descriptionId || project.descriptionEn : project.descriptionEn,
      image: project.thumbnailUrl || undefined,
      url: project.liveUrl || project.repoUrl || `${siteUrl}/${locale}/portfolio`,
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PortfolioClient projects={projects} />
    </>
  )
}
