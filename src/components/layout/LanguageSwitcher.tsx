'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: string) {
    if (newLocale === locale) return;
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className="w-9 h-9 rounded-xl bg-[var(--icon-bg)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--gold-muted)] hover:border-[var(--gold)]/40 hover:text-[var(--gold)] transition-all duration-200 outline-none focus-visible:ring-1 focus-visible:ring-ring group"
        aria-label="Change language"
      >
        <Globe className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--gold)] transition-colors" />
        <span className="sr-only">Toggle language</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => switchLocale('en')} className={locale === 'en' ? 'bg-primary/10 text-primary font-medium' : ''}>
          English (EN)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchLocale('id')} className={locale === 'id' ? 'bg-primary/10 text-primary font-medium' : ''}>
          Bahasa Indonesia (ID)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
