// src/components/ui/Card.tsx
import { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  shadow?: 'sm' | 'md' | 'lg' | 'none'
  padding?: boolean
}

const shadowClasses = {
  sm: 'neubrutal-shadow-sm',
  md: 'neubrutal-shadow',
  lg: 'neubrutal-shadow-lg',
  none: '',
}

export default function Card({ shadow = 'md', padding = true, className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white border-2 border-pure-black',
        shadowClasses[shadow],
        padding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
