import type { HTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Круглый плейсхолдер (аватар) */
  circle?: boolean
}

/**
 * Плейсхолдер загрузки (результат медиа, списки).
 * Анимация — CSS pulse, без JS.
 */
export function Skeleton({ circle = false, className, ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'animate-pulse bg-fortune-surface/80',
        circle ? 'rounded-full' : 'rounded-xl',
        className,
      )}
      {...rest}
    />
  )
}
