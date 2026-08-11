import { MaterialIcon } from '../ui/MaterialIcon'
import { cn } from '../../lib/cn'

const BADGES = [
  { id: 'stars', icon: 'stars', active: true, pulse: true, tone: 'text-aether-primary' },
  { id: 'moon', icon: 'nights_stay', active: false, tone: 'text-aether-on-variant/40' },
  { id: 'flare', icon: 'flare', active: true, tone: 'text-aether-tertiary' },
  { id: 'book', icon: 'auto_stories', active: false, tone: 'text-aether-on-variant/40' },
  { id: 'infinity', icon: 'all_inclusive', active: false, tone: 'text-aether-on-variant/40' },
] as const

interface ProfileAchievementsProps {
  onViewAll: () => void
}

/**
 * Горизонтальный ряд достижений (пока демо-бейджи).
 */
export function ProfileAchievements({ onViewAll }: ProfileAchievementsProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <h3 className="font-label-caps text-aether-on-variant">
          Небесные достижения
        </h3>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs text-aether-primary hover:underline"
        >
          Все
        </button>
      </div>
      <div className="hide-scrollbar flex space-x-4 overflow-x-auto pb-2">
        {BADGES.map((badge) => (
          <div
            key={badge.id}
            title={badge.active ? 'Получено' : 'Ещё не открыто'}
            className="glass-card group relative flex h-16 w-16 shrink-0 cursor-help items-center justify-center rounded-2xl"
          >
            <MaterialIcon
              name={badge.icon}
              filled={badge.active}
              className={cn(
                'text-3xl transition-transform group-hover:scale-110',
                badge.tone,
              )}
            />
            {badge.pulse && (
              <div className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-aether-cyan" />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
