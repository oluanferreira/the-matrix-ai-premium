// The Matrix AI — Heartbeat Edge Function
// POST /heartbeat { token: "MTX-XXXX-XXXX-XXXX-XXXX" }
// Returns: { valid: true } or { valid: false, purge: true }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token, project_name } = await req.json()

    if (!token) {
      return new Response(
        JSON.stringify({ valid: false, purge: true }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const expired = new Date(data.expires_at) < new Date()
    const shouldPurge = data.revoked || expired

    // Log heartbeat
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    await supabase.from('matrix_install_logs').insert({
      user_id: data.user_id,
      token_id: data.id,
      plan: (data.matrix_users as any)?.plan || 'free',
      project_name: project_name || null,
      event: shouldPurge ? 'purge' : 'heartbeat',
      ip_address: ip,
    })

    return new Response(
      JSON.stringify({ valid: !shouldPurge, purge: shouldPurge }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch {
    return new Response(
      JSON.stringify({ valid: false, purge: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
