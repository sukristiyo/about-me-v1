'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Link2,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit,
  MousePointerClick,
  TrendingUp,
  Search,
  RefreshCw,
  Globe2,
  Sparkles,
  Smartphone,
  Cloud,
  Server,
  Terminal,
  Globe,
  FileText,
  Briefcase,
  Layers,
  Shield,
  Zap,
  UserCheck,
  Save,
  BadgeCheck,
} from 'lucide-react'
import { toast } from 'sonner'

interface ShortLink {
  id: string
  title: string
  slug: string
  targetUrl: string
  description: string | null
  category: string
  badge: string | null
  icon: string | null
  order: number
  clicks: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface LynkProfileData {
  id?: string
  displayName: string
  tagline: string
  bio: string
  avatarUrl: string
  location: string
  verifiedBadge: boolean
  showMainPortfolio: boolean
  mainPortfolioLabel: string
  mainPortfolioUrl: string
  showDownloadCv: boolean
  downloadCvLabel: string
  downloadCvUrl: string
  customCtaLabel: string
  customCtaUrl: string
}

const availableIcons = [
  { name: 'Cloud', label: 'Cloud / VPS', icon: Cloud },
  { name: 'Server', label: 'Server / Infra', icon: Server },
  { name: 'Terminal', label: 'Terminal / CLI', icon: Terminal },
  { name: 'Globe', label: 'Web / Domain', icon: Globe },
  { name: 'FileText', label: 'Docs / Guide', icon: FileText },
  { name: 'Briefcase', label: 'Service / Tool', icon: Briefcase },
  { name: 'Layers', label: 'Framework', icon: Layers },
  { name: 'Shield', label: 'Security', icon: Shield },
  { name: 'Zap', label: 'Performance', icon: Zap },
  { name: 'Sparkles', label: 'Promo / Special', icon: Sparkles },
]

export default function ShortLinksPage() {
  const [links, setLinks] = useState<ShortLink[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [urlFormat, setUrlFormat] = useState<'subdomain' | 'path'>('subdomain')

  // LynkProfile state
  const [profileLoading, setProfileLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profile, setProfile] = useState<LynkProfileData>({
    displayName: '',
    tagline: '',
    bio: '',
    avatarUrl: '',
    location: '',
    verifiedBadge: true,
    showMainPortfolio: true,
    mainPortfolioLabel: 'Main Portfolio',
    mainPortfolioUrl: '/en',
    showDownloadCv: true,
    downloadCvLabel: 'Download CV',
    downloadCvUrl: '',
    customCtaLabel: '',
    customCtaUrl: '',
  })

  // Dialog state for short links
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<ShortLink | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form fields for short link
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [targetUrl, setTargetUrl] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Cloud & Hosting')
  const [badge, setBadge] = useState('')
  const [icon, setIcon] = useState('Cloud')
  const [order, setOrder] = useState(0)
  const [isActive, setIsActive] = useState(true)

  const fetchLinks = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/links')
      if (res.ok) {
        const data = await res.json()
        setLinks(data.links || [])
      } else {
        toast.error('Failed to load short links')
      }
    } catch {
      toast.error('Network error loading links')
    } finally {
      setLoading(false)
    }
  }

  const fetchProfile = async () => {
    setProfileLoading(true)
    try {
      const res = await fetch('/api/admin/lynk-profile')
      if (res.ok) {
        const data = await res.json()
        if (data.profile) {
          setProfile({
            id: data.profile.id,
            displayName: data.profile.displayName || '',
            tagline: data.profile.tagline || '',
            bio: data.profile.bio || '',
            avatarUrl: data.profile.avatarUrl || '',
            location: data.profile.location || '',
            verifiedBadge: data.profile.verifiedBadge ?? true,
            showMainPortfolio: data.profile.showMainPortfolio ?? true,
            mainPortfolioLabel: data.profile.mainPortfolioLabel || 'Main Portfolio',
            mainPortfolioUrl: data.profile.mainPortfolioUrl || '/en',
            showDownloadCv: data.profile.showDownloadCv ?? true,
            downloadCvLabel: data.profile.downloadCvLabel || 'Download CV',
            downloadCvUrl: data.profile.downloadCvUrl || '',
            customCtaLabel: data.profile.customCtaLabel || '',
            customCtaUrl: data.profile.customCtaUrl || '',
          })
        }
      }
    } catch {
      toast.error('Failed to load Lynk.id profile')
    } finally {
      setProfileLoading(false)
    }
  }

