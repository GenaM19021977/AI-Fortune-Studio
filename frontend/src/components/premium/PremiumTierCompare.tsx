import { MaterialIcon } from '../ui/MaterialIcon'

import { PREMIUM_TIERS } from './premiumData'

/**
 * Сравнение Free vs Premium.
 */
export function PremiumTierCompare() {
  return (
    <div className="mb-8 grid grid-cols-2 gap-4">
      <div className="glass-card flex flex-col items-center rounded-[24px] border-white/5 p-5 text-center opacity-70">
        <MaterialIcon name="person" className="mb-3 text-aether-on-variant" />
        <h3 className="font-label-caps mb-2 uppercase">{PREMIUM_TIERS.free.label}</h3>
        <div className="mb-1 text-2xl font-semibold">{PREMIUM_TIERS.free.price}</div>
        <div className="text-xs text-aether-on-variant">{PREMIUM_TIERS.free.caption}</div>
      </div>

      <div className="glass-card premium-border relative flex flex-col items-center overflow-hidden rounded-[24px] bg-aether-primary-container/5 p-5 text-center">
        <div className="premium-gold-gradient absolute top-0 right-0 rounded-bl-xl px-3 py-1">
          <span className="text-[10px] font-bold text-aether-on-primary">
            {PREMIUM_TIERS.premium.badge}
          </span>
        </div>
        <MaterialIcon
          name="stars"
          filled
          className="mb-3 text-aether-primary"
        />
        <h3 className="font-label-caps mb-2 uppercase text-aether-primary">
          {PREMIUM_TIERS.premium.label}
        </h3>
        <div className="mb-1 text-2xl font-semibold text-aether-primary">
          {PREMIUM_TIERS.premium.price}
        </div>
        <div className="text-xs text-aether-primary/80">
          {PREMIUM_TIERS.premium.caption}
        </div>
      </div>
    </div>
  )
}
