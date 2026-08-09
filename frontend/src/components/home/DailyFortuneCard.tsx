import { Link } from 'react-router-dom'

import type { DailyFortune } from '../../types/api'
import { MaterialIcon } from '../ui/MaterialIcon'
import { Skeleton } from '../ui/Skeleton'

interface DailyFortuneCardProps {
  fortune?: DailyFortune
  isLoading?: boolean
  isError?: boolean
}

/**
 * Featured-карточка «Предсказание дня» (gold-glow, glass).
 * Полный текст — на /daily; здесь превью + CTA.
 */
export function DailyFortuneCard({
  fortune,
  isLoading,
  isError,
}: DailyFortuneCardProps) {
  if (isLoading) {
    return (
      <div className="glass-card gold-glow space-y-4 rounded-[24px] p-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-11 w-48 rounded-full" />
      </div>
    )
  }

  if (isError || !fortune) {
    return (
      <div className="glass-card gold-glow rounded-[24px] p-6">
        <p className="text-sm text-aether-on-variant">
          Не удалось загрузить предсказание дня. Проверьте API.
        </p>
        <Link
          to="/daily"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-aether-primary-container px-6 py-3 font-label-caps text-aether-on-primary"
        >
          Попробовать снова
          <MaterialIcon name="arrow_forward" className="text-sm" />
        </Link>
      </div>
    )
  }

  const preview =
    fortune.body.length > 140 ? `${fortune.body.slice(0, 140).trim()}…` : fortune.body

  return (
    <div className="glass-card gold-glow group relative overflow-hidden rounded-[24px] p-6">
      <div className="absolute top-0 right-0 p-4">
        <MaterialIcon
          name="stars"
          className="text-4xl text-aether-primary/40 transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="relative z-10">
        <span className="rounded-full border border-aether-primary/20 bg-aether-primary/10 px-3 py-1 font-label-caps text-aether-primary">
          Предсказание дня
        </span>
        <h3 className="premium-text-gradient mt-4 text-2xl font-semibold leading-8">
          {fortune.title || 'Небесное выравнивание'}
        </h3>
        <p className="mt-2 leading-relaxed text-aether-on-variant">{preview}</p>
        <div className="mt-6">
          <Link
            to="/daily"
            className="inline-flex items-center gap-2 rounded-full bg-aether-primary-container px-6 py-3 font-label-caps text-aether-on-primary shadow-lg transition-transform active:scale-95"
          >
            Открыть полностью
            <MaterialIcon name="arrow_forward" className="text-sm" />
          </Link>
        </div>
        {fortune.persona && (
          <p className="mt-3 font-label-caps text-[10px] text-aether-on-variant/50">
            — {fortune.persona}
          </p>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-tr from-transparent via-aether-primary/5 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
    </div>
  )
}