  useEffect(() => {
    fetchLinks()
    fetchProfile()
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await fetch('/api/admin/lynk-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      if (res.ok) {
        toast.success('Lynk.id profile updated successfully!')
      } else {
        toast.error('Failed to update Lynk.id profile')
      }
    } catch {
      toast.error('Network error saving profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingLink(null)
    setTitle('')
    setSlug('')
    setTargetUrl('')
    setDescription('')
    setCategory('Cloud & Hosting')
    setBadge('')
    setIcon('Cloud')
    setOrder(0)
    setIsActive(true)
    setDialogOpen(true)
  }

  const handleOpenEdit = (link: ShortLink) => {
    setEditingLink(link)
    setTitle(link.title)
    setSlug(link.slug)
    setTargetUrl(link.targetUrl)
    setDescription(link.description || '')
    setCategory(link.category)
    setBadge(link.badge || '')
    setIcon(link.icon || 'Cloud')
    setOrder(link.order || 0)
    setIsActive(link.isActive)
    setDialogOpen(true)
  }

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!editingLink && (!slug || slug === slugify(title))) {
      setSlug(slugify(val))
    }
  }

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !slug.trim() || !targetUrl.trim()) {
      toast.error('Please fill in Title, Slug, and Target URL')
      return
    }

    setSubmitting(true)
    try {
      const url = editingLink ? `/api/admin/links/${editingLink.id}` : '/api/admin/links'
      const method = editingLink ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          targetUrl,
          description: description || null,
          category,
          badge: badge || null,
          icon,
          order: Number(order) || 0,
          isActive,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to save link')
      } else {
        toast.success(editingLink ? 'Link updated' : 'Short link created')
        setDialogOpen(false)
        fetchLinks()
      }
    } catch {
      toast.error('Failed to submit link')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete short link "/${name}"?`)) return

    try {
      const res = await fetch(`/api/admin/links/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(`Link deleted`)
        setLinks((prev) => prev.filter((l) => l.id !== id))
      } else {
        toast.error('Failed to delete link')
      }
    } catch {
      toast.error('Network error deleting link')
    }
  }

  const handleToggleStatus = async (link: ShortLink) => {
    const nextStatus = !link.isActive
    try {
      const res = await fetch(`/api/admin/links/${link.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextStatus }),
      })
      if (res.ok) {
        setLinks((prev) =>
          prev.map((l) => (l.id === link.id ? { ...l, isActive: nextStatus } : l))
        )
        toast.success(`Link ${nextStatus ? 'activated' : 'disabled'}`)
      }
    } catch {
      toast.error('Failed to update status')
    }
  }

  const copyLink = (linkSlug: string, id: string) => {
    let fullUrl = ''
    if (urlFormat === 'subdomain') {
      fullUrl = `https://link.sukristiyo.site/${linkSlug}`
    } else {
      fullUrl = `https://sukristiyo.my.id/go/${linkSlug}`
    }

    navigator.clipboard.writeText(fullUrl)
    setCopiedId(id)
    toast.success(`Copied: ${fullUrl}`)
    setTimeout(() => setCopiedId(null), 2500)
  }

  // Metrics
  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0)
  const activeCount = links.filter((l) => l.isActive).length
  const topLink = [...links].sort((a, b) => b.clicks - a.clicks)[0]

  const categories = ['All', ...Array.from(new Set(links.map((l) => l.category).filter(Boolean)))]

  const filteredLinks = links.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.slug.toLowerCase().includes(search.toLowerCase()) ||
      l.targetUrl.toLowerCase().includes(search.toLowerCase())
    const matchesCat = selectedCategory === 'All' || l.category === selectedCategory
    return matchesSearch && matchesCat
  })

  return (
    <div className="space-y-8 pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            Links & Lynk.id Hub
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono font-normal">
              link.sukristiyo.site
            </span>
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your personal Lynk.id / Linktree profile page and branded short links.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="/links"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-all shadow-sm"
          >
            <Smartphone className="h-3.5 w-3.5 text-primary" />
            Preview Lynk.id
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </a>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              fetchLinks()
              fetchProfile()
            }}
            disabled={loading || profileLoading}
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          <Button onClick={handleOpenCreate} className="gap-2 shadow-sm font-medium">
            <Plus className="h-4 w-4" />
            Add New Link
          </Button>
        </div>
      </div>

      {/* ── Main Tab Navigation ── */}
      <Tabs defaultValue="links" className="space-y-6">
        <TabsList className="bg-muted/40 p-1 border border-border rounded-xl">
          <TabsTrigger value="links" className="gap-2 text-xs sm:text-sm">
            <Link2 className="h-4 w-4" />
            Curated Links & Shortener ({links.length})
          </TabsTrigger>
          <TabsTrigger value="customizer" className="gap-2 text-xs sm:text-sm">
            <UserCheck className="h-4 w-4" />
            Lynk.id Profile Customizer
          </TabsTrigger>
        </TabsList>

        {/* ═════════ TAB 1: LINKS & SHORTENER ═════════ */}
        <TabsContent value="links" className="space-y-6">
          {/* Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-card border-border backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Total Links
                </CardTitle>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <Link2 className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-card-foreground">
                  {loading ? '—' : links.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{activeCount} shown on profile</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Total Clicks
                </CardTitle>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                  <MousePointerClick className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-card-foreground">
                  {loading ? '—' : totalClicks.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span>Redirects & taps</span>
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Top Performer
                </CardTitle>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <Sparkles className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-base font-bold text-card-foreground truncate max-w-[200px]">
                  {topLink ? `/${topLink.slug}` : '—'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {topLink ? `${topLink.clicks.toLocaleString()} clicks` : 'No clicks yet'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Active Hub Status
                </CardTitle>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Globe2 className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-500">
                  {links.length > 0 ? `${Math.round((activeCount / links.length) * 100)}%` : '100%'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Live routing enabled</p>
              </CardContent>
            </Card>
          </div>

          {/* Copy Format Selector Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl border border-border bg-card/80 backdrop-blur-md gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground font-medium">Default Copy URL:</span>
              <div className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5">
                <button
                  onClick={() => setUrlFormat('subdomain')}
                  className={`px-2.5 py-1 text-xs rounded-md font-mono transition-all ${
                    urlFormat === 'subdomain'
                      ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  link.sukristiyo.site/[slug]
                </button>
                <button
                  onClick={() => setUrlFormat('path')}
                  className={`px-2.5 py-1 text-xs rounded-md font-mono transition-all ${
                    urlFormat === 'path'
                      ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  sukristiyo.my.id/go/[slug]
                </button>
              </div>
            </div>

            <span className="text-[11px] text-muted-foreground font-mono">
              💡 Tap &quot;Copy&quot; on any link below to copy with your chosen format.
            </span>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, slug, or destination..."
                className="pl-9 bg-card border-border"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Links Cards List */}
          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground animate-pulse">
              Loading links...
            </div>
          ) : filteredLinks.length === 0 ? (
            <Card className="bg-card border-border py-12 text-center">
              <CardContent className="space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-muted/50 text-muted-foreground flex items-center justify-center mx-auto">
                  <Link2 className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground">No links found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {search
                    ? 'No links match your search query.'
                    : 'Create your first link to feature on your Lynk.id style showcase and share everywhere.'}
                </p>
                {!search && (
                  <Button onClick={handleOpenCreate} size="sm" className="mt-2">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Your First Link
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3.5">
              {filteredLinks.map((link) => (
                <Card
                  key={link.id}
                  className={`bg-card border-border transition-all duration-200 hover:border-primary/40 ${
                    !link.isActive ? 'opacity-60' : ''
                  }`}
                >
                  <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground text-sm">{link.title}</span>
                        <Badge variant="secondary" className="text-[10px] py-0 font-normal">
                          {link.category}
                        </Badge>
                        {link.badge && (
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase">
                            {link.badge}
                          </span>
                        )}
                        {!link.isActive && (
                          <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">
                            Hidden
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap pt-0.5">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/40 border border-border/80 font-mono text-xs text-primary font-medium">
                          <span>/{link.slug}</span>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyLink(link.slug, link.id)}
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                        >
                          {copiedId === link.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="text-emerald-500">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </Button>

                        <a
                          href={`/go/${link.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                          title="Test redirect"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>

                      <div className="text-xs text-muted-foreground truncate max-w-lg font-mono opacity-80 pt-0.5">
                        ↳ {link.targetUrl}
                      </div>

                      {link.description && (
                        <p className="text-xs text-muted-foreground pt-1">{link.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block">Clicks</span>
                        <span className="text-base font-bold font-mono text-foreground">
                          {link.clicks.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={link.isActive}
                          onCheckedChange={() => handleToggleStatus(link)}
                          title={link.isActive ? 'Active on Lynk.id' : 'Hidden'}
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(link)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(link.id, link.slug)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ═════════ TAB 2: LYNK.ID PROFILE CUSTOMIZER ═════════ */}
        <TabsContent value="customizer">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  Header & Bio Personalization
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Customize how your profile appears at link.sukristiyo.site independently from your main portfolio.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Display Name</label>
                    <Input
                      value={profile.displayName}
                      onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                      placeholder="e.g. Sukristiyo"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Location</label>
                    <Input
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      placeholder="e.g. Jakarta, Indonesia"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Tagline / Subtitle</label>
                  <Input
                    value={profile.tagline}
                    onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                    placeholder="e.g. Cloud Engineer | DevOps | SRE | Data Center"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Custom Avatar URL (Optional)</label>
                  <Input
                    value={profile.avatarUrl}
                    onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                    placeholder="Leave empty to use main portfolio avatar"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-medium text-foreground">Verified Blue Checkmark</span>
                  </div>
                  <Switch
                    checked={profile.verifiedBadge}
                    onCheckedChange={(val) => setProfile({ ...profile, verifiedBadge: val })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons Configuration */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  Primary Action Buttons
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Toggle or rename the top CTA buttons displayed above your link list.
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Main Portfolio Button */}
                <div className="p-3.5 rounded-xl border border-border space-y-3 bg-muted/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      <span className="text-xs font-semibold text-foreground">Main Portfolio Button</span>
                    </div>
                    <Switch
                      checked={profile.showMainPortfolio}
                      onCheckedChange={(val) => setProfile({ ...profile, showMainPortfolio: val })}
                    />
                  </div>

                  {profile.showMainPortfolio && (
                    <div className="grid sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">Button Label</label>
                        <Input
                          value={profile.mainPortfolioLabel}
                          onChange={(e) => setProfile({ ...profile, mainPortfolioLabel: e.target.value })}
                          placeholder="Main Portfolio"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">Destination URL</label>
                        <Input
                          value={profile.mainPortfolioUrl}
                          onChange={(e) => setProfile({ ...profile, mainPortfolioUrl: e.target.value })}
                          placeholder="/en"
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Download CV Button */}
                <div className="p-3.5 rounded-xl border border-border space-y-3 bg-muted/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-amber-500" />
                      <span className="text-xs font-semibold text-foreground">Download CV Button</span>
                    </div>
                    <Switch
                      checked={profile.showDownloadCv}
                      onCheckedChange={(val) => setProfile({ ...profile, showDownloadCv: val })}
                    />
                  </div>

                  {profile.showDownloadCv && (
                    <div className="grid sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">Button Label</label>
                        <Input
                          value={profile.downloadCvLabel}
                          onChange={(e) => setProfile({ ...profile, downloadCvLabel: e.target.value })}
                          placeholder="Download CV"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">Custom CV Download URL (Optional)</label>
                        <Input
                          value={profile.downloadCvUrl}
                          onChange={(e) => setProfile({ ...profile, downloadCvUrl: e.target.value })}
                          placeholder="Leave empty to use main CV URL"
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Extra Custom CTA Banner */}
                <div className="p-3.5 rounded-xl border border-primary/30 space-y-3 bg-primary/5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">
                      Extra Highlight CTA Banner (Optional)
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">Highlight Banner Text</label>
                      <Input
                        value={profile.customCtaLabel}
                        onChange={(e) => setProfile({ ...profile, customCtaLabel: e.target.value })}
                        placeholder="e.g. 🚀 Book a 1:1 Cloud Architecture Consultation"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">Destination Link</label>
                      <Input
                        value={profile.customCtaUrl}
                        onChange={(e) => setProfile({ ...profile, customCtaUrl: e.target.value })}
                        placeholder="https://cal.com/sukristiyo or WhatsApp link"
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button type="submit" disabled={savingProfile} className="gap-2">
                <Save className="h-4 w-4" />
                {savingProfile ? 'Saving...' : 'Save Lynk.id Profile Changes'}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              {editingLink ? 'Edit Link' : 'Add Link to Lynk.id & Shortener'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Link Title *</label>
              <Input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. DigitalOcean $200 Free Credit"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Short Slug (link.sukristiyo.site/[slug]) *
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-muted/60 text-muted-foreground border border-r-0 border-border rounded-l-md text-xs font-mono select-none">
                  /
                </span>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().trim())}
                  placeholder="digitalocean"
                  className="rounded-l-none font-mono text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Destination Affiliate URL *</label>
              <Input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://m.do.co/c/your-ref-id"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Category</label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Cloud & Hosting"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Highlight Badge (Optional)</label>
                <Input
                  value={badge}
                  onChange={(e) => setBadge(e.target.value.toUpperCase())}
                  placeholder="e.g. HOT, FREE $200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Card Icon</label>
              <div className="grid grid-cols-5 gap-2">
                {availableIcons.map((ic) => {
                  const IconCmp = ic.icon
                  const selected = icon === ic.name
                  return (
                    <button
                      key={ic.name}
                      type="button"
                      onClick={() => setIcon(ic.name)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs transition-all ${
                        selected
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-border/60 hover:bg-muted/40 text-muted-foreground'
                      }`}
                    >
                      <IconCmp className="h-4 w-4 mb-1" />
                      <span className="text-[10px] truncate w-full text-center">{ic.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Description (Shown on Lynk.id card)</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Free $200 credit for 60 days on Droplets & Kubernetes"
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
              <div>
                <span className="text-xs font-semibold text-foreground block">Active on Profile</span>
                <span className="text-[11px] text-muted-foreground block">
                  Show on link.sukristiyo.site and enable direct redirect.
                </span>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingLink ? 'Save Changes' : 'Add Link'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
