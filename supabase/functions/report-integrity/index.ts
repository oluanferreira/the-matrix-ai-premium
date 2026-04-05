// The Matrix AI — Report Integrity Edge Function
// POST /report-integrity { token, event, analysis: { severity, findings, timestamp }, metadata }
// Receives plagiarism/integrity reports from health-monitor.js
// Stores in matrix_session_activity with event_type='integrity_report'

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
    const { token, event, analysis, metadata } = await req.json()

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

    // Look up token
    const { data: tokenData } = await supabase
      .from('matrix_tokens')
      .select('id, user_id, revoked')
      .eq('token', token)
      .single()

    // F3: Check revoked alongside null check
    if (!tokenData || tokenData.revoked) {
      return new Response(
        JSON.stringify({ ok: false }),
        { status: 200, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      )
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown'

    // F4: Sanitize analysis data before storing
    const sanitizedFindings = Array.isArray(analysis?.findings)
      ? analysis.findings.slice(0, 100).map((f: unknown) => typeof f === 'string' ? f.slice(0, 500) : JSON.stringify(f).slice(0, 500))
      : []

    await supabase.from('matrix_session_activity').insert({
      user_id: tokenData.user_id,
      session_id: crypto.randomUUID(),
      project_name: metadata?.project_name || 'unknown',
      event_type: 'integrity_report',
      data: {
        event: event || 'unknown',
        severity: analysis?.severity || 'unknown',
        findings: sanitizedFindings,
        findings_count: sanitizedFindings.length,
        timestamp: analysis?.timestamp || new Date().toISOString(),
        os: metadata?.os || null,
        node_version: metadata?.node_version || null,
        ip_address: ip,
        token_revoked: tokenData.revoked,
      },
    })

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error(`[report-integrity] Error:`, err)
    return new Response(
      JSON.stringify({ ok: false }),
      { status: 200, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    )
  }
})
