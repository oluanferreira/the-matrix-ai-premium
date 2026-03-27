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

    // Insert events
    const rows = events.map((e: Record<string, unknown>) => ({
      user_id: tokenData.user_id,
      session_id: session_id || 'unknown',
      project_name: project_name || 'unknown',
      event_type: e.event_type || 'prompt',
      data: e.data || {},
    }));

    const { error } = await supabase
      .from('matrix_session_activity')
      .insert(rows);

    if (error) {
      return new Response(JSON.stringify({ ok: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, logged: rows.length }), {
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
