'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Eye,
  Users,
  DownloadCloud,
  Mail,
  ArrowUpRight,
  Monitor,
  Smartphone,
  Tablet,
  Globe2,
  Calendar,
  RefreshCw,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AnalyticsData {
  period: string
  summary: {
    totalViews: number
    uniqueVisitors: number
    cvDownloads: number
    contactMessages: number
  }
  trafficTimeline: { date: string; views: number }[]
  topPages: { path: string; views: number }[]
  topReferrers: { referrer: string; views: number }[]
  devices: { device: string; count: number }[]
  browsers: { browser: string; count: number }[]
  recentEvents: { id: string; name: string; path: string; metadata: string | null; createdAt: string }[]
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; views: number } | null>(null)

  const fetchStats = async (p = period) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics/stats?period=${p}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error('Failed to fetch analytics', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats(period)
  }, [period])

  const maxDailyViews = data ? Math.max(...data.trafficTimeline.map((t) => t.views), 1) : 1

  return (
    <div className="space-y-8 pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            Traffic & Analytics
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono font-normal">
              ● Live Telemetry
            </span>
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Monitor visitor engagement, content popularity, and recruitment actions.
          </p>
        </div>

        {/* Period Filter Tabs */}
        <div className="flex items-center gap-2 bg-muted/40 p-1 rounded-xl border border-border">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                period === p
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p === '7d' ? 'Last 7 Days' : p === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchStats()}
            disabled={loading}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Refresh statistics"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* ── Top Metric Cards (Bento style) ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Views */}
        <Card className="bg-card border-border backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Page Views
            </CardTitle>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Eye className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-card-foreground">
              {loading ? '—' : data?.summary.totalViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span>Across all portfolio routes</span>
            </p>
          </CardContent>
        </Card>

        {/* Unique Visitors */}
        <Card className="bg-card border-border backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Unique Visitors
            </CardTitle>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-card-foreground">
              {loading ? '—' : data?.summary.uniqueVisitors.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Privacy-preserving deduplication</p>
          </CardContent>
        </Card>

        {/* CV Downloads (Recruiter Intent) */}
        <Card className="bg-card border-border backdrop-blur-xl border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-amber-500 font-semibold">
              CV Downloads
            </CardTitle>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <DownloadCloud className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-card-foreground text-amber-500">
              {loading ? '—' : data?.summary.cvDownloads.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">High-intent recruiter downloads</p>
          </CardContent>
        </Card>

        {/* Contact Messages */}
        <Card className="bg-card border-border backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Contact Submissions
            </CardTitle>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Mail className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-card-foreground">
              {loading ? '—' : data?.summary.contactMessages.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Inquiries sent via contact form</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Daily Traffic Interactive Timeline Chart ── */}
      <Card className="bg-card border-border backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base font-semibold text-foreground">Traffic Over Time</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Daily page views distribution for {period === '7d' ? 'past week' : period === '30d' ? 'past month' : 'past 3 months'}
            </p>
          </div>
          {hoveredPoint && (
            <div className="text-right">
              <span className="text-xs font-mono text-muted-foreground">Date: {hoveredPoint.date}</span>
              <p className="text-sm font-bold text-primary font-mono">{hoveredPoint.views} views</p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground animate-pulse">
              Loading telemetry timeline...
            </div>
          ) : data && data.trafficTimeline.length > 0 ? (
            <div className="h-48 flex items-end gap-1.5 sm:gap-2 pt-6 pb-2">
              {data.trafficTimeline.map((pt, idx) => {
                const heightPercent = Math.max((pt.views / maxDailyViews) * 100, 4)
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                        pt.views > 0
                          ? 'bg-primary/80 hover:bg-primary shadow-sm hover:shadow-primary/30'
                          : 'bg-muted/40 hover:bg-muted'
                      }`}
                    />
                    {/* Date label */}
                    <span className="text-[10px] text-muted-foreground font-mono mt-2 truncate w-full text-center">
                      {pt.date.slice(3)}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
              No traffic recorded in this period yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Two-Column Breakdown: Top Pages & Referrers ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Pages */}
        <Card className="bg-card border-border backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground flex items-center justify-between">
              <span>Most Visited Pages</span>
              <span className="text-xs font-normal text-muted-foreground font-mono">Views</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-xs text-muted-foreground">Loading pages...</div>
            ) : data && data.topPages.length > 0 ? (
              <div className="space-y-3">
                {data.topPages.map((page, idx) => {
                  const percentage = Math.round((page.views / (data.summary.totalViews || 1)) * 100)
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-foreground font-medium truncate max-w-[280px]">
                          {page.path}
                        </span>
                        <span className="text-muted-foreground font-mono">
                          {page.views} <span className="text-[10px] opacity-60">({percentage}%)</span>
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground">No page visits recorded yet.</div>
            )}
          </CardContent>
        </Card>

        {/* Traffic Sources / Referrers */}
        <Card className="bg-card border-border backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground flex items-center justify-between">
              <span>Traffic Sources</span>
              <span className="text-xs font-normal text-muted-foreground font-mono">Referrals</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-xs text-muted-foreground">Loading sources...</div>
            ) : data && data.topReferrers.length > 0 ? (
              <div className="space-y-2.5">
                {data.topReferrers.map((ref, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/20"
                  >
                    <div className="flex items-center gap-2.5">
                      <Globe2 className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-xs font-medium text-foreground truncate max-w-[240px]">
                        {ref.referrer}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-semibold text-foreground">{ref.views}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground">
                All visits currently Direct / Bookmark.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Devices, Browsers & Live Event Stream ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Device Breakdown */}
        <Card className="bg-card border-border backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">Device Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['desktop', 'mobile', 'tablet'].map((devType) => {
                const count = data?.devices.find((d) => d.device.toLowerCase() === devType)?.count || 0
                const total = data?.summary.totalViews || 1
                const pct = Math.round((count / total) * 100)
                const Icon = devType === 'desktop' ? Monitor : devType === 'mobile' ? Smartphone : Tablet

                return (
                  <div key={devType} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30">
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground capitalize">{devType}</span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      {count} <span className="text-[10px] opacity-70">({pct}%)</span>
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Browsers */}
        <Card className="bg-card border-border backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">Top Browsers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data && data.browsers.length > 0 ? (
                data.browsers.map((b, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{b.browser}</span>
                    <span className="font-mono text-muted-foreground">{b.count} views</span>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-muted-foreground">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent High-Intent Events */}
        <Card className="bg-card border-border backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground flex items-center justify-between">
              <span>Recent Actions</span>
              <span className="text-[10px] text-muted-foreground font-mono">Live</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data && data.recentEvents.length > 0 ? (
              <div className="space-y-2.5">
                {data.recentEvents.slice(0, 5).map((ev) => (
                  <div key={ev.id} className="flex items-center justify-between text-xs border-b border-border/50 pb-2 last:border-0 last:pb-0">
                    <div>
                      <span className="font-mono font-semibold text-primary block">{ev.name}</span>
                      <span className="text-[10px] text-muted-foreground truncate block max-w-[140px]">{ev.path}</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {new Date(ev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-muted-foreground">
                No custom events recorded yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
