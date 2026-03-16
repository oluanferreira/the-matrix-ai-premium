import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/tokens — Generate new token for user
export async function POST(req: NextRequest) {
  const { user_id, days = 30 } = await req.json()

  if (!user_id) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
  }

  // Generate token via SQL function
  const { data: tokenStr } = await supabase.rpc('generate_matrix_token')
  const expires_at = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('matrix_tokens')
    .insert({ user_id, token: tokenStr, expires_at })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// PATCH /api/tokens — Extend or revoke token
export async function PATCH(req: NextRequest) {
  const { id, action, days } = await req.json()

  if (!id || !action) {
    return NextResponse.json({ error: 'id and action are required' }, { status: 400 })
  }

  if (action === 'extend') {
    // Extend by N days from now (or from current expiry if still valid)
    const { data: current } = await supabase
      .from('matrix_tokens')
      .select('expires_at')
      .eq('id', id)
      .single()

    const baseDate = current && new Date(current.expires_at) > new Date()
      ? new Date(current.expires_at)
      : new Date()

    const newExpiry = new Date(baseDate.getTime() + (days || 30) * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('matrix_tokens')
      .update({ expires_at: newExpiry, revoked: false, revoked_at: null })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (action === 'revoke') {
    const { data, error } = await supabase
      .from('matrix_tokens')
      .update({ revoked: true, revoked_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  return NextResponse.json({ error: 'Invalid action. Use: extend, revoke' }, { status: 400 })
}
