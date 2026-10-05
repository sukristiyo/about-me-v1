import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d'

    let days = 7
    if (period === '30d') days = 30
    else if (period === '90d') days = 90
    else if (period === '24h') days = 1

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    // Parallelize queries
    const [
      totalViews,
      uniqueVisitorsResult,
      cvDownloads,
      contactMessages,
      topPagesRaw,
      topReferrersRaw,
      devicesRaw,
      browsersRaw,
      recentEvents,
      allViewsInPeriod,
    ] = await Promise.all([
      prisma.pageView.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.pageView.findMany({
        where: { createdAt: { gte: startDate }, visitorId: { not: null } },
        distinct: ['visitorId'],
        select: { visitorId: true },
      }),
      prisma.analyticsEvent.count({
        where: { name: 'cv_download', createdAt: { gte: startDate } },
      }),
      prisma.contactMessage.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.pageView.groupBy({
        by: ['path'],
        _count: { id: true },
        where: { createdAt: { gte: startDate } },
        orderBy: { _count: { id: 'desc' } },
        take: 8,
      }),
      prisma.pageView.groupBy({
        by: ['referrer'],
        _count: { id: true },
        where: { createdAt: { gte: startDate }, referrer: { not: null } },
        orderBy: { _count: { id: 'desc' } },
        take: 8,
      }),
      prisma.pageView.groupBy({
        by: ['device'],
        _count: { id: true },
        where: { createdAt: { gte: startDate } },
      }),
      prisma.pageView.groupBy({
        by: ['browser'],
        _count: { id: true },
        where: { createdAt: { gte: startDate } },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
      prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      // For daily traffic aggregation
      prisma.pageView.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
    ])

    // Generate daily traffic timeline
    const dailyMap: Record<string, number> = {}
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(5, 10) // MM-DD
      dailyMap[dateStr] = 0
    }

    allViewsInPeriod.forEach((v) => {
      const dateStr = v.createdAt.toISOString().slice(5, 10)
      if (dailyMap[dateStr] !== undefined) {
        dailyMap[dateStr] += 1
      }
    })

    const trafficTimeline = Object.entries(dailyMap).map(([date, views]) => ({
      date,
      views,
    }))

    const uniqueVisitors = uniqueVisitorsResult.length

    return NextResponse.json({
      period,
      summary: {
        totalViews,
        uniqueVisitors,
        cvDownloads,
        contactMessages,
      },
      trafficTimeline,
      topPages: topPagesRaw.map((p) => ({
        path: p.path,
        views: p._count.id,
      })),
      topReferrers: topReferrersRaw.map((r) => ({
        referrer: r.referrer || 'Direct / Bookmark',
        views: r._count.id,
      })),
      devices: devicesRaw.map((d) => ({
        device: d.device || 'desktop',
        count: d._count.id,
      })),
      browsers: browsersRaw.map((b) => ({
        browser: b.browser || 'Other',
        count: b._count.id,
      })),
      recentEvents,
    })
  } catch (error) {
    console.error('[GET /api/analytics/stats]', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
