import { MaterialIcon } from '../ui/MaterialIcon'
import { cn } from '../../lib/cn'

const DEMO_LYRICS = [
  { text: 'В тишине цифрового вакуума…', active: false, dim: true },
  { text: 'Мы находим искры древнего света', active: true, dim: false },
  { text: 'Картографируя созвездия в коде', active: false, dim: false },
  { text: 'Сквозь схемы ночи.', active: false, dim: false },
  { text: 'Симфония бинарных снов…', active: false, dim: true },
] as const

/**
 * Панель синхронизированного текста (макет Synchronized Lyrics).
 */
export function LyricsPanel() {
  return (
    <section className="glass-panel flex h-64 flex-col gap-4 rounded-3xl p-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <span className="font-label-caps text-aether-on-variant">
          Синхронизированный текст
        </span>
        <MaterialIcon name="auto_fix_high" className="text-sm text-aether-primary" />
      </div>
      <div className="space-y-4 overflow-y-auto pr-2">
        {DEMO_LYRICS.map((line) => (
          <p
            key={line.text}
            className={cn(
              'transition-all',
              line.active &&
                'origin-left scale-105 text-lg leading-relaxed font-semibold text-aether-primary',
              !line.active && !line.dim && 'text-aether-on-variant',
              line.dim && 'text-aether-on-variant/40',
            )}
          >
            {line.text}
          </p>
        ))}
      </div>
    </section>
  )
}
