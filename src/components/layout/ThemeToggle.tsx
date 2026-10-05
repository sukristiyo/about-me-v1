'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-10 h-10" />

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--icon-bg)] border border-[var(--border)] hover:bg-[var(--gold-muted)] hover:border-[var(--gold)]/40 hover:text-[var(--gold)] transition-all duration-200 group"
      aria-label="Toggle theme"
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-[var(--gold)] transition-colors" />
      ) : (
        <Moon className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-[var(--gold)] transition-colors" />
      )}
    </button>
  )
}
