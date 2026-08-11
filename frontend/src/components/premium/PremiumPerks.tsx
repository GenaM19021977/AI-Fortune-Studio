import { MaterialIcon } from '../ui/MaterialIcon'

import { PREMIUM_PERKS } from './premiumData'

/**
 * Список привилегий Premium.
 */
export function PremiumPerks() {
  return (
    <section className="mb-8 space-y-4">
      <h3 className="font-label-caps tracking-widest text-aether-on-variant px-1">
        Привилегии Premium
      </h3>
      {PREMIUM_PERKS.map((perk) => (
        <div key={perk.id} className="glass-card flex items-start gap-4 rounded-xl p-4">
          <div className="premium-gold-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
            <MaterialIcon name={perk.icon} className="text-aether-on-primary" />
          </div>
          <div>
            <h4 className="font-bold text-aether-on-surface">{perk.title}</h4>
            <p className="text-xs text-aether-on-variant">{perk.description}</p>
          </div>
        </div>
      ))}
    </section>
  )
}
