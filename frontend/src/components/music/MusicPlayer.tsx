import { MaterialIcon } from '../ui/MaterialIcon'
import { cn } from '../../lib/cn'

const WAVE_DELAYS = [0.1, 0.3, 0.5, 0.2, 0.4, 0.6, 0.8, 0.1, 0.3, 0.5, 0.7]

interface MusicPlayerProps {
  playing: boolean
  onToggle: () => void
  progress?: number
  currentLabel?: string
  durationLabel?: string
}

/**
 * Плеер с волнами и контролами (макет Audio Player).
 */
export function MusicPlayer({
  playing,
  onToggle,
  progress = 0.33,
  currentLabel = '1:12',
  durationLabel = '3:45',
}: MusicPlayerProps) {
  return (
    <section className="glass-panel-featured flex flex-col gap-6 rounded-[2rem] p-6">
      <div className="wave-container">
        {WAVE_DELAYS.map((delay, i) => (
          <div
            key={i}
            className={cn('wave-bar', !playing && 'is-paused')}
            style={{ animationDelay: `${delay}s`, height: `${12 + (i % 5) * 6}px` }}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="golden-glow h-full bg-aether-primary transition-all duration-1000"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <div className="flex justify-between font-label-caps text-aether-on-variant/60">
          <span>{currentLabel}</span>
          <span>{durationLabel}</span>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <button
          type="button"
          className="text-aether-on-variant/80 transition-colors hover:text-aether-primary"
          aria-label="Перемешать"
        >
          <MaterialIcon name="shuffle" className="text-3xl" />
        </button>
        <div className="flex items-center gap-8">
          <button
            type="button"
            className="text-aether-on-surface transition-all active:scale-90 hover:text-aether-primary"
            aria-label="Предыдущий"
          >
            <MaterialIcon name="skip_previous" className="text-4xl" />
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="golden-glow flex h-16 w-16 items-center justify-center rounded-full bg-aether-primary text-aether-on-primary transition-transform active:scale-95"
            aria-label={playing ? 'Пауза' : 'Играть'}
          >
            <MaterialIcon
              name={playing ? 'pause' : 'play_arrow'}
              filled
              className="text-4xl"
            />
          </button>
          <button
            type="button"
            className="text-aether-on-surface transition-all active:scale-90 hover:text-aether-primary"
            aria-label="Следующий"
          >
            <MaterialIcon name="skip_next" className="text-4xl" />
          </button>
        </div>
        <button
          type="button"
          className="text-aether-on-variant/80 transition-colors hover:text-aether-primary"
          aria-label="Повтор"
        >
          <MaterialIcon name="repeat" className="text-3xl" />
        </button>
      </div>
    </section>
  )
}
