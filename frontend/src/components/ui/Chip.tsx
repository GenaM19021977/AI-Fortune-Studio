import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '../../lib/cn'

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Выбранный фильтр / повод в мастере */
  selected?: boolean
  children: ReactNode
}

/**
 * Компактный chip для фильтров (категории персонажей, поводы).
 * Touch-friendly: min-h 44px по горизонтали через padding.
 */
export function Chip({
  selected = false,
  className,
  type = 'button',
  children,
  ...rest
}: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        'inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-medium',
        'transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
        'focus-visible:outline-fortune-gold disabled:pointer-events-none disabled:opacity-40',
        selected
          ? 'bg-fortune-purple text-white shadow-[0_0_12px_rgba(124,58,237,0.45)]'
          : 'border border-purple-500/30 bg-fortune-surface text-purple-100/90 hover:border-fortune-accent/50',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
