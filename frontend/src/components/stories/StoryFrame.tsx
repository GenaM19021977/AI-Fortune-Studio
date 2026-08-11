import { MaterialIcon } from '../ui/MaterialIcon'
import { cn } from '../../lib/cn'

interface StoryFrameProps {
  title: string
  quote: string
  background: string
  /** Ключ для перезапуска анимации фона */
  revealKey: string | number
}

/**
 * Кадр сторис 9:16: фон, карта, текст, брендинг.
 */
export function StoryFrame({
  title,
  quote,
  background,
  revealKey,
}: StoryFrameProps) {
  return (
    <div className="story-glow gold-border-glow relative flex aspect-[9/16] w-full max-w-[320px] flex-col overflow-hidden rounded-3xl bg-[#0d0d18]">
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <div
          key={revealKey}
          className="story-mystic-reveal h-full w-full opacity-80 mix-blend-screen"
          style={{ background }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-aether-surface/40 via-transparent to-aether-surface/90" />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center px-6 pt-16 pb-8">
        <div className="flex w-full flex-1 items-center justify-center [perspective:1000px]">
          <div
            className={cn(
              'glass-card relative aspect-[2/3] w-48 overflow-hidden rounded-xl',
              'border border-aether-primary-container/50 shadow-[0_0_20px_rgba(212,175,55,0.3)]',
              'transition-transform duration-700 hover:[transform:rotateY(12deg)]',
            )}
          >
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                background:
                  'radial-gradient(circle at 50% 35%, rgba(242,202,80,0.35), transparent 55%), linear-gradient(180deg, #1a0b2e, #0f0f1a)',
              }}
              aria-hidden
            >
              <MaterialIcon
                name="auto_awesome"
                filled
                className="text-5xl text-aether-primary"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 mb-8 w-full text-center">
          <p className="mb-2 text-2xl font-semibold tracking-wide text-aether-primary drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {title}
          </p>
          <p className="text-base leading-6 font-light text-aether-on-variant italic drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            «{quote}»
          </p>
        </div>

        <div className="mt-auto flex w-full items-center justify-between border-t border-white/10 pt-4">
          <div className="flex items-center gap-2">
            <MaterialIcon
              name="auto_awesome"
              className="text-xl text-aether-primary"
            />
            <span className="font-label-caps tracking-widest text-aether-on-surface">
              AI Fortune Studio
            </span>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded border border-white/30 bg-white/20 backdrop-blur-sm">
            <MaterialIcon name="qr_code_2" className="text-sm text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}
