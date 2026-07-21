import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import CVPrintClient from '@/components/public/resume/CVPrintClient'

export const metadata: Metadata = {
  title: 'Print Resume',
  robots: {
    index: false,
    follow: false,
  }
}

async function getResumeData() {
  try {
    const [settings, education, experience, technologies, portfolio] = await Promise.all([
      prisma.siteSettings.findFirst(),
      prisma.resumeEducation.findMany({
        orderBy: { order: 'asc' },
      }),
      prisma.resumeExperience.findMany({
        orderBy: { order: 'asc' },
      }),
      prisma.technology.findMany({
        orderBy: { order: 'asc' },
      }),
      prisma.portfolioProject.findMany({
        orderBy: { order: 'asc' },
      }),
    ])
    return { settings, education, experience, technologies, portfolio }
  } catch {
    return { settings: null, education: [], experience: [], technologies: [], portfolio: [] }
  }
}

export default async function CVPrintPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const { settings, education, experience, technologies, portfolio } = await getResumeData()

  return (
    <CVPrintClient 
      settings={settings}
      education={education} 
      experience={experience} 
      technologies={technologies}
      portfolio={portfolio}
      locale={locale}
    />
  )
}
