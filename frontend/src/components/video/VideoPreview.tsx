import { useState } from 'react'

import { cn } from '../../lib/cn'
import { MaterialIcon } from '../ui/MaterialIcon'

interface VideoPreviewProps {
  /** Заголовок поверх превью */
  title?: string
  playing?: boolean
  onTogglePlay?: () => void
}

/**
 * Плеер-превью 9:16 (макет «Видео студия»).
 * Пока без реального видеофайла — атмосферный placeholder.
 */
export function VideoPreview({
  title = 'Превью 4K',
  playing = false,
  onTogglePlay,
}: VideoPreviewProps) {
  const [progress] = useState(8 / 15)

  return (
    <section
      className={cn(
        'glass-card ai-pulse premium-border relative aspect-[9/16] w-full overflow-hidden rounded-[24px]',
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0b2e] via-aether-bg to-[#0a1628]">
        <div className="absolute inset-0 flex items-center justify-center opacity-40">
          <MaterialIcon name="movie" className="text-7xl text-aether-primary" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(206,158,255,0.25),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(0,238,252,0.15),transparent_45%)]" />
      </div>

      <div className="absolute inset-0 flex flex-col justify-between p-6">
        <div className="flex items-start justify-between">
          <div className="glass-card flex items-center gap-2 border-white/20 px-3 py-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-aether-primary" />
            <span className="font-label-caps uppercase text-aether-on-surface/80">
              {title}
            </span>
          </div>
          <button
            type="button"
            className="glass-card flex h-10 w-10 items-center justify-center border-white/20"
            aria-label="На весь экран"
          >
            <MaterialIcon name="fullscreen" className="text-aether-on-surface" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={onTogglePlay}
            className="flex h-16 w-16 items-center justify-center rounded-full border border-aether-primary/40 bg-aether-primary/20 backdrop-blur-md transition-transform active:scale-95"
            aria-label={playing ? 'Пауза' : 'Воспроизвести'}
          >
            <MaterialIcon
              name={playing ? 'pause' : 'play_arrow'}
              filled
              className="text-4xl text-aether-primary"
            />
          </button>
          <div className="w-full space-y-2">
            <div className="timeline-track">
              <div
                className="timeline-progress"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <div className="flex justify-between font-label-caps text-aether-on-variant/70">
              <span>0:08</span>
              <span>0:15</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
