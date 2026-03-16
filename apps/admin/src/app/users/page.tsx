'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  notes: string | null
  plan: string
  created_at: string
  tokens?: { id: string; token: string; expires_at: string; revoked: boolean }[]
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', notes: '', days: '30' })
  const [message, setMessage] = useState('')

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    setLoading(true)
    const res = await fetch('/api/data/users')
    const data = await res.json()
    setUsers(data)
    setLoading(false)
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
      setMessage(`✅ Usuário criado! Token: ${data.token} (expira em ${form.days} dias)`)
      setForm({ name: '', email: '', notes: '', days: '30' })
      setShowForm(false)
      loadUsers()
    } else {
      setMessage(`❌ Erro: ${data.error}`)
    }
  }

  async function deleteUser(id: string, name: string) {
    if (!confirm(`Excluir usuário ${name}? Todos os tokens serão revogados.`)) return

    const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setMessage(`✅ Usuário ${name} excluído.`)
      loadUsers()
    }
  }

  const inputStyle = {
    background: '#111',
    border: '1px solid #1a3a1a',
    color: '#00ff41',
    padding: '8px 12px',
    borderRadius: '4px',
    fontFamily: "'Courier New', monospace",
    width: '100%',
  }

  const btnStyle = {
    background: '#00ff41',
    color: '#000',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Courier New', monospace",
    fontWeight: 'bold' as const,
  }

  const btnDangerStyle = {
    ...btnStyle,
    background: '#ff4444',
    color: '#fff',
    padding: '4px 12px',
    fontSize: '12px',
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px' }}>Users</h1>
        <button style={btnStyle} onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancelar' : '+ Novo Usuário Premium'}
        </button>
      </div>

      {message && (
        <div style={{
          background: message.startsWith('✅') ? '#0a2a0a' : '#2a0a0a',
          border: `1px solid ${message.startsWith('✅') ? '#1a4a1a' : '#4a1a1a'}`,
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}>
          {message}
        </div>
      )}

      {showForm && (
        <form onSubmit={createUser} style={{
          background: '#111',
          border: '1px solid #1a3a1a',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px',
          display: 'grid',
          gap: '16px',
        }}>
          <div>
            <label style={{ color: '#888', fontSize: '12px' }}>Nome *</label>
            <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label style={{ color: '#888', fontSize: '12px' }}>Email *</label>
            <input style={inputStyle} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label style={{ color: '#888', fontSize: '12px' }}>Notas</label>
            <input style={inputStyle} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Ex: testador beta, amigo, cliente..." />
          </div>
          <div>
            <label style={{ color: '#888', fontSize: '12px' }}>Dias de validade do token</label>
            <input style={inputStyle} type="number" value={form.days} onChange={e => setForm({ ...form, days: e.target.value })} min="1" max="365" />
          </div>
          <button type="submit" style={btnStyle}>Criar Usuário + Gerar Token</button>
        </form>
      )}

      {loading ? (
        <p style={{ color: '#666' }}>Carregando...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1a3a1a', textAlign: 'left' }}>
              <th style={{ padding: '12px', color: '#888' }}>Nome</th>
              <th style={{ padding: '12px', color: '#888' }}>Email</th>
              <th style={{ padding: '12px', color: '#888' }}>Plano</th>
              <th style={{ padding: '12px', color: '#888' }}>Criado em</th>
              <th style={{ padding: '12px', color: '#888' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #111' }}>
                <td style={{ padding: '12px' }}>{u.name}</td>
                <td style={{ padding: '12px', color: '#888' }}>{u.email}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    background: u.plan === 'premium' ? '#0a2a0a' : '#1a1a1a',
                    color: u.plan === 'premium' ? '#00ff41' : '#666',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}>
                    {u.plan === 'premium' ? '🔴 RED PILL' : '🔵 BLUE PILL'}
                  </span>
                </td>
                <td style={{ padding: '12px', color: '#666' }}>{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                <td style={{ padding: '12px' }}>
                  <button style={btnDangerStyle} onClick={() => deleteUser(u.id, u.name)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
