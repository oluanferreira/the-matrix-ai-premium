'use client'

import { useEffect, useState } from 'react'
import { StatCard } from '../components/stat-card'
import { Badge } from '../components/badge'
import { BookOpen, GitBranch, Users as UsersIcon, Activity } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'

const tooltipStyle = { backgroundColor: '#0d1610', border: '1px solid rgba(0,255,102,0.2)', borderRadius: '12px', color: '#e8ffee' }

interface StoryEvent {
  id: string; story_id: string; event: string; agent: string | null; project_name: string; created_at: string
}

const eventVariant: Record<string, 'success' | 'warning' | 'destructive' | 'info' | 'secondary'> = {
  created: 'info', started: 'success', in_progress: 'warning', completed: 'success', blocked: 'destructive',
}

export default function StoriesPage() {
  const [events, setEvents] = useState<StoryEvent[]>([])
  const [stats, setStats] = useState<{ totalEvents: number; uniqueStories: number; activeAgents: number; funnelData: { event: string; count: number }[]; dailyData: { date: string; count: number }[] } | null>(null)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const perPage = 50

  useEffect(() => {
    fetch('/api/data/stories').then((r) => r.json()).then(setEvents)
    fetch('/api/data/stories/stats').then((r) => r.json()).then(setStats)
  }, [])

  const filtered = filter === 'all' ? events : events.filter((e) => e.event === filter)
  const paged = filtered.slice((page - 1) * perPage, page * perPage)
  const totalPages = Math.ceil(filtered.length / perPage)
  const fmt = (d: string) => new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Stories</h1>
        <p className="text-sm text-muted-foreground">Lifecycle de stories e eventos dos usuários</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total de Eventos" value={stats?.totalEvents || 0} icon={Activity} />
        <StatCard label="Stories Únicas" value={stats?.uniqueStories || 0} icon={BookOpen} />
        <StatCard label="Agentes Ativos" value={stats?.activeAgents || 0} icon={UsersIcon} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Funil de Lifecycle</h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.funnelData || []}>
                <XAxis dataKey="event" stroke="#e8ffee" fontSize={11} />
                <YAxis stroke="#e8ffee" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#00ff66" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Eventos / 30 dias</h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.dailyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,102,0.1)" />
                <XAxis dataKey="date" stroke="#e8ffee" fontSize={10} tickFormatter={(d) => d.slice(5)} />
                <YAxis stroke="#e8ffee" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="#00ff66" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {['all', 'created', 'started', 'in_progress', 'completed', 'blocked'].map((e) => (
          <button key={e} onClick={() => { setFilter(e); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filter === e ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
            {e === 'all' ? 'Todos' : e}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {['Story ID', 'Evento', 'Agente', 'Projeto', 'Data'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground"><BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />Nenhum evento</td></tr>
            ) : paged.map((e) => (
              <tr key={e.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 text-sm font-mono text-foreground">{e.story_id}</td>
                <td className="px-4 py-3"><Badge label={e.event} variant={eventVariant[e.event] || 'secondary'} /></td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{e.agent || '—'}</td>
                <td className="px-4 py-3 text-sm text-foreground">{e.project_name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{fmt(e.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
