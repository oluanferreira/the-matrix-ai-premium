'use client'

import { useEffect, useState } from 'react'
import { StatCard } from '../components/stat-card'
import { Badge } from '../components/badge'
import { FolderGit2, BookOpen, AlertTriangle, CheckCircle, FileText } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const tooltipStyle = { backgroundColor: '#0d1610', border: '1px solid rgba(0,255,102,0.2)', borderRadius: '12px', color: '#e8ffee' }
const COLORS = ['#00ff66', '#3b82f6', '#ff4d4f']

interface ProjectProgress {
  id: string; user_id: string; project_name: string; active_story: string | null; story_status: string | null
  stories_done: number; stories_total: number; stories_in_progress: number; stories_blocked: number
  last_agent: string | null; git_branch: string | null; synced_at: string
}
interface ProjectState {
  id: string; file_type: string; file_path: string; file_name: string; content_hash: string | null; synced_at: string
}
interface StuckUser { user_id: string; project_name: string; active_story: string; stories_in_progress: number }

export default function ProjectsPage() {
  const [tab, setTab] = useState<'progress' | 'documents'>('progress')
  const [progress, setProgress] = useState<ProjectProgress[]>([])
  const [documents, setDocuments] = useState<ProjectState[]>([])
  const [stats, setStats] = useState<{ totalProjects: number; activeStories: number; completedStories: number; stuckUsers: StuckUser[]; storyDistribution: { name: string; value: number }[] } | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const [pRes, sRes] = await Promise.all([
      fetch(`/api/data/projects?tab=${tab}`),
      fetch('/api/data/projects/stats'),
    ])
    if (tab === 'progress') setProgress(await pRes.json())
    else setDocuments(await pRes.json())
    setStats(await sRes.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [tab])

  const fmt = (d: string) => new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
  const stuck = stats?.stuckUsers || []

  const filteredProgress = progress.filter((p) => !search || p.project_name.toLowerCase().includes(search.toLowerCase()))
  const filteredDocs = documents.filter((d) => !search || d.file_path.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Projetos</h1>
        <p className="text-sm text-muted-foreground">Progresso e documentos sincronizados dos usuários</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Projetos" value={stats?.totalProjects || 0} icon={FolderGit2} />
        <StatCard label="Stories Ativas" value={stats?.activeStories || 0} icon={BookOpen} />
        <StatCard label="Concluídas" value={stats?.completedStories || 0} icon={CheckCircle} />
        <StatCard label="Stuck Users" value={stuck.length} icon={AlertTriangle} variant={stuck.length > 0 ? 'warning' : 'default'} />
      </div>

      {stuck.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">{stuck.length} projetos parados há mais de 3 dias</span>
          </div>
          <div className="space-y-1">
            {stuck.map((s, i) => (
              <div key={i} className="text-xs text-amber-400/80">{s.user_id?.slice(0, 12)} — {s.project_name} — {s.active_story}</div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Distribuição de Stories</h2>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats?.storyDistribution || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {(stats?.storyDistribution || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          {(['progress', 'documents'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              {t === 'progress' ? 'Progresso' : 'Documentos'}
            </button>
          ))}
        </div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar projeto..."
          className="ml-auto bg-input/30 border border-input rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 w-64" />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {tab === 'progress' ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Projeto', 'Usuário', 'Story Ativa', 'Status', 'Progresso', 'Agente', 'Branch', 'Sync'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border"><td colSpan={8} className="px-4 py-4"><div className="h-4 bg-muted/30 rounded animate-pulse" /></td></tr>
              )) : filteredProgress.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground"><FolderGit2 className="w-8 h-8 mx-auto mb-2 opacity-50" />Nenhum projeto</td></tr>
              ) : filteredProgress.map((p) => (
                <tr key={p.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{p.project_name}</td>
                  <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{p.user_id?.slice(0, 12)}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{p.active_story || '—'}</td>
                  <td className="px-4 py-3"><Badge label={p.story_status || 'unknown'} variant={p.story_status === 'completed' ? 'success' : p.story_status === 'blocked' ? 'destructive' : 'info'} /></td>
                  <td className="px-4 py-3 text-sm text-foreground">{p.stories_done}/{p.stories_total}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{p.last_agent || '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{p.git_branch || '—'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{fmt(p.synced_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Tipo', 'Path', 'Arquivo', 'Hash', 'Sync'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border"><td colSpan={5} className="px-4 py-4"><div className="h-4 bg-muted/30 rounded animate-pulse" /></td></tr>
              )) : filteredDocs.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground"><FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />Nenhum documento</td></tr>
              ) : filteredDocs.map((d) => (
                <tr key={d.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3"><Badge label={d.file_type} /></td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{d.file_path}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{d.file_name}</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{d.content_hash?.slice(0, 8) || '—'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{fmt(d.synced_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
