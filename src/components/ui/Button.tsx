// src/components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'orange'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  shadow?: boolean
  fullWidth?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-juice-orange',
  secondary: 'bg-white text-on-surface hover:bg-surface-variant',
  danger: 'bg-error-container text-on-error-container hover:bg-error hover:text-on-error',
  ghost: 'bg-transparent text-on-surface hover:bg-surface-variant',
  orange: 'bg-juice-orange text-white hover:bg-primary',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-5 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', shadow = true, fullWidth = false, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'border-2 border-pure-black font-label font-bold uppercase transition-all neubrutal-btn',
          variantClasses[variant],
          sizeClasses[size],
          shadow && 'neubrutal-shadow-sm',
          fullWidth && 'w-full',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
