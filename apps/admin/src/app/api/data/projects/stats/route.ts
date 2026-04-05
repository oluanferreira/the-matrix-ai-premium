import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { data: progress } = await supabase
    .from('matrix_project_progress')
    .select('project_name, stories_done, stories_in_progress, stories_blocked, stories_total')

  const totalProjects = new Set((progress || []).map((p) => p.project_name)).size
  const activeStories = (progress || []).reduce((s, p) => s + (p.stories_in_progress || 0), 0)
  const completedStories = (progress || []).reduce((s, p) => s + (p.stories_done || 0), 0)
  const blockedStories = (progress || []).reduce((s, p) => s + (p.stories_blocked || 0), 0)

  let stuckUsers: unknown[] = []
  try {
    const { data } = await supabase.rpc('get_stuck_users')
    stuckUsers = data || []
  } catch {
    stuckUsers = []
  }

  return NextResponse.json({
    totalProjects,
    activeStories,
    completedStories,
    stuckUsers,
    storyDistribution: [
      { name: 'Concluídas', value: completedStories },
      { name: 'Em Progresso', value: activeStories },
      { name: 'Bloqueadas', value: blockedStories },
    ],
  })
}
