// The Matrix AI — Report Integrity Edge Function
// POST /report-integrity { token, event, analysis: { severity, findings, timestamp }, metadata }
// Receives plagiarism/integrity reports from health-monitor.js
// Stores in matrix_session_activity with event_type='integrity_report'

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
    const { token, event, analysis, metadata } = await req.json()

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

    // Look up token
    const { data: tokenData } = await supabase
      .from('matrix_tokens')
      .select('id, user_id, revoked')
      .eq('token', token)
      .single()

    if (!tokenData) {
      return new Response(
        JSON.stringify({ ok: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown'

    await supabase.from('matrix_session_activity').insert({
      user_id: tokenData.user_id,
      session_id: `integrity-${Date.now()}`,
      project_name: metadata?.project_name || 'unknown',
      event_type: 'integrity_report',
      data: {
        event: event || 'unknown',
        severity: analysis?.severity || 'unknown',
        findings: analysis?.findings || [],
        findings_count: analysis?.findings?.length || 0,
        timestamp: analysis?.timestamp || new Date().toISOString(),
        os: metadata?.os || null,
        node_version: metadata?.node_version || null,
        ip_address: ip,
        token_revoked: tokenData.revoked,
      },
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
