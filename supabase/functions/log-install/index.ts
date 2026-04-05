// The Matrix AI — Log Install Edge Function
// POST /log-install { token, project_name, os, node_version, framework_version, event }
// Fire-and-forget install/update logging — always returns 200

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
    // F8: Removed `plan` from destructured body — never trust client-side plan
    const { token, project_name, os, node_version, framework_version, event } =
      await req.json()

    if (!token) {
      return new Response(
        JSON.stringify({ ok: false }),
        { status: 200, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      )
    }

    // F2: Token format regex BEFORE database lookup
    if (!/^MTX-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(token)) {
      return new Response(
        JSON.stringify({ ok: false }),
        { status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Look up token to get user_id and real plan
    const { data: tokenData } = await supabase
      .from('matrix_tokens')
      .select('id, user_id, revoked, matrix_users(plan)')
      .eq('token', token)
      .single()

    if (!tokenData || tokenData.revoked) {
      return new Response(
        JSON.stringify({ ok: false }),
        { status: 200, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      )
    }

    // F5: Validate relation properly instead of `as any`
    const user = Array.isArray(tokenData.matrix_users) ? tokenData.matrix_users[0] : tokenData.matrix_users
    // F8: ONLY server-side plan, never trust client
    const userPlan = user?.plan || 'free'

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown'

    await supabase.from('matrix_install_logs').insert({
      user_id: tokenData.user_id,
      token_id: tokenData.id,
      plan: userPlan,
      project_name: project_name || null,
      os: os || null,
      node_version: node_version || null,
      framework_version: framework_version || null,
      event: event || 'install',
      ip_address: ip,
    })

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error(`[log-install] Error:`, err)
    return new Response(
      JSON.stringify({ ok: false }),
      { status: 200, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    )
  }
})
