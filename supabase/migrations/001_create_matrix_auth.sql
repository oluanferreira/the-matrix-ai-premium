-- ============================================
-- The Matrix AI — Token & User Management
-- Supabase Migration
-- ============================================

-- 1. Users table
CREATE TABLE IF NOT EXISTS matrix_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  notes TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tokens table
CREATE TABLE IF NOT EXISTS matrix_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES matrix_users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT false,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Install logs table
CREATE TABLE IF NOT EXISTS matrix_install_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES matrix_users(id) ON DELETE SET NULL,
  token_id UUID REFERENCES matrix_tokens(id) ON DELETE SET NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  project_name TEXT,
  os TEXT,
  node_version TEXT,
  framework_version TEXT,
  event TEXT NOT NULL DEFAULT 'install' CHECK (event IN ('install', 'heartbeat', 'update', 'purge')),
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Indexes
CREATE INDEX idx_tokens_token ON matrix_tokens(token);
CREATE INDEX idx_tokens_user ON matrix_tokens(user_id);
CREATE INDEX idx_tokens_expires ON matrix_tokens(expires_at);
CREATE INDEX idx_logs_user ON matrix_install_logs(user_id);
CREATE INDEX idx_logs_event ON matrix_install_logs(event);
CREATE INDEX idx_logs_created ON matrix_install_logs(created_at);

-- 5. Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON matrix_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 6. Token generation helper function
-- Generates tokens in format: MTX-XXXX-XXXX-XXXX-XXXX
CREATE OR REPLACE FUNCTION generate_matrix_token()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := 'MTX-';
  i INT;
  g INT;
BEGIN
  FOR g IN 1..4 LOOP
    FOR i IN 1..4 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    IF g < 4 THEN
      result := result || '-';
    END IF;
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 7. Convenience function: create user + token in one call
CREATE OR REPLACE FUNCTION create_premium_user(
  p_name TEXT,
  p_email TEXT,
  p_notes TEXT DEFAULT NULL,
  p_days INT DEFAULT 30
)
RETURNS TABLE(user_id UUID, token TEXT, expires_at TIMESTAMPTZ) AS $$
DECLARE
  v_user_id UUID;
  v_token TEXT;
  v_expires TIMESTAMPTZ;
BEGIN
  -- Create or get user
  INSERT INTO matrix_users (name, email, notes, plan)
  VALUES (p_name, p_email, p_notes, 'premium')
  ON CONFLICT (email) DO UPDATE SET
    plan = 'premium',
    name = EXCLUDED.name,
    notes = COALESCE(EXCLUDED.notes, matrix_users.notes)
  RETURNING id INTO v_user_id;

  -- Generate unique token
  LOOP
    v_token := generate_matrix_token();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM matrix_tokens WHERE matrix_tokens.token = v_token);
  END LOOP;

  v_expires := now() + (p_days || ' days')::INTERVAL;

  -- Create token
  INSERT INTO matrix_tokens (user_id, token, expires_at)
  VALUES (v_user_id, v_token, v_expires);

  RETURN QUERY SELECT v_user_id, v_token, v_expires;
END;
$$ LANGUAGE plpgsql;

-- 8. RLS Policies
ALTER TABLE matrix_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE matrix_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE matrix_install_logs ENABLE ROW LEVEL SECURITY;

-- Admin has full access (via service_role key)
CREATE POLICY "Admin full access users" ON matrix_users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admin full access tokens" ON matrix_tokens
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admin full access logs" ON matrix_install_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Anon can validate tokens (read-only, limited)
CREATE POLICY "Anon validate tokens" ON matrix_tokens
  FOR SELECT USING (auth.role() = 'anon' AND revoked = false);

-- Anon can insert install logs
CREATE POLICY "Anon insert logs" ON matrix_install_logs
  FOR INSERT WITH CHECK (auth.role() = 'anon');
