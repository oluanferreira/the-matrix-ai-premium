import { supabase } from '@/lib/supabase'
import { Users, Crown, Key, Activity, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const { count: totalUsers } = await supabase
    .from('matrix_users')
    .select('*', { count: 'exact', head: true })

  const { count: premiumUsers } = await supabase
    .from('matrix_users')
    .select('*', { count: 'exact', head: true })
    .eq('plan', 'premium')

  const { data: activeTokens } = await supabase
    .from('matrix_tokens')
    .select('*')
    .eq('revoked', false)
    .gte('expires_at', new Date().toISOString())

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { count: installsWeek } = await supabase
    .from('matrix_install_logs')
    .select('*', { count: 'exact', head: true })
    .eq('event', 'install')
    .gte('created_at', sevenDaysAgo)

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { count: installsMonth } = await supabase
    .from('matrix_install_logs')
    .select('*', { count: 'exact', head: true })
    .eq('event', 'install')
    .gte('created_at', thirtyDaysAgo)

  const { data: recentActivity } = await supabase
    .from('matrix_install_logs')
    .select('*, matrix_users(name, email, plan)')
    .eq('event', 'install')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: heartbeat } = await supabase
    .from('matrix_install_logs')
    .select('created_at')
    .eq('event', 'heartbeat')
    .order('created_at', { ascending: false })
    .limit(1)

  const lastHeartbeat = heartbeat?.[0]?.created_at
  const heartbeatAge = lastHeartbeat
    ? Math.round((Date.now() - new Date(lastHeartbeat).getTime()) / 60000)
    : null

  return (
    <>
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Visão Geral</h1>
        <p className="text-sm text-muted-foreground mt-1">Resumo do sistema The Matrix AI</p>
      </div>

      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Users */}
        <div className="bg-card border border-border rounded-2xl shadow-xs">
          <div className="flex flex-col gap-1.5 p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total de Usuários</span>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-3xl font-bold text-foreground">{totalUsers || 0}</span>
          </div>
        </div>

        {/* Premium Users — highlight card */}
        <div className="bg-primary text-primary-foreground rounded-2xl shadow-xs">
          <div className="flex flex-col gap-1.5 p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary-foreground/70">Usuários Premium</span>
              <Crown className="w-4 h-4 text-primary-foreground/70" />
            </div>
            <span className="text-3xl font-bold">{premiumUsers || 0}</span>
          </div>
        </div>

        {/* Active Tokens */}
        <div className="bg-card border border-border rounded-2xl shadow-xs">
          <div className="flex flex-col gap-1.5 p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Tokens Ativos</span>
              <Key className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-3xl font-bold text-foreground">{activeTokens?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Row 2: Installs + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        {/* Installs */}
        <div className="bg-card border border-border rounded-2xl shadow-xs">
          <div className="flex flex-col gap-1.5 p-6 pb-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground">Instalações</h2>
            </div>
            <div className="flex items-end gap-8 mt-2">
              <div>
                <span className="text-3xl font-bold text-foreground">{installsWeek || 0}</span>
                <span className="text-sm text-muted-foreground ml-2">últimos 7 dias</span>
              </div>
              <div className="pb-1">
                <span className="text-lg font-semibold text-muted-foreground">{installsMonth || 0}</span>
                <span className="text-sm text-muted-foreground ml-2">últimos 30 dias</span>
              </div>
            </div>
          </div>
          <div className="px-6 pb-6 pt-3">
            <div className="flex gap-2">
              <div className="flex-1 bg-primary/10 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-primary">{installsWeek || 0}</div>
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">7 dias</div>
              </div>
              <div className="flex-1 bg-muted rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-foreground">{installsMonth || 0}</div>
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">30 dias</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-2xl shadow-xs">
          <div className="flex flex-col gap-1.5 p-6 pb-3">
            <h2 className="text-sm font-medium text-muted-foreground">Atividade Recente</h2>
          </div>
          <div className="px-6 pb-6 pt-0">
            <div className="space-y-3">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((log: any) => (
                  <div key={log.id} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-primary text-[10px] font-bold shrink-0">
                      {log.matrix_users?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-foreground truncate">
                        {log.matrix_users?.name || 'Anônimo'}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {new Date(log.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        log.matrix_users?.plan === 'premium'
                          ? 'bg-primary/15 text-primary'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {log.matrix_users?.plan === 'premium' ? 'Premium' : 'Free'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade recente.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: System Monitoring */}
      <div className="bg-card border border-border rounded-2xl shadow-xs">
        <div className="flex flex-col gap-1.5 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">Sistema</h2>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
              </span>
              <span className="text-sm font-medium text-foreground">Heartbeat API</span>
            </div>
            {heartbeatAge !== null && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Último sinal há {heartbeatAge < 60 ? `${heartbeatAge}min` : `${Math.round(heartbeatAge / 60)}h`}</span>
              </div>
            )}
            <span className="ml-auto inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
              Online
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
