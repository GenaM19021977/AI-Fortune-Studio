import { MaterialIcon } from '../ui/MaterialIcon'

/**
 * Визуальный якорь под тарифами (без CDN-картинки).
 */
export function PremiumVisualAnchor() {
  return (
    <div className="relative mb-8 h-48 w-full overflow-hidden rounded-[24px] border border-white/10">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 40%, rgba(212,175,55,0.35), transparent 55%), radial-gradient(circle at 20% 80%, rgba(0,240,255,0.2), transparent 45%), linear-gradient(160deg, #1a0b2e, #0f0f1a)',
        }}
        aria-hidden
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <MaterialIcon
          name="auto_awesome"
          filled
          className="text-6xl text-aether-primary/80"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-aether-surface via-transparent to-transparent" />
    </div>
  )
}
