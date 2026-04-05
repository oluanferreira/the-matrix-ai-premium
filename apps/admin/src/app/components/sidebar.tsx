'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Key,
  Activity,
  FolderGit2,
  BookOpen,
  BarChart3,
  Bell,
  GraduationCap,
} from 'lucide-react'

const navSections = [
  {
    title: 'Admin',
    items: [
      { href: '/', label: 'Visao Geral', icon: LayoutDashboard },
      { href: '/users', label: 'Usuarios', icon: Users },
      { href: '/tokens', label: 'Tokens', icon: Key },
    ],
  },
  {
    title: 'Monitoramento',
    items: [
      { href: '/activity', label: 'Atividade', icon: Activity },
      { href: '/projects', label: 'Projetos', icon: FolderGit2 },
      { href: '/stories', label: 'Stories', icon: BookOpen },
    ],
  },
  {
    title: 'Telemetria',
    items: [
      { href: '/telemetry', label: 'Metricas', icon: BarChart3 },
      { href: '/alerts', label: 'Alertas', icon: Bell },
      { href: '/onboarding', label: 'Onboarding', icon: GraduationCap },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          <span className="text-primary font-bold text-lg tracking-tight">THE MATRIX 2.0</span>
          <span className="text-[10px] font-mono uppercase tracking-widest bg-primary/10 text-primary px-1.5 py-0.5 rounded">
            Admin
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-4 mt-6 mb-2 first:mt-0">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-sidebar-accent text-foreground'
                        : 'text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/50'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
                    )}
                    <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-sidebar-border">
        <p className="text-[10px] text-muted-foreground/50 text-center mb-3">
          <span className="hover:text-muted-foreground transition-colors cursor-pointer">Termos de Uso</span>
          {' · '}
          <span className="hover:text-muted-foreground transition-colors cursor-pointer">Politica de Privacidade</span>
        </p>
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold shrink-0">
            LF
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-foreground truncate">Luan Ferreira</div>
            <div className="text-xs text-muted-foreground">Administrador</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
