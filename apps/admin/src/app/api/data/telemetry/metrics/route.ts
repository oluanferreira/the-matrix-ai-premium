import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1')
  const limit = 50
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { count } = await supabase
    .from('telemetry_daily_metrics')
    .select('*', { count: 'exact', head: true })

  const { data, error } = await supabase
    .from('telemetry_daily_metrics')
    .select('*')
    .order('date', { ascending: false })
    .range(from, to)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, total: count || 0 })
}
