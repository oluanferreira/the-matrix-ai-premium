type Variant = 'success' | 'warning' | 'destructive' | 'info' | 'secondary'

interface BadgeProps {
  label: string
  variant?: Variant
}

const variantStyles: Record<Variant, string> = {
  success: 'bg-primary/15 text-primary',
  warning: 'bg-amber-500/10 text-amber-400',
  destructive: 'bg-destructive/10 text-destructive',
  info: 'bg-sky-500/10 text-sky-400',
  secondary: 'bg-secondary text-secondary-foreground',
}

export function Badge({ label, variant = 'secondary' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${variantStyles[variant]}`}
    >
      {label}
    </span>
  )
}
