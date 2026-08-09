import { Link } from 'react-router-dom'

import type { Persona } from '../../types/api'
import { MaterialIcon } from '../ui/MaterialIcon'
import { Skeleton } from '../ui/Skeleton'

interface PersonaCarouselProps {
  personas: Persona[]
  isLoading?: boolean
}

/**
 * Горизонтальная карусель персонажей («Quick Oracles» в макете).
 * Тап → мастер с этим персонажем через query (пока /create).
 */
export function PersonaCarousel({ personas, isLoading }: PersonaCarouselProps) {
  if (isLoading) {
    return (
      <div className="hide-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-44 shrink-0 rounded-full" />
        ))}
      </div>
    )
  }

  const items = personas.slice(0, 8)

  return (
    <div className="hide-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-2">
      {items.map((persona) => (
        <Link
          key={persona.slug}
          to={`/create?persona=${persona.slug}`}
          className="glass-card flex shrink-0 items-center gap-3 rounded-full px-5 py-3 transition-transform active:scale-95"
        >
          <span className="text-lg leading-none" aria-hidden>
            {persona.emoji || '✨'}
          </span>
          <span className="whitespace-nowrap text-base text-aether-on-surface">
            {persona.name}
          </span>
          {persona.is_premium && (
            <MaterialIcon name="lock" className="text-sm text-aether-primary" />
          )}
        </Link>
      ))}
    </div>
  )
}
