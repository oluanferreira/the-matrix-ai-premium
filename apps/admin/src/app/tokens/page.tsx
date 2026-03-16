'use client'

import { useState, useEffect } from 'react'
import { Key, RefreshCw } from 'lucide-react'

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
      setMessage(`Token estendido até ${new Date(data.expires_at).toLocaleDateString('pt-BR')}`)
      setTimeout(() => setMessage(''), 4000)
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
      setMessage('Token revogado. Agentes premium serão removidos no próximo uso.')
      setTimeout(() => setMessage(''), 4000)
      loadTokens()
    }
  }

  function getStatus(t: Token) {
    if (t.revoked) return { label: 'REVOGADO', className: 'bg-destructive/10 text-destructive' }
    if (new Date(t.expires_at) < new Date()) return { label: 'EXPIRADO', className: 'bg-amber-500/15 text-amber-400' }
    const days = Math.ceil((new Date(t.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (days <= 7) return { label: `ATIVO (${days}d)`, className: 'bg-amber-500/15 text-amber-400' }
    return { label: 'ATIVO', className: 'bg-success/10 text-success' }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tokens</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerenciar tokens de acesso premium</p>
        </div>
        <button
          onClick={() => loadTokens()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className="p-4 rounded-xl text-sm font-medium bg-primary/10 border border-primary/20 text-primary">
          {message}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">Carregando...</div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Usuário</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Token</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Expira em</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((t) => {
                const status = getStatus(t)
                return (
                  <tr key={t.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                          {t.matrix_users?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{t.matrix_users?.name}</div>
                          <div className="text-xs text-muted-foreground">{t.matrix_users?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <code className="font-mono text-xs bg-primary/5 text-primary px-2 py-1 rounded">
                        {t.token}
                      </code>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {new Date(t.expires_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        {!t.revoked && (
                          <>
                            <button
                              onClick={() => extendToken(t.id, 30)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                            >
                              +30 dias
                            </button>
                            <button
                              onClick={() => extendToken(t.id, 7)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors"
                            >
                              +7 dias
                            </button>
                            <button
                              onClick={() => revokeToken(t.id)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              Revogar
                            </button>
                          </>
                        )}
                        {t.revoked && (
                          <button
                            onClick={() => extendToken(t.id, 30)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                          >
                            Reativar (+30d)
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {tokens.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <Key className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhum token encontrado.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
