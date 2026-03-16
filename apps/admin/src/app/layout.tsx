import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Sidebar } from './components/sidebar'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'The Matrix AI — Admin',
  description: 'Painel administrativo do The Matrix AI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-14 border-b border-border flex items-center px-6 bg-card/50 backdrop-blur-sm shrink-0 sticky top-0 z-10">
              <nav className="flex items-center gap-1.5 text-sm">
                <span className="text-muted-foreground">Painel Administrativo</span>
              </nav>
            </header>
            <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
