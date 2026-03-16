import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/users — Create user + generate premium token
export async function POST(req: NextRequest) {
  const { name, email, notes, days = 30 } = await req.json()

  if (!name || !email) {
    return NextResponse.json({ error: 'name and email are required' }, { status: 400 })
  }

  const { data, error } = await supabase.rpc('create_premium_user', {
    p_name: name,
    p_email: email,
    p_notes: notes || null,
    p_days: days,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data[0])
}

// DELETE /api/users?id=xxx — Delete user
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const { error } = await supabase.from('matrix_users').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ deleted: true })
}
