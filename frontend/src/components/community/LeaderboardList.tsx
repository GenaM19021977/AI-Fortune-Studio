import { MaterialIcon } from '../ui/MaterialIcon'
import { cn } from '../../lib/cn'

import { COMMUNITY_LEADERS } from './communityData'

/**
 * Таблица лидеров «Топ провидцев».
 */
export function LeaderboardList() {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <MaterialIcon name="leaderboard" className="text-aether-primary" />
        <h3 className="text-2xl font-semibold text-white">Топ провидцев</h3>
      </div>
      <div className="glass-card divide-y divide-white/5 rounded-xl">
        {COMMUNITY_LEADERS.map((leader) => (
          <div
            key={leader.id}
            className="group flex items-center justify-between p-4 transition-colors hover:bg-white/5"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div
                  className={cn(
                    'h-12 w-12 overflow-hidden rounded-full border-2',
                    leader.rank === 1 ? 'border-aether-primary' : 'border-white/20',
                  )}
                  style={{ background: leader.gradient }}
                  aria-hidden
                />
                <div
                  className={cn(
                    'absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                    leader.rank === 1
                      ? 'bg-aether-primary text-aether-on-primary'
                      : 'bg-aether-on-variant text-aether-surface',
                  )}
                >
                  {leader.rank}
                </div>
              </div>
              <div>
                <p className="font-semibold text-white">{leader.name}</p>
                <p className="text-xs text-aether-on-variant">{leader.threadsLabel}</p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  'font-label-caps',
                  leader.rank === 1
                    ? 'text-aether-primary'
                    : 'text-aether-on-variant',
                )}
              >
                {leader.pointsLabel}
              </p>
              <p
                className={cn(
                  'text-[10px]',
                  leader.trend === 'up' && 'text-emerald-400',
                  leader.trend === 'down' && 'text-red-400',
                  leader.trend === 'flat' && 'text-aether-on-variant',
                )}
              >
                {leader.trendLabel}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
