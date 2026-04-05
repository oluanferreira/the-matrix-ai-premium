'use client'

import { useEffect, useState } from 'react'
import { StatCard } from '../components/stat-card'
import { Badge } from '../components/badge'
import { BarChart3, Zap, TrendingUp, AlertTriangle } from 'lucide-react'
import { LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const tooltipStyle = { backgroundColor: '#0d1610', border: '1px solid rgba(0,255,102,0.2)', borderRadius: '12px', color: '#e8ffee' }

type Range = '7d' | '30d' | '90d'
type Tab = 'metrics' | 'scores'

interface DailyMetric {
  id: string; user_id: string; date: string; sessions_count: number; prompts_count: number
  stories_created: number; stories_completed: number; qa_gates_total: number; qa_gates_passed: number
  bash_commands: number; bash_errors: number; activity_score: number
}
interface UserScore {
  user_id: string; plan: string | null; activity_score: number; churn_score: number; velocity_7d: number
  qa_first_pass_rate: number; user_profile: string | null; experience_tier: string | null; last_seen_at: string | null
}

const tierColor: Record<string, string> = { new: '#3b82f6', active: '#00ff66', power: '#a855f7', dormant: '#ff4d4f' }

export default function TelemetryPage() {
  const [range, setRange] = useState<Range>('30d')
  const [tab, setTab] = useState<Tab>('metrics')
  const [charts, setCharts] = useState<{ dailyTrend: { date: string; sessions: number; prompts: number; stories: number }[]; scatterData: { user_id: string; activity_score: number; churn_score: number; experience_tier: string }[]; sessionsToday: number; promptsToday: number; avgActivityScore: number; highChurnCount: number } | null>(null)
  const [metrics, setMetrics] = useState<DailyMetric[]>([])
  const [metricsTotal, setMetricsTotal] = useState(0)
  const [metricsPage, setMetricsPage] = useState(1)
  const [scores, setScores] = useState<UserScore[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/data/telemetry/charts?range=${range}`).then((r) => r.json()).then(setCharts)
  }, [range])

  useEffect(() => {
    if (tab === 'metrics') {
      setLoading(true)
      fetch(`/api/data/telemetry/metrics?page=${metricsPage}`).then((r) => r.json()).then((j) => {
        setMetrics(j.data || []); setMetricsTotal(j.total || 0); setLoading(false)
      })
    } else {
      setLoading(true)
      fetch('/api/data/telemetry/scores').then((r) => r.json()).then((d) => { setScores(d); setLoading(false) })
    }
  }, [tab, metricsPage])

  const metricsTotalPages = Math.ceil(metricsTotal / 50)
  const fmt = (d: string | null) => d ? new Date(d).toLocaleString('pt-BR', { dateStyle: 'short' }) : '—'

  const churnVariant = (s: number): 'success' | 'warning' | 'destructive' => s < 0.3 ? 'success' : s < 0.7 ? 'warning' : 'destructive'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Telemetria</h1>
        <p className="text-sm text-muted-foreground">Métricas de uso, scores e saúde dos usuários</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Sessões Hoje" value={charts?.sessionsToday || 0} icon={BarChart3} />
        <StatCard label="Prompts Hoje" value={charts?.promptsToday || 0} icon={Zap} />
        <StatCard label="Activity Score Médio" value={charts?.avgActivityScore || 0} icon={TrendingUp} />
        <StatCard label="Alto Risco de Churn" value={charts?.highChurnCount || 0} icon={AlertTriangle} variant={(charts?.highChurnCount || 0) > 0 ? 'warning' : 'default'} />
      </div>

      <div className="flex gap-2 mb-4">
        {(['7d', '30d', '90d'] as Range[]).map((r) => (
          <button key={r} onClick={() => setRange(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${range === r ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
            {r}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Atividade / {range}</h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.dailyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,102,0.1)" />
                <XAxis dataKey="date" stroke="#e8ffee" fontSize={10} tickFormatter={(d) => d.slice(5)} />
                <YAxis stroke="#e8ffee" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="sessions" stroke="#00ff66" strokeWidth={2} dot={false} name="Sessões" />
                <Line type="monotone" dataKey="prompts" stroke="#3b82f6" strokeWidth={2} dot={false} name="Prompts" />
                <Line type="monotone" dataKey="stories" stroke="#a855f7" strokeWidth={2} dot={false} name="Stories" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Saúde dos Usuários</h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,102,0.1)" />
                <XAxis type="number" dataKey="activity_score" name="Activity" stroke="#e8ffee" fontSize={11} />
                <YAxis type="number" dataKey="churn_score" name="Churn" stroke="#e8ffee" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => typeof v === 'number' ? v.toFixed(2) : v} />
                <Scatter data={charts?.scatterData || []} fill="#00ff66">
                  {(charts?.scatterData || []).map((entry, i) => (
                    <circle key={i} fill={tierColor[entry.experience_tier] || '#00ff66'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {(['metrics', 'scores'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {t === 'metrics' ? 'Métricas Diárias' : 'Scores de Usuário'}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {tab === 'metrics' ? (
          <table className="w-full">
            <thead><tr className="border-b border-border">
              {['Usuário', 'Data', 'Sessões', 'Prompts', 'Stories', 'QA Gates', 'Bash', 'Score'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border"><td colSpan={8} className="px-4 py-4"><div className="h-4 bg-muted/30 rounded animate-pulse" /></td></tr>
              )) : metrics.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground"><BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />Sem métricas</td></tr>
              ) : metrics.map((m) => (
                <tr key={m.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-foreground">{m.user_id?.slice(0, 12)}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{m.date}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{m.sessions_count}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{m.prompts_count}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{m.stories_created}/{m.stories_completed}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{m.qa_gates_passed}/{m.qa_gates_total}</td>
                  <td className="px-4 py-3 text-sm">
                    {m.bash_commands}
                    {m.bash_errors > 0 && <span className="text-destructive ml-1">({m.bash_errors} err)</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-primary font-medium">{Number(m.activity_score).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full">
            <thead><tr className="border-b border-border">
              {['Usuário', 'Plano', 'Activity', 'Churn', 'Velocity', 'QA Rate', 'Perfil', 'Tier', 'Visto'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border"><td colSpan={9} className="px-4 py-4"><div className="h-4 bg-muted/30 rounded animate-pulse" /></td></tr>
              )) : scores.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground"><TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />Sem scores</td></tr>
              ) : scores.map((s) => (
                <tr key={s.user_id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-foreground">{s.user_id?.slice(0, 12)}</td>
                  <td className="px-4 py-3"><Badge label={s.plan || 'free'} variant={s.plan === 'premium' ? 'success' : 'secondary'} /></td>
                  <td className="px-4 py-3 text-sm text-primary font-medium">{Number(s.activity_score).toFixed(1)}</td>
                  <td className="px-4 py-3"><Badge label={Number(s.churn_score).toFixed(2)} variant={churnVariant(Number(s.churn_score))} /></td>
                  <td className="px-4 py-3 text-sm text-foreground">{Number(s.velocity_7d).toFixed(1)}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{(Number(s.qa_first_pass_rate) * 100).toFixed(0)}%</td>
                  <td className="px-4 py-3"><Badge label={s.user_profile || 'new'} /></td>
                  <td className="px-4 py-3"><Badge label={s.experience_tier || 'new'} variant={s.experience_tier === 'power' ? 'success' : s.experience_tier === 'dormant' ? 'destructive' : 'info'} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{fmt(s.last_seen_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {tab === 'metrics' && metricsTotalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={metricsPage <= 1} onClick={() => setMetricsPage(metricsPage - 1)} className="px-3 py-1.5 rounded-lg text-xs border border-border text-muted-foreground disabled:opacity-30">←</button>
          <span className="px-3 py-1.5 text-xs text-muted-foreground">{metricsPage} / {metricsTotalPages}</span>
          <button disabled={metricsPage >= metricsTotalPages} onClick={() => setMetricsPage(metricsPage + 1)} className="px-3 py-1.5 rounded-lg text-xs border border-border text-muted-foreground disabled:opacity-30">→</button>
        </div>
      )}
    </div>
  )
}
