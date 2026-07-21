'use client'

import { useEffect } from 'react'
import type { SiteSettings, ResumeEducation, ResumeExperience, Technology } from '@prisma/client'

interface CVPrintProps {
  settings: SiteSettings | null
  education: ResumeEducation[]
  experience: ResumeExperience[]
  technologies: Technology[]
  locale: string
}

export default function CVPrintClient({ settings, education, experience, technologies, locale }: CVPrintProps) {
  useEffect(() => {
    // Automatically trigger print dialog when component mounts
    // Add a small delay to ensure fonts and styles are loaded
    const timer = setTimeout(() => {
      window.print()
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  const isId = locale === 'id'
  const name = isId ? settings?.nameId || settings?.nameEn : settings?.nameEn
  const subtitle = isId ? settings?.subtitleId || settings?.subtitleEn : settings?.subtitleEn
  const aboutText = isId ? settings?.aboutTextId || settings?.aboutTextEn : settings?.aboutTextEn

  return (
    <div className="bg-white min-h-screen text-black font-inter selection:bg-gray-200">
      <div className="max-w-[210mm] mx-auto p-[20mm] bg-white print:p-0 print:m-0">
        
        {/* Header */}
        <header className="border-b-2 border-gray-800 pb-6 mb-6">
          <h1 className="text-4xl font-bold font-outfit text-gray-900 mb-2">{name}</h1>
          <h2 className="text-xl text-gray-700 font-medium mb-4">{subtitle}</h2>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
            {settings?.email && <span className="flex items-center gap-1">✉ {settings.email}</span>}
            {settings?.phone && <span className="flex items-center gap-1">☎ {settings.phone}</span>}
            {settings?.location && <span className="flex items-center gap-1">📍 {isId ? settings.locationId || settings.location : settings.location}</span>}
            {settings?.linkedinUrl && <span className="flex items-center gap-1">🔗 linkedin.com/in/sukristiyo</span>}
          </div>
        </header>

        {/* About */}
        {aboutText && (
          <section className="mb-8">
            <h3 className="text-lg font-bold font-outfit text-gray-900 border-b border-gray-300 pb-1 mb-3 uppercase tracking-wider">{isId ? 'Profil' : 'Profile'}</h3>
            <p className="text-sm text-gray-700 leading-relaxed text-justify whitespace-pre-wrap">{aboutText}</p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section className="mb-8">
            <h3 className="text-lg font-bold font-outfit text-gray-900 border-b border-gray-300 pb-1 mb-4 uppercase tracking-wider">{isId ? 'Pengalaman Kerja' : 'Experience'}</h3>
            <div className="space-y-6">
              {experience.map((exp) => {
                const desc = isId ? exp.descriptionId || exp.descriptionEn : exp.descriptionEn
                return (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="text-base font-bold text-gray-900">{exp.position}</h4>
                      <span className="text-sm font-medium text-gray-600 whitespace-nowrap ml-4">
                        {exp.startDate} — {exp.endDate || (isId ? 'Sekarang' : 'Present')}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-2">{exp.company}</div>
                    {desc && <p className="text-sm text-gray-700 mb-2 whitespace-pre-wrap leading-relaxed">{desc}</p>}
                    {exp.responsibilities.length > 0 && (
                      <ul className="list-disc list-outside ml-4 space-y-1">
                        {exp.responsibilities.map((resp, i) => (
                          <li key={i} className="text-sm text-gray-700 leading-relaxed pl-1">{resp}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section className="mb-8">
            <h3 className="text-lg font-bold font-outfit text-gray-900 border-b border-gray-300 pb-1 mb-4 uppercase tracking-wider">{isId ? 'Pendidikan' : 'Education'}</h3>
            <div className="space-y-4">
              {education.map((edu) => {
                const desc = isId ? edu.descriptionId || edu.descriptionEn : edu.descriptionEn
                return (
                  <div key={edu.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="text-base font-bold text-gray-900">{edu.institution}</h4>
                      <span className="text-sm font-medium text-gray-600 whitespace-nowrap ml-4">
                        {edu.startYear} — {edu.endYear || (isId ? 'Sekarang' : 'Present')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 font-medium mb-1">{edu.degree} — {edu.field}</div>
                    {desc && <p className="text-sm text-gray-700 leading-relaxed">{desc}</p>}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Skills */}
        {technologies.length > 0 && (
          <section className="mb-8">
            <h3 className="text-lg font-bold font-outfit text-gray-900 border-b border-gray-300 pb-1 mb-3 uppercase tracking-wider">{isId ? 'Keahlian' : 'Skills & Technologies'}</h3>
            <div className="flex flex-wrap gap-2 text-sm text-gray-700 font-medium">
              {technologies.map((tech, i) => (
                <span key={tech.id}>
                  {tech.name}{i < technologies.length - 1 ? <span className="text-gray-300 mx-2">•</span> : ''}
                </span>
              ))}
            </div>
          </section>
        )}

      </div>
      
      {/* Global Print Styles override */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          @page {
            margin: 15mm;
            size: A4 portrait;
          }
        }
      `}</style>
    </div>
  )
}
