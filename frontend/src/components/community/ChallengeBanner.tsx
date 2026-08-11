import { COMMUNITY_CHALLENGE } from './communityData'
import { useTelegram } from '../../hooks/useTelegram'

interface ChallengeBannerProps {
  onJoin: () => void
}

/**
 * Баннер дневного/активного челленджа.
 */
export function ChallengeBanner({ onJoin }: ChallengeBannerProps) {
  const { haptic } = useTelegram()

  return (
    <section className="relative">
      <div className="glass-card premium-border group relative overflow-hidden rounded-xl p-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-30 transition-transform duration-700 group-hover:scale-110"
          style={{
            backgroundImage:
              'radial-gradient(circle at 70% 30%, rgba(212,175,55,0.45), transparent 55%), radial-gradient(circle at 20% 80%, rgba(0,240,255,0.2), transparent 50%)',
          }}
          aria-hidden
        />
        <div className="relative z-10">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-label-caps rounded-full border border-aether-primary/30 bg-aether-primary/20 px-2 py-1 text-aether-primary">
              {COMMUNITY_CHALLENGE.badge}
            </span>
          </div>
          <h2 className="mb-2 text-[28px] leading-9 font-semibold text-white">
            {COMMUNITY_CHALLENGE.title}
          </h2>
          <p className="mb-4 text-base leading-6 text-aether-on-variant">
            {COMMUNITY_CHALLENGE.description}
          </p>
          <button
            type="button"
            onClick={() => {
              haptic('light')
              onJoin()
            }}
            className="rounded-full bg-aether-primary px-6 py-2 font-label-caps text-aether-on-primary shadow-lg transition-all hover:brightness-110 active:scale-95"
          >
            {COMMUNITY_CHALLENGE.cta}
          </button>
        </div>
      </div>
    </section>
  )
}
