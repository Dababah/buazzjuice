// src/components/ui/Badge.tsx
import { clsx } from 'clsx'

type BadgeVariant = 'primary' | 'secondary' | 'danger' | 'warning' | 'info' | 'success'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary-container text-on-primary-container',
  secondary: 'bg-secondary-container text-on-secondary-container',
  danger: 'bg-error-container text-on-error-container',
  warning: 'bg-tertiary-container text-on-tertiary-container',
  info: 'bg-sky-accent text-on-surface',
  success: 'bg-primary text-on-primary',
}

export default function Badge({ children, variant = 'primary', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-block border border-pure-black px-2 py-0.5 font-label font-bold text-[10px] uppercase',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
