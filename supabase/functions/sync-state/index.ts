// The Matrix AI — State Sync Edge Function
// POST /sync-state { token, project_name, files: [...], project_progress?: [...] }
// Receives checkpoint/story/doc sync from state-sync.cjs hook
// Writes to matrix_project_state table
// Optionally upserts parsed checkpoint data into matrix_project_progress

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200 })
  }

  try {
    const { token, project_name, files, project_progress } = await req.json()

    if (!token || !files || !Array.isArray(files)) {
      return new Response(
        JSON.stringify({ ok: false }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
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
        JSON.stringify({ ok: false, reason: 'invalid' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (tokenData.revoked) {
      return new Response(
        JSON.stringify({ ok: false, reason: 'revoked' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ ok: false, reason: 'expired' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Rate limiting: check last sync for this user+project within 10s
    const { data: recentSync } = await supabase
      .from('matrix_project_state')
      .select('synced_at')
      .eq('user_id', tokenData.user_id)
      .eq('project_name', project_name || 'unknown')
      .order('synced_at', { ascending: false })
      .limit(1)
      .single()

    if (recentSync) {
      const elapsed = Date.now() - new Date(recentSync.synced_at).getTime()
      if (elapsed < 10_000) {
        return new Response(
          JSON.stringify({ ok: false, reason: 'rate_limited' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    // Fire-and-forget: upsert project_progress into matrix_project_progress
    // This runs before file sync but failures do NOT block the response
    if (Array.isArray(project_progress) && project_progress.length > 0) {
      try {
        for (const pp of project_progress) {
          await supabase
            .from('matrix_project_progress')
            .upsert({
              user_id: tokenData.user_id,
              project_name: pp.project_id || project_name || 'unknown',
              active_story: pp.active_story || null,
              story_status: pp.story_status || null,
              stories_done: pp.stories_done ?? 0,
              stories_total: pp.stories_total ?? 0,
              stories_in_progress: pp.stories_in_progress ?? 0,
              stories_blocked: pp.stories_blocked ?? 0,
              last_agent: pp.last_agent || null,
              last_action: pp.last_action || null,
              next_steps: pp.next_steps || null,
              decisions_count: pp.decisions_count ?? 0,
              git_branch: pp.git_branch || null,
              synced_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id,project_name',
            })
        }
      } catch {
        // Fire-and-forget — silently continue if progress upsert fails
      }
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
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch {
    return new Response(
      JSON.stringify({ ok: false }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
