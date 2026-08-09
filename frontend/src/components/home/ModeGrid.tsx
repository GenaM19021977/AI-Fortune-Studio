import { Link } from 'react-router-dom'

import type { ContentMode } from '../../types/api'
import { cn } from '../../lib/cn'
import { MaterialIcon } from '../ui/MaterialIcon'
import { Skeleton } from '../ui/Skeleton'

/** Иконки Material по slug режима (остальное — auto_awesome) */
const MODE_ICONS: Record<string, string> = {
  greeting: 'waving_hand',
  horoscope: 'nights_stay',
  poem: 'edit_note',
  roast: 'sentiment_very_satisfied',
  tarot: 'style',
  meme: 'sentiment_very_satisfied',
  love: 'favorite',
  prediction: 'clear_all',
}

const MODE_ICON_COLOR: Record<string, string> = {
  greeting: 'text-aether-primary',
  horoscope: 'text-aether-tertiary',
  poem: 'text-aether-on-variant',
  roast: 'text-aether-primary',
}

interface ModeGridProps {
  modes: ContentMode[]
  isLoading?: boolean
}

/**
 * Сетка режимов 3 колонки → /create/:slug (макет «Divination Arts»).
 */
export function ModeGrid({ modes, isLoading }: ModeGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    )
  }

  if (modes.length === 0) {
    return (
      <p className="text-sm text-aether-on-variant/70">Режимы пока не загружены.</p>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {modes.map((mode) => {
        const icon = MODE_ICONS[mode.slug] ?? 'auto_awesome'
        const color = MODE_ICON_COLOR[mode.slug] ?? 'text-aether-primary'

        return (
          <Link
            key={mode.slug}
            to={`/create/${mode.slug}`}
            className={cn(
              'glass-card flex aspect-square flex-col items-center justify-center gap-2 rounded-xl p-4 text-center',
              'transition-transform active:scale-90',
            )}
          >
            <MaterialIcon name={icon} className={cn('text-2xl', color)} />
            <span className="font-label-caps text-[10px] tracking-normal text-aether-on-surface">
              {mode.name}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
