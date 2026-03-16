import { supabase } from '@/lib/supabase'

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

  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: expiringTokens } = await supabase
    .from('matrix_tokens')
    .select('*, matrix_users(name, email)')
    .eq('revoked', false)
    .gte('expires_at', new Date().toISOString())
    .lte('expires_at', sevenDaysFromNow)

  const { count: installsThisMonth } = await supabase
    .from('matrix_install_logs')
    .select('*', { count: 'exact', head: true })
    .eq('event', 'install')
    .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

  const cardStyle = {
    background: '#111',
    border: '1px solid #1a3a1a',
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center' as const,
  }

  const numberStyle = {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#00ff41',
  }

  const labelStyle = {
    fontSize: '14px',
    color: '#666',
    marginTop: '8px',
  }

  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '32px' }}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
        <div style={cardStyle}>
          <div style={numberStyle}>{totalUsers || 0}</div>
          <div style={labelStyle}>Total Users</div>
        </div>
        <div style={cardStyle}>
          <div style={numberStyle}>{premiumUsers || 0}</div>
          <div style={labelStyle}>Premium Users</div>
        </div>
        <div style={cardStyle}>
          <div style={numberStyle}>{activeTokens?.length || 0}</div>
          <div style={labelStyle}>Active Tokens</div>
        </div>
        <div style={cardStyle}>
          <div style={numberStyle}>{installsThisMonth || 0}</div>
          <div style={labelStyle}>Installs (mês)</div>
        </div>
      </div>

      {expiringTokens && expiringTokens.length > 0 && (
        <div style={{ background: '#1a1a00', border: '1px solid #4a4a00', borderRadius: '8px', padding: '24px', marginBottom: '32px' }}>
          <h2 style={{ color: '#ffaa00', fontSize: '18px', marginTop: 0 }}>⚠️ Tokens expirando em 7 dias</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
                <th style={{ padding: '8px', color: '#888' }}>Usuário</th>
                <th style={{ padding: '8px', color: '#888' }}>Token</th>
                <th style={{ padding: '8px', color: '#888' }}>Expira em</th>
              </tr>
            </thead>
            <tbody>
              {expiringTokens.map((t: any) => {
                const days = Math.ceil((new Date(t.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                return (
                  <tr key={t.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <td style={{ padding: '8px' }}>{t.matrix_users?.name} ({t.matrix_users?.email})</td>
                    <td style={{ padding: '8px', fontFamily: 'monospace', color: '#ffaa00' }}>{t.token}</td>
                    <td style={{ padding: '8px', color: days <= 3 ? '#ff4444' : '#ffaa00' }}>{days} dias</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
