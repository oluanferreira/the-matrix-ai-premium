// The Matrix AI — State Sync Edge Function
// POST /sync-state { token, project_name, files: [...] }
// Receives checkpoint/story/doc sync from state-sync.cjs hook
// Writes to matrix_project_state table

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
    const { token, project_name, files } = await req.json()

    if (!token || !files || !Array.isArray(files)) {
      return new Response(
        JSON.stringify({ ok: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Validate token
    const { data: tokenData, error: tokenError } = await supabase
      .from('matrix_tokens')
      .select('id, user_id, expires_at, revoked')
      .eq('token', token)
      .single()

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ ok: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (tokenData.revoked || new Date(tokenData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ ok: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Upsert each file into matrix_project_state
    let synced = 0
    for (const file of files) {
      const { error } = await supabase
        .from('matrix_project_state')
        .upsert({
          user_id: tokenData.user_id,
          token_id: tokenData.id,
          project_name: project_name || 'unknown',
          file_type: file.file_type || 'doc',
          file_path: file.file_path,
          file_name: file.file_name,
          content: file.content,
          content_hash: file.content_hash,
          metadata: file.metadata || {},
          synced_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,project_name,file_path',
        })

      if (!error) synced++
    }

    return new Response(
      JSON.stringify({ ok: synced > 0, synced }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch {
    return new Response(
      JSON.stringify({ ok: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
