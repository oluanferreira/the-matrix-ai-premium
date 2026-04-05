import { type LucideIcon } from 'lucide-react'

type Variant = 'default' | 'highlight' | 'warning' | 'destructive'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  variant?: Variant
}

const variantStyles: Record<Variant, { card: string; label: string; value: string; icon: string }> = {
  default: {
    card: 'bg-card border border-border',
    label: 'text-muted-foreground',
    value: 'text-foreground',
    icon: 'text-muted-foreground',
  },
  highlight: {
    card: 'bg-primary text-primary-foreground',
    label: 'text-primary-foreground/70',
    value: 'text-primary-foreground',
    icon: 'text-primary-foreground/70',
  },
  warning: {
    card: 'bg-amber-500/10 border border-amber-500/20',
    label: 'text-amber-400/70',
    value: 'text-amber-400',
    icon: 'text-amber-400/70',
  },
  destructive: {
    card: 'bg-destructive/10 border border-destructive/20',
    label: 'text-destructive/70',
    value: 'text-destructive',
    icon: 'text-destructive/70',
  },
}

export function StatCard({ label, value, icon: Icon, variant = 'default' }: StatCardProps) {
  const s = variantStyles[variant]

  return (
    <div className={`${s.card} rounded-2xl shadow-xs`}>
      <div className="flex flex-col gap-1.5 p-6">
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${s.label}`}>{label}</span>
          <Icon className={`w-4 h-4 ${s.icon}`} />
        </div>
        <span className={`text-3xl font-bold ${s.value}`}>{value}</span>
      </div>
    </div>
  )
}
