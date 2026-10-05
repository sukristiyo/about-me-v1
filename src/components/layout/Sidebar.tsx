'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Mail,
  Phone,
  Calendar,
  MapPin,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import type { SiteSettings, SocialLink } from '@prisma/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { trackEvent } from '@/lib/analytics'

interface SidebarProps {
  settings: SiteSettings | null
  socialLinks: SocialLink[]
  mobile?: boolean
}

const contactItems = [
  { key: 'email', icon: Mail, isLink: (val: string) => `mailto:${val}` },
  { key: 'phone', icon: Phone, isLink: (val: string) => `tel:${val}` },
  { key: 'birthDate', icon: Calendar, isLink: null },
  { key: 'location', icon: MapPin, isLink: null },
] as const

export default function Sidebar({ settings, socialLinks, mobile = false }: SidebarProps) {
  const locale = useLocale()
  const t = useTranslations('Sidebar')
  const isId = locale === 'id'

  const name = isId ? (settings?.nameId || settings?.nameEn || 'Sukristiyo') : (settings?.nameEn || 'Sukristiyo')
  const subtitle = isId ? (settings?.subtitleId || settings?.subtitleEn || 'DevOps · SRE · Cloud Engineer · Data Center') : (settings?.subtitleEn || 'DevOps · SRE · Cloud Engineer · Data Center')
  const profilePhoto = settings?.profilePhotoUrl

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`glass rounded-3xl overflow-hidden ${mobile ? '' : ''}`}
    >
      {/* Gradient accent bar at top */}
      {!mobile && (
        <div className="h-1.5 w-full bg-gradient-to-r from-[var(--gold)] via-[oklch(0.70_0.18_280)] to-[var(--gold-hover)]" />
      )}

      <div className={mobile ? 'p-5' : 'p-6'}>
        {/* Profile Section */}
        {!mobile && (
          <motion.div variants={itemVariants} className="flex flex-col items-center text-center mb-6 pt-2">
            {/* Avatar */}
            <div className="relative mb-4">
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-[var(--gold)] glow-gold"
              >
                {profilePhoto ? (
                  <Image
                    src={profilePhoto}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--gold)] via-[oklch(0.60_0.18_280)] to-[oklch(0.45_0.15_255)] flex items-center justify-center">
                    <span className="text-4xl font-outfit font-bold text-white/90">
                      {name.charAt(0)}
                    </span>
                  </div>
                )}
              </motion.div>
              {/* Online indicator with pulse */}
              <span className="pulse-dot absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[var(--bg-secondary)]" />
            </div>

            {/* Name */}
            <motion.h1
              variants={itemVariants}
              className="font-outfit text-xl font-bold text-[var(--foreground)] mb-2 animate-shimmer"
            >
              {name}
            </motion.h1>

            {/* Subtitle badge */}
            <motion.div variants={itemVariants}>
              <span className="inline-block px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--gold-muted)] text-[var(--gold)] border border-[var(--gold)]/20 tracking-wide">
                {subtitle}
              </span>
            </motion.div>
          </motion.div>
        )}

        {/* Divider */}
        {!mobile && (
          <motion.div variants={itemVariants} className="border-t border-[var(--border)] mb-5" />
        )}

        {/* Contact Info */}
        <motion.div variants={itemVariants} className="space-y-3 mb-5">
          {contactItems.map(({ key, icon: Icon, isLink }) => {
            let value = settings?.[key as keyof SiteSettings] as string | undefined | null
            if (locale === 'id') {
              const localizedValue = settings?.[`${key}Id` as keyof SiteSettings] as string | undefined | null
              if (localizedValue) value = localizedValue
            }
            if (!value) return null

            return (
              <div key={key} className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-[var(--icon-bg)] flex items-center justify-center flex-shrink-0 transition-colors duration-200 group-hover:bg-[var(--gold-muted)]">
                  <Icon className="w-4 h-4 text-[var(--gold)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-[var(--muted-foreground)] font-semibold uppercase tracking-widest mb-0.5">
                    {t(key)}
                  </p>
                  {isLink ? (
                    <a
                      href={isLink(value)}
                      className="text-sm text-[var(--foreground)] hover:text-[var(--gold)] transition-colors truncate block font-medium"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-sm text-[var(--foreground)] truncate font-medium">{value}</p>
                  )}
                </div>
              </div>
            )
          })}
        </motion.div>

        {/* Divider */}
        <motion.div variants={itemVariants} className="border-t border-[var(--border)] mb-5" />

        {/* Social Media */}
        {socialLinks.length > 0 && (
          <motion.div variants={itemVariants} className="mb-1">
            <p className="text-[10px] text-[var(--muted-foreground)] font-semibold uppercase tracking-widest mb-3">
              {t('socialMedia')}
            </p>
            <div className="flex gap-2 flex-wrap">
              {socialLinks.map((link) => {
                const Icon = (LucideIcons as any)[link.iconName] || LucideIcons.Link
                return (
                  <Link
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.platform}
                    className="group w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--icon-bg)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--gold)] hover:border-[var(--gold)]/40 hover:bg-[var(--gold-muted)] transition-all duration-200 hover:scale-110"
                  >
                    <Icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Download CV Button */}
        <motion.div variants={itemVariants} className="border-t border-[var(--border)] my-5" />
        <motion.div variants={itemVariants}>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="group flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-sm text-white transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2"
              style={{
                background: 'linear-gradient(135deg, var(--gold) 0%, oklch(0.55 0.18 280) 100%)',
                boxShadow: '0 4px 20px var(--gold-muted), 0 2px 8px oklch(0.50 0.17 255 / 20%)',
              }}
            >
              <LucideIcons.Download className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" />
              <span>{isId ? 'Unduh CV' : 'Download CV'}</span>
              <LucideIcons.ChevronDown className="w-4 h-4 ml-auto opacity-70 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-(--anchor-width) rounded-xl border-[var(--border)] bg-[var(--card)] p-1.5 shadow-xl" sideOffset={8}>
              {settings?.cvUrl && (
                <a
                  href={settings.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('cv_download', { type: 'original' })}
                  className="outline-none block mb-1 last:mb-0"
                >
                  <DropdownMenuItem className="rounded-lg cursor-pointer py-2.5 px-3 hover:bg-[var(--accent)] focus:bg-[var(--accent)] flex items-center gap-3 w-full">
                    <div className="p-1.5 bg-[var(--gold-muted)] text-[var(--gold)] rounded-lg shrink-0">
                      <LucideIcons.FileUp className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-[var(--foreground)] text-sm leading-none">{isId ? 'File CV Asli' : 'Original CV'}</span>
                      <span className="text-[10px] text-[var(--muted-foreground)] leading-none mt-1">{isId ? 'Upload manual' : 'Manual upload'}</span>
                    </div>
                  </DropdownMenuItem>
                </a>
              )}
              <Link
                href={`/${locale}/cv-print`}
                target="_blank"
                onClick={() => trackEvent('cv_download', { type: 'generated' })}
                className="outline-none block"
              >
                <DropdownMenuItem className="rounded-lg cursor-pointer py-2.5 px-3 hover:bg-[var(--accent)] focus:bg-[var(--accent)] flex items-center gap-3 w-full">
                  <div className="p-1.5 bg-[var(--gold-muted)] text-[var(--gold)] rounded-lg shrink-0">
                    <LucideIcons.Printer className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-[var(--foreground)] text-sm leading-none">{isId ? 'CV Otomatis' : 'Generated CV'}</span>
                    <span className="text-[10px] text-[var(--muted-foreground)] leading-none mt-1">{isId ? 'Dari profil website' : 'From profile data'}</span>
                  </div>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </div>
    </motion.div>
  )
}
