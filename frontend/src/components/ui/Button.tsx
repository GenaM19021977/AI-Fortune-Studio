import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '../../lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  children: ReactNode
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-fortune-purple text-white hover:bg-fortune-accent active:bg-fortune-purple/90',
  secondary:
    'bg-fortune-gold text-fortune-bg hover:bg-[#ffe08a] active:bg-fortune-gold/90',
  ghost: 'bg-transparent text-purple-100 hover:bg-white/5 active:bg-white/10',
  outline:
    'border border-fortune-purple/50 bg-transparent text-purple-100 hover:border-fortune-accent hover:bg-fortune-purple/10',
}

const sizeClass: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base',
}

/**
 * Базовая кнопка дизайн-системы.
 * min-h 44px (min-h-11) — touch target для Telegram Mini App.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  disabled,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium',
        'transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
        'focus-visible:outline-fortune-gold disabled:pointer-events-none disabled:opacity-40',
        variantClass[variant],
        sizeClass[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
