import { useQuery } from '@tanstack/react-query'

import { fetchDailyFortune, queryKeys } from '../api'
import { PageHeader } from '../components/layout'
import { MaterialIcon } from '../components/ui'
import { Skeleton } from '../components/ui/Skeleton'
import { useTelegram } from '../hooks/useTelegram'

/**
 * Полный текст предсказания дня (с главной CTA «Reveal Full Reading»).
 */
export function DailyPage() {
  const { shareText, haptic } = useTelegram()
  const fortuneQuery = useQuery({
    queryKey: queryKeys.dailyFortune,
    queryFn: fetchDailyFortune,
  })

  const fortune = fortuneQuery.data

  return (
    <>
      <PageHeader title="Daily Insight" showBack />
      <div className="flex flex-1 flex-col px-5 py-6">
        {fortuneQuery.isLoading && (
          <div className="glass-card gold-glow space-y-4 rounded-[24px] p-6">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {fortuneQuery.isError && (
          <div className="glass-card rounded-[24px] p-6 text-sm text-aether-on-variant">
            Не удалось загрузить предсказание. Запустите Django на :8000.
          </div>
        )}

        {fortune && (
          <article className="glass-card gold-glow rounded-[24px] p-6">
            <span className="rounded-full border border-aether-primary/20 bg-aether-primary/10 px-3 py-1 font-label-caps text-aether-primary">
              {fortune.date}
            </span>
            <h2 className="premium-text-gradient mt-4 text-2xl font-semibold">
              {fortune.title}
            </h2>
            <p className="mt-4 whitespace-pre-wrap leading-relaxed text-aether-on-variant">
              {fortune.body}
            </p>
            {fortune.persona && (
              <p className="mt-4 font-label-caps text-[10px] text-aether-on-variant/50">
                — {fortune.persona}
              </p>
            )}
            <button
              type="button"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-aether-primary-container px-6 py-3 font-label-caps text-aether-on-primary active:scale-95"
              onClick={() => {
                haptic('success')
                shareText(fortune.share_text || `${fortune.title}\n\n${fortune.body}`)
              }}
            >
              Share
              <MaterialIcon name="ios_share" className="text-sm" />
            </button>
          </article>
        )}
      </div>
    </>
  )
}
