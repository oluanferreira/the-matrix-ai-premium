import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const tab = req.nextUrl.searchParams.get('tab') || 'sessions'
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') || '1') || 1)
  const range = ['1d', '7d', '30d'].includes(req.nextUrl.searchParams.get('range') || '')
    ? req.nextUrl.searchParams.get('range')! : '7d'
  const limit = 50
  const from = (page - 1) * limit
  const to = from + limit - 1

  const rangeMs = range === '1d' ? 86400000 : range === '30d' ? 30 * 86400000 : 7 * 86400000
  const since = new Date(Date.now() - rangeMs).toISOString()

  if (tab === 'tools') {
    const { count } = await supabase
      .from('matrix_tool_usage')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', since)

    const { data, error } = await supabase
      .from('matrix_tool_usage')
      .select('*')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data, total: count || 0 })
  }

  // Sessions or integrity — same table, different filters
  let countQuery = supabase
    .from('matrix_session_activity')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', since)

  let dataQuery = supabase
    .from('matrix_session_activity')
    .select('*')
    .gte('created_at', since)
    .order('created_at', { ascending: false })

  if (tab === 'integrity') {
    countQuery = countQuery.eq('event_type', 'integrity_report')
    dataQuery = dataQuery.eq('event_type', 'integrity_report')
  }

  const { count } = await countQuery
  const { data, error } = await dataQuery.range(from, to)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, total: count || 0 })
}
