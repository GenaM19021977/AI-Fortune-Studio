import { MaterialIcon } from '../ui/MaterialIcon'
import { cn } from '../../lib/cn'

interface ImagePreviewProps {
  previewUrl: string | null
  transformed: boolean
  styleLabel?: string | null
}

/**
 * Квадратное превью результата (Astral Preview).
 */
export function ImagePreview({
  previewUrl,
  transformed,
  styleLabel,
}: ImagePreviewProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-label-caps tracking-widest text-aether-on-variant">
          Астральное превью
        </h2>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-ping rounded-full bg-aether-cyan" />
          <span className="text-[10px] text-aether-cyan-dim">ИИ готов</span>
        </div>
      </div>

      <div className="glass-card group relative aspect-square overflow-hidden rounded-[24px]">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt=""
            className={cn(
              'h-full w-full object-cover transition-all duration-700',
              transformed
                ? 'grayscale-0 opacity-100'
                : 'grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100',
            )}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a0b2e] via-aether-bg to-[#0a1628]">
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <MaterialIcon name="image" className="text-7xl text-aether-primary" />
            </div>
          </div>
        )}

        {!transformed && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-full border border-white/10 bg-aether-surface/60 px-4 py-2 backdrop-blur-md">
              <p className="font-label-caps text-aether-primary">
                Ожидаем преобразование
              </p>
            </div>
          </div>
        )}

        {transformed && styleLabel && (
          <div className="absolute right-3 bottom-3 left-3">
            <p className="rounded-full border border-aether-primary/30 bg-aether-bg/70 px-3 py-1 font-label-caps text-aether-primary backdrop-blur-md">
              Стиль: {styleLabel}
            </p>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 rounded-[24px] shadow-[0_0_0_0_rgba(0,240,255,0.4)] [animation:pulse-border_2s_infinite]" />
      </div>
    </section>
  )
}
