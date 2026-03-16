'use client'

import { useState, useEffect } from 'react'
import { Users, Crown, UserPlus, Search, Trash2, X, UserMinus, Pencil, Clock, Plus, Ban } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  notes: string | null
  plan: string
  created_at: string
  tokens?: { id: string; token: string; expires_at: string; revoked: boolean }[]
  matrix_tokens?: { id: string; token: string; expires_at: string; revoked: boolean }[]
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', notes: '', days: '30' })
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [filter, setFilter] = useState<'all' | 'premium' | 'free'>('all')
  const [search, setSearch] = useState('')
  const [editingTokenUserId, setEditingTokenUserId] = useState<string | null>(null)

  function getActiveToken(u: User) {
    const tokens = u.matrix_tokens || u.tokens
    if (!tokens || tokens.length === 0) return null
    return tokens.find(t => !t.revoked && new Date(t.expires_at) > new Date()) || tokens[0]
  }

  function getTokenStatus(token: { expires_at: string; revoked: boolean }) {
    if (token.revoked) return { label: 'Revogado', color: 'text-destructive', bg: 'bg-destructive/10' }
    const days = Math.ceil((new Date(token.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (days <= 0) return { label: 'Expirado', color: 'text-amber-400', bg: 'bg-amber-500/10' }
    if (days <= 7) return { label: `${days}d restantes`, color: 'text-amber-400', bg: 'bg-amber-500/10' }
    return { label: `${days}d restantes`, color: 'text-primary', bg: 'bg-primary/10' }
  }

  async function extendUserToken(tokenId: string, days: number) {
    const res = await fetch('/api/tokens', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tokenId, action: 'extend', days }),
    })
    if (res.ok) {
      showMessage(`Token estendido +${days} dias`, 'success')
      setEditingTokenUserId(null)
      loadUsers()
    }
  }

  async function revokeUserToken(tokenId: string) {
    const res = await fetch('/api/tokens', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tokenId, action: 'revoke' }),
    })
    if (res.ok) {
      showMessage('Token revogado', 'success')
      setEditingTokenUserId(null)
      loadUsers()
    }
  }

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    setLoading(true)
    const res = await fetch('/api/data/users')
    const data = await res.json()
    setUsers(data)
    setLoading(false)
  }

  function showMessage(msg: string, type: 'success' | 'error') {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(''), 5000)
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        notes: form.notes || null,
        days: parseInt(form.days),
      }),
    })

    const data = await res.json()

    if (res.ok) {
      showMessage(`Usuário criado com sucesso! Token: ${data.token} (expira em ${form.days} dias)`, 'success')
      setForm({ name: '', email: '', notes: '', days: '30' })
      setShowForm(false)
      loadUsers()
    } else {
      showMessage(`Erro: ${data.error}`, 'error')
    }
  }

  async function deleteUser(id: string, name: string) {
    if (!confirm(`Excluir usuário ${name}? Todos os tokens serão revogados.`)) return

    const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      showMessage(`Usuário ${name} excluído.`, 'success')
      loadUsers()
    }
  }

  const filteredUsers = users.filter((u) => {
    if (filter === 'premium' && u.plan !== 'premium') return false
    if (filter === 'free' && u.plan !== 'free') return false
    if (search) {
      const q = search.toLowerCase()
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    }
    return true
  })

  const totalUsers = users.length
  const premiumCount = users.filter((u) => u.plan === 'premium').length
  const freeCount = users.filter((u) => u.plan === 'free').length

  const filters = [
    { key: 'all' as const, label: 'Todos' },
    { key: 'premium' as const, label: 'Premium' },
    { key: 'free' as const, label: 'Free' },
  ]

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuários</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerenciar usuários do The Matrix AI</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            showForm
              ? 'bg-accent text-foreground hover:bg-accent/80'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {showForm ? (
            <>
              <X className="w-4 h-4" /> Cancelar
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" /> Novo Usuário Premium
            </>
          )}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border ${
            messageType === 'error'
              ? 'bg-destructive/10 border-destructive/20 text-destructive'
              : 'bg-primary/10 border-primary/20 text-primary'
          }`}
        >
          {message}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total */}
        <div className="bg-card border border-border rounded-2xl shadow-xs">
          <div className="flex flex-col gap-1.5 p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total</span>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">{totalUsers}</span>
          </div>
        </div>

        {/* Premium — highlight */}
        <div className="bg-primary text-primary-foreground rounded-2xl shadow-xs">
          <div className="flex flex-col gap-1.5 p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary-foreground/70">Premium</span>
              <Crown className="w-4 h-4 text-primary-foreground/70" />
            </div>
            <span className="text-2xl font-bold">{premiumCount}</span>
          </div>
        </div>

        {/* Free */}
        <div className="bg-card border border-border rounded-2xl shadow-xs">
          <div className="flex flex-col gap-1.5 p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Free</span>
              <UserMinus className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">{freeCount}</span>
          </div>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={createUser} className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground mb-2">Novo Usuário Premium</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nome *</label>
              <input
                className="w-full bg-input/30 border border-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email *</label>
              <input
                className="w-full bg-input/30 border border-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notas</label>
              <input
                className="w-full bg-input/30 border border-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Ex: testador beta, amigo, cliente..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dias de validade</label>
              <input
                className="w-full bg-input/30 border border-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors"
                type="number"
                value={form.days}
                onChange={(e) => setForm({ ...form, days: e.target.value })}
                min="1"
                max="365"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Criar Usuário + Gerar Token
          </button>
        </form>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex bg-card border border-border rounded-xl p-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full bg-transparent border border-border rounded-xl pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors"
            placeholder="Buscar usuário..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">Carregando...</div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Usuário</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Plano</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Token / Validade</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Criado em</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-foreground">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.plan === 'premium'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {u.plan === 'premium' ? 'Premium' : 'Free'}
                    </span>
                  </td>
                  {/* Token / Validade */}
                  <td className="px-4 py-4">
                    {(() => {
                      const token = getActiveToken(u)
                      if (!token) {
                        return <span className="text-xs text-muted-foreground">—</span>
                      }
                      const status = getTokenStatus(token)
                      const isEditing = editingTokenUserId === u.id
                      return (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                              <Clock className="w-3 h-3" />
                              {status.label}
                            </span>
                            <button
                              onClick={() => setEditingTokenUserId(isEditing ? null : u.id)}
                              className="p-1 rounded-md hover:bg-accent transition-colors"
                              title="Editar validade"
                            >
                              <Pencil className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                            </button>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {new Date(token.expires_at).toLocaleDateString('pt-BR')}
                          </div>
                          {isEditing && (
                            <div className="flex items-center gap-1 mt-1">
                              <button
                                onClick={() => extendUserToken(token.id, 30)}
                                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                              >
                                <Plus className="w-3 h-3" />30d
                              </button>
                              <button
                                onClick={() => extendUserToken(token.id, 7)}
                                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors"
                              >
                                <Plus className="w-3 h-3" />7d
                              </button>
                              {!token.revoked && (
                                <button
                                  onClick={() => revokeUserToken(token.id)}
                                  className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                  <Ban className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => deleteUser(u.id, u.name)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Users className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
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
