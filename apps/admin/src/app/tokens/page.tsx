'use client'

import { useState, useEffect } from 'react'

interface Token {
  id: string
  token: string
  expires_at: string
  revoked: boolean
  revoked_at: string | null
  created_at: string
  matrix_users: { name: string; email: string }
}

export default function TokensPage() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => { loadTokens() }, [])

  async function loadTokens() {
    setLoading(true)
    const res = await fetch('/api/data/tokens')
    const data = await res.json()
    setTokens(data)
    setLoading(false)
  }

  async function extendToken(id: string, days: number) {
    const res = await fetch('/api/tokens', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'extend', days }),
    })
    if (res.ok) {
      const data = await res.json()
      setMessage(`✅ Token estendido até ${new Date(data.expires_at).toLocaleDateString('pt-BR')}`)
      loadTokens()
    }
  }

  async function revokeToken(id: string) {
    if (!confirm('Revogar este token? O usuário perderá os agentes premium no próximo heartbeat.')) return

    const res = await fetch('/api/tokens', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'revoke' }),
    })
    if (res.ok) {
      setMessage('✅ Token revogado. Agentes premium serão removidos no próximo uso.')
      loadTokens()
    }
  }

  function getStatus(t: Token) {
    if (t.revoked) return { label: 'REVOGADO', color: '#ff4444' }
    if (new Date(t.expires_at) < new Date()) return { label: 'EXPIRADO', color: '#ff8800' }
    const days = Math.ceil((new Date(t.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (days <= 7) return { label: `${days}d restantes`, color: '#ffaa00' }
    return { label: `${days}d restantes`, color: '#00ff41' }
  }

  const btnStyle = (color: string) => ({
    background: 'transparent',
    border: `1px solid ${color}`,
    color,
    padding: '4px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Courier New', monospace",
    fontSize: '11px',
    marginRight: '6px',
  })

  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '24px' }}>Tokens</h1>

      {message && (
        <div style={{
          background: '#0a2a0a',
          border: '1px solid #1a4a1a',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
        }}>
          {message}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#666' }}>Carregando...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1a3a1a', textAlign: 'left' }}>
              <th style={{ padding: '12px', color: '#888' }}>Usuário</th>
              <th style={{ padding: '12px', color: '#888' }}>Token</th>
              <th style={{ padding: '12px', color: '#888' }}>Status</th>
              <th style={{ padding: '12px', color: '#888' }}>Expira em</th>
              <th style={{ padding: '12px', color: '#888' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map(t => {
              const status = getStatus(t)
              return (
                <tr key={t.id} style={{ borderBottom: '1px solid #111' }}>
                  <td style={{ padding: '12px' }}>
                    {t.matrix_users?.name}
                    <br />
                    <span style={{ color: '#666', fontSize: '12px' }}>{t.matrix_users?.email}</span>
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '13px', color: '#D1FF00' }}>
                    {t.token}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ color: status.color, fontSize: '12px', fontWeight: 'bold' }}>
                      {status.label}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#888' }}>
                    {new Date(t.expires_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {!t.revoked && (
                      <>
                        <button style={btnStyle('#00ff41')} onClick={() => extendToken(t.id, 30)}>+30 dias</button>
                        <button style={btnStyle('#ffaa00')} onClick={() => extendToken(t.id, 7)}>+7 dias</button>
                        <button style={btnStyle('#ff4444')} onClick={() => revokeToken(t.id)}>Revogar</button>
                      </>
                    )}
                    {t.revoked && (
                      <button style={btnStyle('#00ff41')} onClick={() => extendToken(t.id, 30)}>Reativar (+30d)</button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
