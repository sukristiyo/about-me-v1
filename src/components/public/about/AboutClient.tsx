'use client'

import { motion, Variants } from 'framer-motion'
import * as LucideIcons from 'lucide-react'
import type { SiteSettings, Testimonial, Service, Technology } from '@prisma/client'
import TestimonialSlider from './TestimonialSlider'
import { useLocale, useTranslations } from 'next-intl'

interface AboutClientProps {
  settings: SiteSettings | null
  testimonials: Testimonial[]
  services: Service[]
  technologies: Technology[]
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function AboutClient({ settings, testimonials, services, technologies }: AboutClientProps) {
  const locale = useLocale()
  const t = useTranslations('About')

  const aboutText = locale === 'id' 
    ? settings?.aboutTextId || settings?.aboutTextEn || ''
    : settings?.aboutTextEn || ''

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* ── About Bio Section (Clean & Minimalist) ── */}
      <motion.section variants={itemVariants}>
        <div className="glass rounded-3xl p-6 sm:p-9 border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--gold)]" />
            <h2 className="font-outfit text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              {t('title').split(' ')[0]} <span className="text-gradient-gold">{t('title').split(' ').slice(1).join(' ')}</span>
            </h2>
          </div>

          {aboutText ? (
            <p className="text-[var(--muted-foreground)] leading-relaxed text-sm sm:text-base whitespace-pre-wrap font-normal">
              {aboutText}
            </p>
          ) : (
            <p className="text-[var(--muted-foreground)] leading-relaxed text-sm italic opacity-60">
              {locale === 'id' ? 'Belum ada deskripsi.' : 'No description yet.'}
            </p>
          )}

          {/* Clean Tech Stack Pills */}
          {technologies.length > 0 && (
            <div className="mt-8 pt-6 border-t border-[var(--border)]">
              <p className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">
                {t('technologies')}
              </p>
              <div className="flex flex-wrap gap-2">
                {technologies.map((tech) => (
                  <span
                    key={tech.id}
                    className="px-3.5 py-1.5 text-xs rounded-xl bg-[var(--icon-bg)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--gold)]/40 hover:bg-[var(--gold-muted)] transition-all duration-200 cursor-default font-medium"
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.section>

      {/* ── Services Grid (Clean Minimal Cards) ── */}
      {services.length > 0 && (
        <motion.section variants={itemVariants}>
          <h2 className="font-outfit text-xl font-semibold text-[var(--foreground)] mb-5 flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-[var(--icon-bg)] border border-[var(--border)] flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--gold)]" />
            </span>
            {t('services')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((service) => {
              const Icon = (LucideIcons as any)[service.iconName] || LucideIcons.Check
              return (
                <motion.div
                  key={service.id}
                  variants={itemVariants}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className={`glass rounded-2xl p-5 sm:p-6 bg-gradient-to-br ${service.colorClass} border border-[var(--border)] card-hover cursor-default transition-all duration-300`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[var(--icon-bg)] border border-[var(--border)] flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Icon className={`w-5 h-5 ${service.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-outfit font-semibold text-[var(--foreground)] text-sm sm:text-base mb-1.5">
                        {locale === 'id' ? (service as any).titleId || service.title : service.title}
                      </h3>
                      <p className="text-[var(--muted-foreground)] text-xs sm:text-sm leading-relaxed break-words whitespace-pre-wrap">
                        {locale === 'id' ? (service as any).descriptionId || service.description : service.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.section>
      )}

      {/* ── Testimonials ── */}
      {testimonials.length > 0 && (
        <motion.section variants={itemVariants}>
          <h2 className="font-outfit text-xl font-semibold text-[var(--foreground)] mb-5 flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-[var(--icon-bg)] border border-[var(--border)] flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--gold)]" />
            </span>
            What People <span className="text-gradient-gold ml-1">Say</span>
          </h2>
          <TestimonialSlider testimonials={testimonials} />
        </motion.section>
      )}
    </motion.div>
  )
}
