import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Matrix AI — Admin',
  description: 'Painel administrativo do The Matrix AI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{
        margin: 0,
        fontFamily: "'Courier New', monospace",
        backgroundColor: '#0a0a0a',
        color: '#00ff41',
        minHeight: '100vh',
      }}>
        <nav style={{
          borderBottom: '1px solid #1a3a1a',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
            THE MATRIX AI <span style={{ color: '#666', fontSize: '14px' }}>admin</span>
          </div>
          <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
            <a href="/" style={{ color: '#00ff41', textDecoration: 'none' }}>Dashboard</a>
            <a href="/users" style={{ color: '#00ff41', textDecoration: 'none' }}>Users</a>
            <a href="/tokens" style={{ color: '#00ff41', textDecoration: 'none' }}>Tokens</a>
            <a href="/logs" style={{ color: '#00ff41', textDecoration: 'none' }}>Logs</a>
          </div>
        </nav>
        <main style={{ padding: '32px' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
