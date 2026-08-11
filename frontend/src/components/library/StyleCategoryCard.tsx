import { Link } from 'react-router-dom'

import { categoryLabel, categorySubtitle } from '../../lib/personaCategories'
import { MaterialIcon } from '../ui/MaterialIcon'

interface StyleCategoryCardProps {
  category: string
  /** Число персонажей в категории */
  count: number
  emoji?: string
}

/**
 * Ячейка сетки «Исследовать стили».
 */
export function StyleCategoryCard({ category, count, emoji }: StyleCategoryCardProps) {
  return (
    <Link
      to={`/library?category=${category}`}
      className="glass-card flex flex-col items-center rounded-[24px] p-3 text-center transition-transform active:scale-95"
    >
      <div className="mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-[18px] bg-gradient-to-br from-aether-surface-high to-aether-bg">
        <span className="text-5xl" aria-hidden>
          {emoji || '✨'}
        </span>
      </div>
      <span className="font-label-caps text-aether-primary">
        {categoryLabel(category)}
      </span>
      <p className="mt-1 text-xs text-aether-on-variant">
        {categorySubtitle(category)}
      </p>
      <p className="mt-1 font-label-caps text-[10px] text-aether-on-variant/50">
        {count} стил.
      </p>
    </Link>
  )
}

/** Баннер премиум-стилей (Forbidden Arts в макете). */
export function PremiumStylesBanner() {
  return (
    <Link
      to="/premium"
      className="glass-card relative col-span-2 overflow-hidden rounded-[24px] border border-aether-primary/20 p-4"
    >
      <div className="flex items-center space-x-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-900 to-aether-bg text-3xl">
          🔮
        </div>
        <div className="min-w-0 flex-1 pr-6">
          <span className="font-label-caps mb-1 block text-aether-primary">
            Запретные искусства
          </span>
          <p className="text-xl leading-tight font-semibold text-aether-on-surface">
            Тёмный техно-гримуар
          </p>
          <p className="mt-1 text-xs text-aether-on-variant">
            Откройте премиум-стили для продвинутых прорицаний.
          </p>
        </div>
      </div>
      <div className="absolute top-1/2 right-4 -translate-y-1/2">
        <MaterialIcon name="chevron_right" className="text-aether-primary" />
      </div>
    </Link>
  )
}
