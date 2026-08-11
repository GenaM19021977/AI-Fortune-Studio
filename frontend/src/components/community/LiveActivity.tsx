import { cn } from '../../lib/cn'

import { LIVE_ACTIVITY } from './communityData'

/**
 * Лента живой активности сообщества.
 */
export function LiveActivity() {
  return (
    <section className="pb-4">
      <h3 className="mb-4 text-2xl font-semibold text-white">Сейчас в эфире</h3>
      <div className="space-y-3">
        {LIVE_ACTIVITY.map((event) => (
          <div
            key={event.id}
            className={cn(
              'glass-card flex items-center gap-3 rounded-lg p-3',
              event.pulse && 'animate-pulse',
              !event.pulse && 'opacity-80',
            )}
          >
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                event.tone === 'live'
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : 'bg-aether-primary shadow-[0_0_8px_#f2ca50]',
              )}
              aria-hidden
            />
            <p
              className={cn(
                'text-xs text-aether-on-variant',
                event.tone === 'live' && 'italic',
              )}
            >
              {event.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
