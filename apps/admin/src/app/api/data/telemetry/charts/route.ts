import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const range = req.nextUrl.searchParams.get('range') || '30d'
  const days = range === '7d' ? 7 : range === '90d' ? 90 : 30
  const since = new Date(Date.now() - days * 86400000).toISOString().split('T')[0]
  const todayStr = new Date().toISOString().split('T')[0]

  const { data: metrics } = await supabase
    .from('telemetry_daily_metrics')
    .select('date, sessions_count, prompts_count, stories_completed')
    .gte('date', since)
    .order('date', { ascending: true })

  const dailyMap: Record<string, { sessions: number; prompts: number; stories: number }> = {}
  ;(metrics || []).forEach((m) => {
    if (!dailyMap[m.date]) dailyMap[m.date] = { sessions: 0, prompts: 0, stories: 0 }
    dailyMap[m.date].sessions += m.sessions_count || 0
    dailyMap[m.date].prompts += m.prompts_count || 0
    dailyMap[m.date].stories += m.stories_completed || 0
  })
  const dailyTrend = Object.entries(dailyMap)
    .map(([date, d]) => ({ date, ...d }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const { data: scores } = await supabase
    .from('telemetry_user_scores')
    .select('user_id, activity_score, churn_score, experience_tier')

  const todayRow = dailyMap[todayStr]
  const sessionsToday = todayRow?.sessions || 0
  const promptsToday = todayRow?.prompts || 0

  const avgActivityScore = scores && scores.length > 0
    ? Math.round((scores.reduce((s, u) => s + (Number(u.activity_score) || 0), 0) / scores.length) * 10) / 10
    : 0
  const highChurnCount = (scores || []).filter((u) => Number(u.churn_score) > 0.7).length

  return NextResponse.json({
    dailyTrend,
    scatterData: scores || [],
    sessionsToday,
    promptsToday,
    avgActivityScore,
    highChurnCount,
  })
}
