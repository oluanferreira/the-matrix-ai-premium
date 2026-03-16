import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Admin client with service role (full access)
export const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Types
export interface MatrixUser {
  id: string
  name: string
  email: string
  notes: string | null
  plan: 'free' | 'premium'
  created_at: string
  updated_at: string
}

export interface MatrixToken {
  id: string
  user_id: string
  token: string
  expires_at: string
  revoked: boolean
  revoked_at: string | null
  created_at: string
  matrix_users?: MatrixUser
}

export interface InstallLog {
  id: string
  user_id: string | null
  token_id: string | null
  plan: string
  project_name: string | null
  os: string | null
  node_version: string | null
  framework_version: string | null
  event: 'install' | 'heartbeat' | 'update' | 'purge'
  ip_address: string | null
  created_at: string
  matrix_users?: MatrixUser
}
