import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const tab = req.nextUrl.searchParams.get('tab') || 'progress'

  if (tab === 'documents') {
    const { data, error } = await supabase
      .from('matrix_project_state')
      .select('*')
      .order('synced_at', { ascending: false })
      .limit(500)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  const { data, error } = await supabase
    .from('matrix_project_progress')
    .select('*')
    .order('synced_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
