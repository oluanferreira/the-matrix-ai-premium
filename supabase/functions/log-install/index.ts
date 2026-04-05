// The Matrix AI — Log Install Edge Function
// POST /log-install { token, project_name, os, node_version, framework_version, event, plan }
// Fire-and-forget install/update logging — always returns 200

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
    const { token, project_name, os, node_version, framework_version, event, plan } =
      await req.json()

    if (!token) {
      return new Response(
        JSON.stringify({ ok: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const realPlan = (tokenData.matrix_users as any)?.plan || plan || 'free'
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown'

    await supabase.from('matrix_install_logs').insert({
      user_id: tokenData.user_id,
      token_id: tokenData.id,
      plan: realPlan,
      project_name: project_name || null,
      os: os || null,
      node_version: node_version || null,
      framework_version: framework_version || null,
      event: event || 'install',
      ip_address: ip,
    })

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch {
    return new Response(
      JSON.stringify({ ok: false }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
