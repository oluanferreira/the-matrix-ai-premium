import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString()

  const { count: eventsToday } = await supabase
    .from('matrix_session_activity')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayISO)

  const { count: toolsToday } = await supabase
    .from('matrix_tool_usage')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayISO)

  const { data: durationData } = await supabase
    .from('matrix_tool_usage')
    .select('duration_ms')
    .gte('created_at', new Date(Date.now() - 86400000).toISOString())
    .not('duration_ms', 'is', null)

  const avgDuration = durationData && durationData.length > 0
    ? Math.round(durationData.reduce((s, d) => s + (d.duration_ms || 0), 0) / durationData.length)
    : 0

  const { data: toolData } = await supabase
    .from('matrix_tool_usage')
    .select('tool')
    .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())

  const toolMap: Record<string, number> = {}
  ;(toolData || []).forEach((t) => {
    toolMap[t.tool] = (toolMap[t.tool] || 0) + 1
  })
  const topTools = Object.entries(toolMap)
    .map(([tool, count]) => ({ tool, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return NextResponse.json({ eventsToday: eventsToday || 0, toolsToday: toolsToday || 0, avgDuration, topTools })
}
