'use client'

import { Link, usePathname } from '@/navigation'
import { motion } from 'framer-motion'
import { User, FileText, Briefcase, BookOpen, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'

const tabs = [
  { href: '/about', key: 'about', icon: User },
  { href: '/resume', key: 'resume', icon: FileText },
  { href: '/portfolio', key: 'portfolio', icon: Briefcase },
  { href: '/blog', key: 'blog', icon: BookOpen },
  { href: '/contact', key: 'contact', icon: Mail },
]

import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'

export default function TabNav() {
  const pathname = usePathname()
  const t = useTranslations('Navigation')

  return (
    <nav
      className="glass rounded-2xl p-1.5 flex items-center justify-between gap-2"
      role="navigation"
      aria-label="Main navigation"
    >
      <ul className="flex flex-1 gap-1 justify-center">
        {tabs.map(({ href, key, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`)

          return (
            <li key={href} className="flex-1 sm:flex-initial">
              <Link
                href={href as any}
                aria-label={t(key as any)}
                className={`
                  relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2
                  px-2 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium
                  transition-colors duration-200 w-full
                  ${isActive
                    ? 'text-[var(--gold)]'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-0 rounded-xl bg-[var(--gold-muted)] border border-[var(--gold)]/20"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}

                <Icon className={`relative w-4 h-4 flex-shrink-0 ${isActive ? 'text-[var(--gold)]' : ''}`} />
                <span className="relative hidden xs:block sm:block">{t(key as any)}</span>
              </Link>
            </li>
          )
        })}
      </ul>
      
      <div className="flex-shrink-0 flex items-center gap-2 border-l border-[var(--border)] pl-2 ml-1">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </nav>
  )
}
