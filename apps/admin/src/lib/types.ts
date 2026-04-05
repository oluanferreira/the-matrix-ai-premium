// Re-export existing types
export type { MatrixUser, MatrixToken, InstallLog } from './supabase'

// --- Telemetry Tables ---

export interface SessionActivity {
  id: string
  user_id: string
  session_id: string
  project_name: string
  event_type: string
  data: Record<string, unknown>
  created_at: string
}

export interface ToolUsage {
  id: string
  user_id: string
  token_hash: string
  session_id: string
  tool: string
  file_ext: string | null
  command_head: string | null
  exit_code: number | null
  duration_ms: number | null
  created_at: string
}

export interface ProjectState {
  id: string
  user_id: string
  token_id: string
  project_name: string
  file_type: string
  file_path: string
  file_name: string
  content: string
  content_hash: string
  metadata: Record<string, unknown> | null
  synced_at: string
}

export interface ProjectProgress {
  id: string
  user_id: string
  token_hash: string
  project_name: string
  project_id: string | null
  active_story: string | null
  story_status: string | null
  stories_done: number
  stories_total: number
  stories_in_progress: number
  stories_blocked: number
  last_agent: string | null
  last_action: string | null
  next_steps: string[]
  decisions_count: number
  git_branch: string | null
  stack_detected: string | null
  synced_at: string
}

export interface StoryEvent {
  id: string
  user_id: string
  token_hash: string
  project_name: string
  story_id: string
  event: string
  agent: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface DailyMetrics {
  id: string
  user_id: string
  date: string
  sessions_count: number
  prompts_count: number
  stories_created: number
  stories_completed: number
  agents_used: string[]
  dominant_category: string | null
  avg_session_duration_min: number | null
  qa_gates_total: number
  qa_gates_passed: number
  debug_events: number
  total_events: number
  bash_commands: number
  bash_errors: number
  activity_score: number
}

export interface UserScore {
  user_id: string
  plan: string
  first_seen_at: string
  last_seen_at: string
  total_sessions: number
  activity_score: number
  churn_score: number
  velocity_7d: number
  qa_first_pass_rate: number | null
  agent_diversity: number
  debug_frequency: number
  user_profile: string | null
  experience_tier: string | null
  onboarding_stage: number | null
  updated_at: string
}

export interface Alert {
  id: string
  alert_type: string
  user_id: string | null
  severity: 'low' | 'medium' | 'high' | 'critical'
  triggered_at: string
  resolved_at: string | null
  acknowledged: boolean
  data: Record<string, unknown> | null
  notes: string | null
}

export interface OnboardingFunnel {
  user_id: string
  stage_0_at: string | null
  stage_1_at: string | null
  stage_2_at: string | null
  stage_3_at: string | null
  stage_4_at: string | null
  stage_5_at: string | null
  stage_6_at: string | null
  stage_7_at: string | null
}
