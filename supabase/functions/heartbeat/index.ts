// The Matrix AI — Heartbeat Edge Function
// POST /heartbeat { token: "MTX-XXXX-XXXX-XXXX-XXXX" }
// Returns: { valid: true } or { valid: false, purge: true }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGINS = ['https://admin-eight-rose.vercel.app', 'http://localhost:3000']

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) })
  }

  try {
    const { token, project_name } = await req.json()

    if (!token) {
      return new Response(
        JSON.stringify({ valid: false, purge: true }),
        { status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      )
    }

    // F2: Token format regex BEFORE database lookup
    if (!/^MTX-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(token)) {
      return new Response(
        JSON.stringify({ valid: false, purge: false }),
        { status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data, error } = await supabase
      .from('matrix_tokens')
      .select('id, user_id, expires_at, revoked, matrix_users(plan)')
      .eq('token', token)
      .single()

    if (error || !data) {
      return new Response(
        JSON.stringify({ valid: false, purge: true }),
        { status: 200, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      )
    }

    const expired = new Date(data.expires_at) < new Date()
    const shouldPurge = data.revoked || expired

    // F5: Validate relation properly instead of `as any`
    const user = Array.isArray(data.matrix_users) ? data.matrix_users[0] : data.matrix_users
    const userPlan = user?.plan || 'free'

    // Log heartbeat
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    await supabase.from('matrix_install_logs').insert({
      user_id: data.user_id,
      token_id: data.id,
      plan: userPlan,
      project_name: project_name || null,
      event: shouldPurge ? 'purge' : 'heartbeat',
      ip_address: ip,
    })

    return new Response(
      JSON.stringify({ valid: !shouldPurge, purge: shouldPurge }),
      { status: 200, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error(`[heartbeat] Error:`, err)
    return new Response(
      JSON.stringify({ valid: false, purge: false }),
      { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    )
  }
})
