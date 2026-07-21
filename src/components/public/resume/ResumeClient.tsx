'use client'

import { motion, Variants } from 'framer-motion'
import { GraduationCap, Briefcase } from 'lucide-react'
import type { ResumeEducation, ResumeExperience } from '@prisma/client'
import { useLocale, useTranslations } from 'next-intl'

interface ResumeClientProps {
  education: ResumeEducation[]
  experience: ResumeExperience[]
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function ResumeClient({ education, experience }: ResumeClientProps) {
  const locale = useLocale()
  const t = useTranslations('Resume')

  return (
    <motion.div
      variants={containerVariants}
      className="max-w-4xl mx-auto space-y-12"
    >
      <div className="flex justify-end">
        <a
          href={`/${locale}/cv-print`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--gold)] text-white font-medium hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          {locale === 'id' ? 'Unduh CV (PDF)' : 'Download CV (PDF)'}
        </a>
      </div>

      {/* ── Education Timeline ── */}
      <section className="relative">
        <div className="flex items-center gap-6 mb-8 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-[#1e1e20] border border-[var(--border)] flex items-center justify-center shrink-0 shadow-md">
            <GraduationCap className="w-5 h-5 text-[var(--gold)]" />
          </div>
          <h2 className="font-outfit text-2xl font-bold text-[var(--foreground)]">{t('education')}</h2>
        </div>

        {/* Vertical Line */}
        <div className="absolute left-6 top-12 bottom-0 w-[1px] bg-[var(--border)]" />

        <div className="space-y-10 pb-4">
          {education.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className="relative pl-14"
            >
              {/* Timeline Dot */}
              <div className="absolute left-[18px] top-1.5 w-3 h-3 rounded-full bg-[var(--gold)] border-2 border-[#1e1e20] shadow-[0_0_0_4px_var(--background),0_0_15px_var(--gold)]" />
              
              {/* Content */}
              <div className="space-y-2">
                <h3 className="font-outfit text-lg font-bold text-[var(--foreground)] leading-tight">
                  {item.institution}
                </h3>
                <p className="text-[var(--gold)] font-medium text-sm">
                  {item.startYear} — {item.endYear || (locale === 'id' ? 'Sekarang' : 'Present')}
                </p>
                <div className="text-[var(--muted-foreground)] text-sm">
                  <span className="text-[var(--foreground)] opacity-90">{item.degree}</span> | {item.field}
                </div>
                {(locale === 'id' ? item.descriptionId || item.descriptionEn : item.descriptionEn) && (
                  <p className="text-[var(--muted-foreground)] text-sm leading-relaxed mt-2 whitespace-pre-wrap">
                    {locale === 'id' ? item.descriptionId || item.descriptionEn : item.descriptionEn}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Experience Timeline ── */}
      <section className="relative">
        <div className="flex items-center gap-6 mb-8 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-[#1e1e20] border border-[var(--border)] flex items-center justify-center shrink-0 shadow-md">
            <Briefcase className="w-5 h-5 text-[var(--gold)]" />
          </div>
          <h2 className="font-outfit text-2xl font-bold text-[var(--foreground)]">{t('experience')}</h2>
        </div>

        {/* Vertical Line */}
        <div className="absolute left-6 top-12 bottom-0 w-[1px] bg-[var(--border)]" />

        <div className="space-y-10 pb-4">
          {experience.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className="relative pl-14"
            >
              {/* Timeline Dot */}
              <div className="absolute left-[18px] top-1.5 w-3 h-3 rounded-full bg-[var(--gold)] border-2 border-[#1e1e20] shadow-[0_0_0_4px_var(--background),0_0_15px_var(--gold)]" />
              
              {/* Content */}
              <div className="space-y-2">
                <h3 className="font-outfit text-lg font-bold text-[var(--foreground)] leading-tight">
                  {item.position}
                </h3>
                <p className="text-[var(--gold)] font-medium text-sm">
                  {item.startDate} — {item.endDate || (locale === 'id' ? 'Sekarang' : 'Present')}
                </p>
                <div className="text-[var(--muted-foreground)] text-sm">
                  <span className="text-[var(--foreground)] font-medium opacity-90">{item.company}</span>
                </div>
                
                {(locale === 'id' ? item.descriptionId || item.descriptionEn : item.descriptionEn) && (
                  <p className="text-[var(--muted-foreground)] text-sm leading-relaxed mt-2 whitespace-pre-wrap">
                    {locale === 'id' ? item.descriptionId || item.descriptionEn : item.descriptionEn}
                  </p>
                )}

                {item.responsibilities.length > 0 && (
                  <ul className="space-y-1.5 mt-3">
                    {item.responsibilities.map((resp, i) => (
                      <li key={i} className="text-[var(--muted-foreground)] text-sm flex items-start gap-2">
                        <span className="text-[var(--gold)] mt-1.5 text-[10px]">•</span>
                        <span className="flex-1">{resp}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  )
}
