import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '../../lib/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Мягкое фиолетовое свечение вокруг карточки (GDD: card-glow) */
  glow?: boolean
  children: ReactNode
}

/**
 * Контейнер карточки: фон fortune-card, скругление, опциональный glow.
 */
export function Card({ glow = false, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-purple-500/20 bg-fortune-card p-5 text-left shadow-lg',
        glow && 'card-glow',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
