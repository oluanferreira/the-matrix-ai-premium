import { supabase } from '@/lib/supabase'
import { StatCard } from '../components/stat-card'
import { Badge } from '../components/badge'
import { GraduationCap, Users, CheckCircle, TrendingUp } from 'lucide-react'
import { FunnelChart } from './funnel-chart'

export const dynamic = 'force-dynamic'

const stageLabels = [
  'Instalação',
  'Primeiro Prompt',
  'Primeiro Agente',
  'Primeira Story',
  'Primeiro QA Gate',
  'Primeiro Deploy',
  'Multi-Agente',
  'Power User',
]

export default async function OnboardingPage() {
  const { data: rows } = await supabase.from('telemetry_onboarding').select('*')
  const users = rows || []

  const total = users.length
  const completed = users.filter((u) => u.stage_7_at).length
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0

  const stageData = stageLabels.map((label, i) => ({
    stage: label,
    count: users.filter((u) => u[`stage_${i}_at` as keyof typeof u]).length,
  }))

  const getFurthest = (u: Record<string, unknown>) => {
    for (let i = 7; i >= 0; i--) {
      if (u[`stage_${i}_at`]) return i
    }
    return -1
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Onboarding</h1>
        <p className="text-sm text-muted-foreground">Progressão dos usuários no funil de ativação</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Usuários Rastreados" value={total} icon={Users} />
        <StatCard label="Completaram Onboarding" value={completed} icon={CheckCircle} />
        <StatCard label="Taxa de Conversão" value={`${rate}%`} icon={TrendingUp} variant="highlight" />
      </div>

      <FunnelChart stageData={stageData} />

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Usuário</th>
              {stageLabels.map((label, i) => (
                <th key={i} className="text-center px-2 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{i}</th>
              ))}
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Estágio</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.user_id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 text-sm font-mono text-foreground">{u.user_id?.slice(0, 12)}...</td>
                {stageLabels.map((_, i) => (
                  <td key={i} className="text-center px-2 py-3 text-sm">
                    {u[`stage_${i}_at` as keyof typeof u] ? '✅' : '—'}
                  </td>
                ))}
                <td className="text-center px-4 py-3">
                  <Badge label={`Stage ${getFurthest(u as Record<string, unknown>)}`} variant={getFurthest(u as Record<string, unknown>) >= 7 ? 'success' : 'info'} />
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                  <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Nenhum dado de onboarding ainda
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
