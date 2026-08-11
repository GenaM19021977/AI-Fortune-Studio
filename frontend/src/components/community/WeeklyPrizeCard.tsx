import { MaterialIcon } from '../ui/MaterialIcon'

import { WEEKLY_PRIZE } from './communityData'

/**
 * Карточка недельного приза.
 */
export function WeeklyPrizeCard() {
  return (
    <section>
      <div className="glass-card flex items-center gap-4 rounded-xl border-l-4 border-aether-primary p-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-aether-surface-high">
          <MaterialIcon
            name="military_tech"
            className="text-4xl text-aether-primary"
          />
        </div>
        <div>
          <h4 className="text-2xl font-semibold text-white">{WEEKLY_PRIZE.title}</h4>
          <p className="text-xs text-aether-on-variant">
            {WEEKLY_PRIZE.bodyPrefix}{' '}
            <span className="font-bold text-aether-primary">{WEEKLY_PRIZE.badge}</span>
            {WEEKLY_PRIZE.bodySuffix}
          </p>
        </div>
      </div>
    </section>
  )
}
