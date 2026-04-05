import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { data: events, error } = await supabase
    .from('matrix_story_events')
    .select('story_id, event, agent, created_at')
    .order('created_at', { ascending: false })
    .limit(5000)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const totalEvents = events.length
  const uniqueStories = new Set(events.map((e) => e.story_id)).size
  const activeAgents = new Set(events.filter((e) => e.agent).map((e) => e.agent)).size

  const funnelMap: Record<string, number> = {}
  events.forEach((e) => {
    funnelMap[e.event] = (funnelMap[e.event] || 0) + 1
  })
  const funnelData = Object.entries(funnelMap).map(([event, count]) => ({ event, count }))

  const dailyMap: Record<string, number> = {}
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
  events
    .filter((e) => new Date(e.created_at) >= thirtyDaysAgo)
    .forEach((e) => {
      const date = e.created_at.split('T')[0]
      dailyMap[date] = (dailyMap[date] || 0) + 1
    })
  const dailyData = Object.entries(dailyMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return NextResponse.json({ totalEvents, uniqueStories, activeAgents, funnelData, dailyData })
}
