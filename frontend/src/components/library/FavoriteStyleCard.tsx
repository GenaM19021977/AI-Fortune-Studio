import { Link } from 'react-router-dom'

import type { Persona } from '../../types/api'
import { categoryLabel } from '../../lib/personaCategories'
import { cn } from '../../lib/cn'
import { MaterialIcon } from '../ui/MaterialIcon'

/** Фиксированные градиенты — Tailwind не видит динамические class из API */
const CATEGORY_GRADIENT: Record<string, string> = {
  mystic: 'from-violet-800 to-indigo-950',
  humor: 'from-amber-600 to-rose-800',
  history: 'from-slate-700 to-purple-950',
  sages: 'from-yellow-700 to-orange-950',
}

interface FavoriteStyleCardProps {
  persona: Persona
  highlighted?: boolean
  /** Растянуть на ширину ячейки сетки */
  fill?: boolean
}

/**
 * Карточка избранного стиля (горизонтальная карусель макета).
 */
export function FavoriteStyleCard({
  persona,
  highlighted,
  fill = false,
}: FavoriteStyleCardProps) {
  return (
    <Link
      to={persona.is_premium ? '/premium' : `/create?persona=${persona.slug}`}
      className={cn(fill ? 'w-full' : 'w-40 shrink-0')}
    >
      <div
        className={cn(
          'glass-card group relative aspect-[3/4] overflow-hidden rounded-[24px]',
          highlighted && 'premium-border',
        )}
      >
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-90',
            CATEGORY_GRADIENT[persona.category] ?? 'from-violet-800 to-indigo-950',
          )}
        />
        <div className="absolute inset-0 flex items-center justify-center text-5xl">
          {persona.emoji || '✨'}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-aether-bg/90 via-transparent to-transparent" />
        <div className="absolute right-2 bottom-3 left-3">
          <p className="font-label-caps mb-1 text-aether-primary">
            {categoryLabel(persona.category)}
          </p>
          <p className="truncate text-xs text-aether-on-variant">{persona.name}</p>
        </div>
        {highlighted && (
          <div className="absolute top-2 right-2">
            <MaterialIcon
              name="star"
              filled
              className="text-sm text-aether-primary"
            />
          </div>
        )}
        {persona.is_premium && (
          <div className="absolute top-2 left-2">
            <MaterialIcon name="lock" className="text-sm text-aether-primary" />
          </div>
        )}
      </div>
    </Link>
  )
}
