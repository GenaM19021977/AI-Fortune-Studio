import { Link } from 'react-router-dom'

import type { HistoryItem } from '../../types/api'
import { cn } from '../../lib/cn'
import { Skeleton } from '../ui/Skeleton'

interface RecentEchoesProps {
  items: HistoryItem[]
  isLoading?: boolean
}

const MODE_ACCENT: Record<string, string> = {
  greeting: 'text-aether-primary',
  horoscope: 'text-aether-cyan-dim',
  poem: 'text-aether-tertiary',
  roast: 'text-aether-primary',
}

/**
 * Горизонтальная лента недавних генераций («Your Echoes»).
 * Без медиа на фазе 1 — градиентная «обложка» + emoji персонажа.
 */
export function RecentEchoes({ items, isLoading }: RecentEchoesProps) {
  if (isLoading) {
    return (
      <div className="hide-scrollbar -mx-5 flex gap-4 overflow-x-auto px-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-48 shrink-0 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-5 text-sm text-aether-on-variant/70">
        Пока нет генераций. Создайте первое предсказание.
      </div>
    )
  }

  return (
    <div className="hide-scrollbar -mx-5 flex gap-4 overflow-x-auto px-5">
      {items.map((item) => (
        <Link
          key={item.id}
          to={`/result/${item.id}`}
          className="group w-48 shrink-0 space-y-2"
        >
          <div className="glass-card relative h-64 w-48 overflow-hidden rounded-2xl">
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-br from-aether-surface-high via-[#1a0b2e] to-aether-bg',
                'opacity-90 transition-transform duration-700 group-hover:scale-110',
              )}
            />
            <div className="absolute inset-0 flex items-center justify-center text-5xl">
              ✨
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-aether-bg to-transparent p-3">
              <span
                className={cn(
                  'font-label-caps text-[10px]',
                  MODE_ACCENT[item.content_mode] ?? 'text-aether-primary',
                )}
              >
                {item.content_mode}
              </span>
            </div>
          </div>
          <p className="line-clamp-1 px-1 text-xs text-aether-on-variant">
            {item.title || item.persona}
          </p>
        </Link>
      ))}
    </div>
  )
}
