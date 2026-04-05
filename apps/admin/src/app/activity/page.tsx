'use client'

import { useEffect, useState } from 'react'
import { StatCard } from '../components/stat-card'
import { Badge } from '../components/badge'
import { Activity, Wrench, Clock, Shield } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const tooltipStyle = { backgroundColor: '#0d1610', border: '1px solid rgba(0,255,102,0.2)', borderRadius: '12px', color: '#e8ffee' }

type Tab = 'sessions' | 'tools' | 'integrity'
type Range = '1d' | '7d' | '30d'

const eventVariant: Record<string, 'success' | 'warning' | 'destructive' | 'info' | 'secondary'> = {
  prompt: 'info', agent: 'success', integrity_report: 'destructive', tool_use: 'warning',
}

export default function ActivityPage() {
  const [tab, setTab] = useState<Tab>('sessions')
  const [range, setRange] = useState<Range>('7d')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Record<string, unknown>[]>([])
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState<{ eventsToday: number; toolsToday: number; avgDuration: number; topTools: { tool: string; count: number }[] } | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadData() {
    setLoading(true)
    const res = await fetch(`/api/data/activity?tab=${tab}&page=${page}&range=${range}`)
    const json = await res.json()
    setData(json.data || [])
    setTotal(json.total || 0)
    setLoading(false)
  }

  async function loadStats() {
    const res = await fetch('/api/data/activity/stats')
    setStats(await res.json())
  }

  useEffect(() => { loadStats() }, [])
  useEffect(() => { loadData() }, [tab, page, range])

  const totalPages = Math.ceil(total / 50)
  const fmt = (d: string) => new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Atividade</h1>
        <p className="text-sm text-muted-foreground">Monitoramento de sessões, ferramentas e integridade</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Eventos Hoje" value={stats?.eventsToday || 0} icon={Activity} />
        <StatCard label="Tools Hoje" value={stats?.toolsToday || 0} icon={Wrench} />
        <StatCard label="Duração Média" value={`${stats?.avgDuration || 0}ms`} icon={Clock} />
      </div>

      {stats?.topTools && stats.topTools.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Top 10 Ferramentas (7 dias)</h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topTools} layout="vertical">
                <XAxis type="number" stroke="#e8ffee" fontSize={11} />
                <YAxis type="category" dataKey="tool" width={120} stroke="#e8ffee" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#00ff66" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          {([['sessions', 'Activity Log'], ['tools', 'Tool Usage'], ['integrity', 'Integridade']] as [Tab, string][]).map(([t, label]) => (
            <button key={t} onClick={() => { setTab(t); setPage(1) }}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          {(['1d', '7d', '30d'] as Range[]).map((r) => (
            <button key={r} onClick={() => { setRange(r); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${range === r ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
              {r === '1d' ? 'Hoje' : r}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {tab === 'tools' ? (
          <table className="w-full">
            <thead><tr className="border-b border-border">
              {['Tool', 'Ext', 'Comando', 'Exit', 'Duração', 'Data'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border"><td colSpan={6} className="px-4 py-4"><div className="h-4 bg-muted/30 rounded animate-pulse" /></td></tr>
              )) : data.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground"><Wrench className="w-8 h-8 mx-auto mb-2 opacity-50" />Sem dados de ferramentas</td></tr>
              ) : data.map((d, i) => (
                <tr key={i} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3"><Badge label={String(d.tool || '')} variant="info" /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{String(d.file_ext || '—')}</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground truncate max-w-[200px]">{String(d.command_head || '—')}</td>
                  <td className="px-4 py-3"><Badge label={String(d.exit_code ?? '—')} variant={d.exit_code === 0 ? 'success' : d.exit_code != null ? 'destructive' : 'secondary'} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{d.duration_ms ? `${d.duration_ms}ms` : '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{fmt(String(d.created_at))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full">
            <thead><tr className="border-b border-border">
              {['Tipo', 'Session', 'Projeto', 'Data'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border"><td colSpan={4} className="px-4 py-4"><div className="h-4 bg-muted/30 rounded animate-pulse" /></td></tr>
              )) : data.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground"><Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />{tab === 'integrity' ? 'Nenhum alerta de integridade' : 'Sem dados de atividade'}</td></tr>
              ) : data.map((d, i) => (
                <tr key={i} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3"><Badge label={String(d.event_type || '')} variant={eventVariant[String(d.event_type)] || 'secondary'} /></td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{String(d.session_id || '').slice(0, 12)}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{String(d.project_name || '—')}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{fmt(String(d.created_at))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 rounded-lg text-xs border border-border text-muted-foreground disabled:opacity-30">←</button>
          <span className="px-3 py-1.5 text-xs text-muted-foreground">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 rounded-lg text-xs border border-border text-muted-foreground disabled:opacity-30">→</button>
        </div>
      )}
    </div>
  )
}
