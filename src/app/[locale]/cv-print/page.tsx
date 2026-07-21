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
    const [settings, education, experience, technologies] = await Promise.all([
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
    ])
    return { settings, education, experience, technologies }
  } catch {
    return { settings: null, education: [], experience: [], technologies: [] }
  }
}

export default async function CVPrintPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const { settings, education, experience, technologies } = await getResumeData()

  return (
    <CVPrintClient 
      settings={settings}
      education={education} 
      experience={experience} 
      technologies={technologies}
      locale={locale}
    />
  )
}
