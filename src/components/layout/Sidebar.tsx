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
      className={`glass rounded-3xl overflow-hidden ${mobile ? 'p-5' : 'p-6'}`}
    >
      {/* Profile Section */}
      {!mobile && (
        <motion.div variants={itemVariants} className="flex flex-col items-center text-center mb-6">
          {/* Avatar */}
          <div className="relative mb-4">
            <motion.div
              animate={{ y: [0, -4, 0] }}
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
                <div className="w-full h-full bg-gradient-to-br from-amber-400 via-[var(--gold)] to-amber-700 flex items-center justify-center">
                  <span className="text-4xl font-outfit font-bold text-[#0f0f1a]">
                    {name.charAt(0)}
                  </span>
                </div>
              )}
            </motion.div>
            {/* Online indicator */}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[var(--bg-secondary)]" />
          </div>

          {/* Name */}
          <motion.h1
            variants={itemVariants}
            className="font-outfit text-xl font-bold text-[var(--foreground)] mb-1 animate-shimmer"
          >
            {name}
          </motion.h1>

          {/* Subtitle badge */}
          <motion.div variants={itemVariants}>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[var(--gold-muted)] text-[var(--gold)] border border-[var(--gold)]/20">
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
          // Use localized value if available
          if (locale === 'id') {
            const localizedValue = settings?.[`${key}Id` as keyof SiteSettings] as string | undefined | null
            if (localizedValue) {
              value = localizedValue
            }
          }
          
          if (!value) return null

          return (
            <div key={key} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--gold-muted)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-[var(--gold)]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[var(--muted-foreground)] font-medium uppercase tracking-wide mb-0.5">
                  {t(key)}
                </p>
                {isLink ? (
                  <a
                    href={isLink(value)}
                    className="text-sm text-[var(--foreground)] hover:text-[var(--gold)] transition-colors truncate block"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="text-sm text-[var(--foreground)] truncate">{value}</p>
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
        <motion.div variants={itemVariants}>
          <p className="text-xs text-[var(--muted-foreground)] font-medium uppercase tracking-wide mb-3">
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
                  className="group w-9 h-9 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--gold)] hover:border-[var(--gold)]/40 hover:bg-[var(--gold-muted)] transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </Link>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Download CV Button */}
      {/* We always show this section because we have the Generate PDF option */}
      <motion.div variants={itemVariants} className="border-t border-[var(--border)] my-5" />
      <motion.div variants={itemVariants}>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-[var(--gold)] text-white font-medium hover:opacity-90 hover:-translate-y-0.5 shadow-lg shadow-[var(--gold)]/20 transition-all duration-300"
          >
            <LucideIcons.Download className="w-5 h-5" />
            <span>{isId ? 'Unduh CV' : 'Download CV'}</span>
            <LucideIcons.ChevronDown className="w-4 h-4 ml-1 opacity-70" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-[calc(100%-48px)] max-w-[240px] rounded-xl border-[var(--border)] bg-[var(--card)] p-2 shadow-xl" sideOffset={8}>
            {settings?.cvUrl && (
              <a href={settings.cvUrl} target="_blank" rel="noopener noreferrer" className="outline-none">
                <DropdownMenuItem className="rounded-lg cursor-pointer py-3 px-3 hover:bg-[var(--accent)] focus:bg-[var(--accent)] flex items-center gap-3 w-full">
                  <div className="p-2 bg-[var(--gold)]/10 text-[var(--gold)] rounded-lg">
                    <LucideIcons.FileUp className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-[var(--foreground)]">{isId ? 'File CV Asli' : 'Original CV File'}</span>
                    <span className="text-[10px] text-[var(--muted-foreground)]">{isId ? 'Manual upload CV' : 'Manually uploaded CV'}</span>
                  </div>
                </DropdownMenuItem>
              </a>
            )}
            <Link href={`/${locale}/cv-print`} target="_blank" className="outline-none">
              <DropdownMenuItem className="rounded-lg cursor-pointer py-3 px-3 hover:bg-[var(--accent)] focus:bg-[var(--accent)] flex items-center gap-3 w-full">
                <div className="p-2 bg-[var(--gold)]/10 text-[var(--gold)] rounded-lg">
                  <LucideIcons.Printer className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-[var(--foreground)]">{isId ? 'CV Otomatis (A4)' : 'Generated CV (A4)'}</span>
                  <span className="text-[10px] text-[var(--muted-foreground)]">{isId ? 'Dibuat dari profil website' : 'Generated from profile data'}</span>
                </div>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
    </motion.div>
  )
}
