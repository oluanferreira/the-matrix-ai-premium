// The Matrix AI — Token Validation Edge Function
// POST /validate-token { token: "MTX-XXXX-XXXX-XXXX-XXXX" }

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
    const { token, project_name, os, node_version, framework_version, event } = await req.json()

    if (!token) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate token format
    if (!/^MTX-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(token)) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid token format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Look up token
    const { data: tokenData, error: tokenError } = await supabase
      .from('matrix_tokens')
      .select('id, user_id, token, expires_at, revoked, matrix_users(id, name, email, plan)')
      .eq('token', token)
      .single()

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Token not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if revoked
    if (tokenData.revoked) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Token has been revoked', purge: true }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Token has expired', purge: true }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log the event
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown'
    await supabase.from('matrix_install_logs').insert({
      user_id: tokenData.user_id,
      token_id: tokenData.id,
      plan: 'premium',
      project_name: project_name || null,
      os: os || null,
      node_version: node_version || null,
      framework_version: framework_version || null,
      event: event || 'install',
      ip_address: ip,
    })

    const user = tokenData.matrix_users as any
    const daysRemaining = Math.ceil(
      (new Date(tokenData.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )

    return new Response(
      JSON.stringify({
        valid: true,
        user: { name: user.name, email: user.email },
        plan: 'premium',
        expires_at: tokenData.expires_at,
        days_remaining: daysRemaining,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ valid: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
