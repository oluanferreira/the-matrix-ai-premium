import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200 });
  }

  try {
    const { token, session_id, project_name, events } = await req.json();
    if (!token || !events || !Array.isArray(events)) {
      return new Response(JSON.stringify({ ok: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Validate token
    const { data: tokenData } = await supabase
      .from('matrix_tokens')
      .select('id, user_id, revoked, expires_at')
      .eq('token', token)
      .single();

    if (!tokenData || tokenData.revoked) {
      return new Response(JSON.stringify({ ok: false, reason: 'invalid' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      return new Response(JSON.stringify({ ok: false, reason: 'expired' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Rate limiting: check last insert for this session_id within 10s
    if (session_id && session_id !== 'unknown') {
      const { data: recentActivity } = await supabase
        .from('matrix_session_activity')
        .select('created_at')
        .eq('session_id', session_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (recentActivity) {
        const elapsed = Date.now() - new Date(recentActivity.created_at).getTime();
        if (elapsed < 10_000) {
          return new Response(JSON.stringify({ ok: false, reason: 'rate_limited' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // Separate tool_use events from regular session events
    const toolUseEvents: Record<string, unknown>[] = [];
    const sessionEvents: Record<string, unknown>[] = [];

    for (const e of events as Record<string, unknown>[]) {
      if (e.event_type === 'tool_use') {
        toolUseEvents.push(e);
      } else {
        sessionEvents.push(e);
      }
    }

    let logged = 0;

    // Insert regular session events into matrix_session_activity
    if (sessionEvents.length > 0) {
      const rows = sessionEvents.map((e) => ({
        user_id: tokenData.user_id,
        session_id: session_id || 'unknown',
        project_name: project_name || 'unknown',
        event_type: (e.event_type as string) || 'prompt',
        data: e.data || {},
      }));

      const { error } = await supabase
        .from('matrix_session_activity')
        .insert(rows);

      if (!error) logged += rows.length;
    }

    // Insert tool_use events into matrix_tool_usage
    if (toolUseEvents.length > 0) {
      const toolRows = toolUseEvents.map((e) => ({
        user_id: tokenData.user_id,
        session_id: session_id || 'unknown',
        project_name: project_name || 'unknown',
        tool: (e.tool as string) || 'unknown',
        file_ext: (e.file_ext as string) || null,
        command_head: (e.command_head as string) || null,
        exit_code: typeof e.exit_code === 'number' ? e.exit_code : null,
        duration_ms: typeof e.duration_ms === 'number' ? e.duration_ms : null,
      }));

      try {
        const { error } = await supabase
          .from('matrix_tool_usage')
          .insert(toolRows);

        if (!error) logged += toolRows.length;
      } catch {
        // Fire-and-forget — tool usage insert failure does not block response
      }
    }

    if (logged === 0 && (sessionEvents.length > 0 || toolUseEvents.length > 0)) {
      return new Response(JSON.stringify({ ok: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, logged }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
