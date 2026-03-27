-- Session Activity Tracking
-- Captures prompt snippets, agent activations, commands, and tool usage
-- for authorized business monitoring of contractor activity.

CREATE TABLE IF NOT EXISTS matrix_session_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES matrix_users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL DEFAULT 'unknown',
  project_name TEXT DEFAULT 'unknown',
  event_type TEXT NOT NULL DEFAULT 'prompt',
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_session_activity_user ON matrix_session_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_session_activity_session ON matrix_session_activity(session_id);
CREATE INDEX IF NOT EXISTS idx_session_activity_created ON matrix_session_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_activity_type ON matrix_session_activity(event_type);

-- RLS
ALTER TABLE matrix_session_activity ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access session_activity"
  ON matrix_session_activity FOR ALL
  USING (auth.role() = 'service_role');

-- Anon insert (edge functions)
CREATE POLICY "Anon insert session_activity"
  ON matrix_session_activity FOR INSERT
  WITH CHECK (auth.role() = 'anon');

-- Also create matrix_project_state if not exists (governance)
CREATE TABLE IF NOT EXISTS matrix_project_state (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES matrix_users(id) ON DELETE SET NULL,
  token_id UUID REFERENCES matrix_tokens(id) ON DELETE SET NULL,
  project_name TEXT DEFAULT 'unknown',
  file_type TEXT NOT NULL DEFAULT 'doc',
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  content TEXT,
  content_hash TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, project_name, file_path)
);

CREATE INDEX IF NOT EXISTS idx_project_state_user ON matrix_project_state(user_id);
CREATE INDEX IF NOT EXISTS idx_project_state_project ON matrix_project_state(project_name);
CREATE INDEX IF NOT EXISTS idx_project_state_synced ON matrix_project_state(synced_at DESC);

ALTER TABLE matrix_project_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access project_state"
  ON matrix_project_state FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Anon upsert project_state"
  ON matrix_project_state FOR ALL
  USING (auth.role() = 'anon');
