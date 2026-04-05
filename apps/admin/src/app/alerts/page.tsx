'use client'

import { useEffect, useState } from 'react'
import { StatCard } from '../components/stat-card'
import { Badge } from '../components/badge'
import { AlertTriangle, Bell, CheckCircle, Shield } from 'lucide-react'

interface Alert {
  id: string
  alert_type: string
  user_id: string
  severity: string
  triggered_at: string
  resolved_at: string | null
  acknowledged: boolean
  data: Record<string, unknown> | null
  notes: string | null
}

type SeverityFilter = 'all' | 'critical' | 'high' | 'medium' | 'low'
type StatusFilter = 'all' | 'active' | 'resolved'

const severityBadge: Record<string, 'destructive' | 'warning' | 'info' | 'secondary'> = {
  critical: 'destructive',
  high: 'warning',
  medium: 'info',
  low: 'secondary',
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [severity, setSeverity] = useState<SeverityFilter>('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [message, setMessage] = useState('')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/data/alerts')
    setAlerts(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = alerts.filter((a) => {
    if (severity !== 'all' && a.severity !== severity) return false
    if (status === 'active' && a.resolved_at) return false
    if (status === 'resolved' && !a.resolved_at) return false
    return true
  })

  const active = alerts.filter((a) => !a.resolved_at).length
  const critical = alerts.filter((a) => a.severity === 'critical' && !a.resolved_at).length
  const acknowledged = alerts.filter((a) => a.acknowledged && !a.resolved_at).length

  async function handleAction(id: string, action: string) {
    const res = await fetch('/api/alerts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    })
    if (res.ok) {
      setMessage(action === 'acknowledge' ? 'Alerta reconhecido' : 'Alerta resolvido')
      setTimeout(() => setMessage(''), 3000)
      load()
    }
  }

  const fmt = (d: string) => new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alertas</h1>
          <p className="text-sm text-muted-foreground">Monitoramento de alertas do sistema</p>
        </div>
        <button onClick={load} className="border border-border text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl text-sm">Atualizar</button>
      </div>

      {message && (
        <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-xl text-sm">{message}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Alertas Ativos" value={active} icon={Bell} />
        <StatCard label="Críticos Não Resolvidos" value={critical} icon={AlertTriangle} variant={critical > 0 ? 'destructive' : 'default'} />
        <StatCard label="Reconhecidos" value={acknowledged} icon={CheckCircle} />
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'critical', 'high', 'medium', 'low'] as SeverityFilter[]).map((s) => (
          <button key={s} onClick={() => setSeverity(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${severity === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
            {s === 'all' ? 'Todos' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <span className="border-l border-border mx-2" />
        {(['all', 'active', 'resolved'] as StatusFilter[]).map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${status === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
            {s === 'all' ? 'Todos' : s === 'active' ? 'Ativos' : 'Resolvidos'}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Usuário</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Severidade</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Data</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td colSpan={6} className="px-4 py-4"><div className="h-4 bg-muted/30 rounded animate-pulse" /></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Nenhum alerta encontrado
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr key={a.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3"><Badge label={a.alert_type} /></td>
                  <td className="px-4 py-3 text-sm font-mono text-foreground">{a.user_id?.slice(0, 12)}</td>
                  <td className="px-4 py-3"><Badge label={a.severity} variant={severityBadge[a.severity] || 'secondary'} /></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{fmt(a.triggered_at)}</td>
                  <td className="px-4 py-3">
                    <Badge label={a.resolved_at ? 'Resolvido' : 'Ativo'} variant={a.resolved_at ? 'success' : 'destructive'} />
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    {!a.acknowledged && (
                      <button onClick={() => handleAction(a.id, 'acknowledge')}
                        className="px-2 py-1 rounded-md text-xs font-medium border border-primary/30 text-primary hover:bg-primary/10">
                        Reconhecer
                      </button>
                    )}
                    {!a.resolved_at && (
                      <button onClick={() => handleAction(a.id, 'resolve')}
                        className="px-2 py-1 rounded-md text-xs font-medium border border-primary/30 text-primary hover:bg-primary/10">
                        Resolver
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
