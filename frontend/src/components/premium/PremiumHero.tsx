import { PREMIUM_HERO } from './premiumData'

/**
 * Hero-блок экрана Premium.
 */
export function PremiumHero() {
  return (
    <div className="mb-8 text-center">
      <span className="font-label-caps mb-2 block tracking-[0.2em] text-aether-primary">
        {PREMIUM_HERO.eyebrow}
      </span>
      <h2 className="mb-4 text-[28px] leading-9 font-bold text-aether-on-surface">
        {PREMIUM_HERO.titleBefore}
        <span className="premium-text-gradient">{PREMIUM_HERO.titleGold}</span>
      </h2>
      <p className="text-base leading-6 text-aether-on-variant/80">
        {PREMIUM_HERO.subtitle}
      </p>
    </div>
  )
}
