'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BadgeCheck,
  MapPin,
  Share2,
  ExternalLink,
  ArrowUpRight,
  Sparkles,
  Cloud,
  Server,
  Terminal,
  Globe,
  FileText,
  Mail,
  Check,
  Briefcase,
  Layers,
  Shield,
  Zap,
} from 'lucide-react'
import {
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
} from 'lucide-react'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { trackEvent } from '@/lib/analytics'
import { toast } from 'sonner'
import type { SiteSettings, ShortLink, SocialLink } from '@prisma/client'

interface LinksClientProps {
  settings: SiteSettings | null
  links: ShortLink[]
  socialLinks: SocialLink[]
}

const iconMap: Record<string, any> = {
  Cloud,
  Server,
  Terminal,
  Globe,
  FileText,
  Briefcase,
  Layers,
  Shield,
  Zap,
  Sparkles,
}

export function LinksClient({ settings, links, socialLinks }: LinksClientProps) {
  const [copied, setCopied] = useState(false)

  const name = settings?.nameEn || 'Sukristiyo'
  const subtitle = settings?.subtitleEn || 'DevOps · SRE · Cloud Infrastructure Specialist'
  const location = settings?.location || 'Jakarta, Indonesia'
  const profilePhoto = settings?.profilePhotoUrl || '/images/my-avatar.png'

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : 'https://link.sukristiyo.site'
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} | Links & Curated Resources`,
          text: `Check out curated DevOps tools, cloud promotions, and official links by ${name}`,
          url,
        })
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleLinkClick = (link: ShortLink) => {
    trackEvent('affiliate_click', {
      slug: link.slug,
      title: link.title,
      targetUrl: link.targetUrl,
      source: 'lynk_hub',
    })
  }

  // Group links by category
  const categories = Array.from(new Set(links.map((l) => l.category || 'Curated Tools')))

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-muted/30 text-foreground flex flex-col items-center px-4 py-8 sm:py-12 selection:bg-primary/20">
      <div className="w-full max-w-lg space-y-6">
        {/* ── Top Utility Bar ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-mono font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            link.sukristiyo.site
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="h-9 w-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all shadow-sm"
              title="Share profile"
              aria-label="Share profile"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
            </button>
            <ThemeToggle />
          </div>
        </div>

        {/* ── Profile Bio Card (Lynk.id / Bento Style) ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-3.5 pt-2"
        >
          {/* Avatar with Glow Ring */}
          <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500 to-primary blur-md opacity-40 animate-pulse" />
            <div className="relative w-full h-full rounded-full p-1 bg-gradient-to-tr from-border via-border/40 to-primary/40">
              <div className="w-full h-full rounded-full overflow-hidden bg-muted relative">
                <Image
                  src={profilePhoto}
                  alt={name}
                  fill
                  sizes="(max-width: 640px) 96px, 112px"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Name & Verification Badge */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-1.5">
              <span>{name}</span>
              <BadgeCheck className="h-5 w-5 text-blue-500 shrink-0" fill="currentColor" />
            </h1>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Location Pill */}
          <div className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground/80 bg-muted/30 px-3 py-1 rounded-full border border-border/50">
            <MapPin className="h-3 w-3 text-primary" />
            <span>{location}</span>
          </div>

          {/* Social Icons Row */}
          <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
            {settings?.githubUrl && (
              <a
                href={settings.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-xl bg-card border border-border/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-muted/40 transition-all shadow-sm"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            )}
            {settings?.linkedinUrl && (
              <a
                href={settings.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-xl bg-card border border-border/80 flex items-center justify-center text-muted-foreground hover:text-blue-500 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all shadow-sm"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {settings?.email && (
              <a
                href={`mailto:${settings.email}`}
                className="h-9 w-9 rounded-xl bg-card border border-border/80 flex items-center justify-center text-muted-foreground hover:text-emerald-500 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all shadow-sm"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            )}
            {settings?.twitterUrl && (
              <a
                href={settings.twitterUrl}
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-xl bg-card border border-border/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-muted/40 transition-all shadow-sm"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
            )}
            {settings?.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-xl bg-card border border-border/80 flex items-center justify-center text-muted-foreground hover:text-pink-500 hover:border-pink-500/50 hover:bg-pink-500/10 transition-all shadow-sm"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            )}
          </div>
        </motion.div>

        {/* ── Official Profile Anchors (Portfolio & CV) ── */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <Link
            href="/en"
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-card border border-border/80 hover:border-primary/50 hover:bg-muted/30 transition-all text-xs font-semibold text-foreground shadow-sm group"
          >
            <Globe className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
            <span>Main Portfolio</span>
          </Link>

          {settings?.cvUrl ? (
            <a
              href={settings.cvUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent('cv_download', { type: 'lynk_profile' })}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-card border border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/10 transition-all text-xs font-semibold text-amber-500 shadow-sm group"
            >
              <FileText className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Download CV</span>
            </a>
          ) : (
            <Link
              href="/en/resume"
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-card border border-border/80 hover:border-primary/50 hover:bg-muted/30 transition-all text-xs font-semibold text-foreground shadow-sm group"
            >
              <FileText className="h-4 w-4 text-primary" />
              <span>View Resume</span>
            </Link>
          )}
        </div>

        {/* ── Curated Affiliate & Resource Link Cards ── */}
        <div className="space-y-4 pt-1">
          {categories.map((cat) => {
            const catLinks = links.filter((l) => (l.category || 'Curated Tools') === cat)
            if (catLinks.length === 0) return null

            return (
              <div key={cat} className="space-y-2.5">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                    {cat}
                  </span>
                  <div className="h-px flex-1 bg-border/50" />
                </div>

                <div className="space-y-2.5">
                  {catLinks.map((link, idx) => {
                    const IconComponent = iconMap[link.icon || ''] || Sparkles

                    return (
                      <motion.a
                        key={link.id}
                        href={`/go/${link.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleLinkClick(link)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-card border border-border/80 hover:border-primary/60 hover:shadow-md hover:shadow-primary/5 transition-all duration-200"
                      >
                        {/* Left: Icon & Text */}
                        <div className="flex items-center gap-3.5 min-w-0 pr-2">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                                {link.title}
                              </span>
                            </div>
                            {link.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[260px] sm:max-w-xs pt-0.5">
                                {link.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: Badge & Arrow */}
                        <div className="flex items-center gap-2 shrink-0">
                          {link.badge && (
                            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase">
                              {link.badge}
                            </span>
                          )}
                          <div className="h-8 w-8 rounded-full bg-muted/40 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center text-muted-foreground transition-all">
                            <ArrowUpRight className="h-4 w-4" />
                          </div>
                        </div>
                      </motion.a>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Footer ── */}
        <footer className="text-center pt-8 pb-4 space-y-2 border-t border-border/40">
          <p className="text-xs text-muted-foreground font-mono">
            {name} · DevOps, SRE & Cloud
          </p>
          <p className="text-[10px] text-muted-foreground/60">
            Powered by Next.js · Privacy-preserving & Direct Routing
          </p>
        </footer>
      </div>
    </div>
  )
}
