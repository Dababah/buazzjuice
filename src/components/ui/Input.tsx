// src/components/ui/Input.tsx
import { InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  fullWidth?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = true, className, ...props }, ref) => {
    return (
      <div className={clsx(fullWidth && 'w-full')}>
        {label && (
          <label className="font-label font-bold text-xs uppercase block mb-1 text-on-surface-variant">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            'border-2 border-pure-black px-3 py-2 font-body text-sm bg-white focus:outline-none focus:border-primary transition-colors',
            fullWidth && 'w-full',
            error && 'border-error focus:border-error',
            className
          )}
          {...props}
        />
        {error && (
          <p className="font-label font-bold text-xs text-error mt-1">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
