import { MaterialIcon } from '../ui/MaterialIcon'

export interface ResultHeroCardProps {
  persona: string
  title: string
  body: string
  /** Подпись под превью (короткая цитата) */
  teaser?: string
  /** ISO-дата или готовая строка */
  createdLabel: string
  /** Пока нет image API — декоративное превью */
  imageUrl?: string | null
  fidelityLabel?: string
}

/**
 * Золотая карточка результата: превью + текст + метаданные.
 */
export function ResultHeroCard({
  persona,
  title,
  body,
  teaser,
  createdLabel,
  imageUrl,
  fidelityLabel = 'ТОЧНОСТЬ ИИ: 99.4%',
}: ResultHeroCardProps) {
  const quote = teaser ?? title

  return (
    <section className="relative">
      <div className="result-ai-pulse pointer-events-none" aria-hidden />
      <article className="glass-panel-gold relative overflow-hidden rounded-[24px] p-6">
        <div className="relative mb-6 aspect-[4/5] w-full overflow-hidden rounded-xl">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_40%,#1A0B2E_0%,#0F0F1A_70%)]"
              aria-hidden
            >
              <div className="absolute inset-0 bg-[conic-gradient(from_180deg_at_50%_50%,rgba(0,240,255,0.08),transparent_40%,rgba(212,175,55,0.12),transparent_70%)]" />
              <MaterialIcon
                name="auto_awesome"
                filled
                className="relative z-[1] text-[72px] text-aether-primary/80"
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute right-4 bottom-4 left-4">
            <span className="glass-panel mb-2 inline-block rounded-full border-white/20 px-3 py-1 font-label-caps text-white">
              {persona}
            </span>
            <p className="text-sm font-light text-white/90 italic">«{quote}»</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-aether-primary">{title}</h2>
          <p className="leading-relaxed whitespace-pre-wrap text-aether-on-variant">
            {body}
          </p>
          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <div className="flex items-center gap-2">
              <MaterialIcon
                name="auto_awesome"
                className="text-[20px] text-aether-primary"
              />
              <span className="font-label-caps text-aether-on-variant">
                {fidelityLabel}
              </span>
            </div>
            <span className="font-label-caps text-[#99907c]">{createdLabel}</span>
          </div>
        </div>
      </article>
    </section>
  )
}
