import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'

import { fetchGeneration, queryKeys } from '../api'
import { PageHeader } from '../components/layout'
import { MaterialIcon, Skeleton } from '../components/ui'
import { useTelegram } from '../hooks/useTelegram'

/**
 * Экран результата (минимальный для шага 1.16→1.17).
 * Полные вкладки медиа — на 1.17; здесь текст + share.
 */
export function ResultPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { shareText, haptic } = useTelegram()

  const generationQuery = useQuery({
    queryKey: queryKeys.generation(id),
    queryFn: () => fetchGeneration(id),
    enabled: Boolean(id) && id !== 'demo',
  })

  const generation = generationQuery.data
  const result = generation?.result

  return (
    <>
      <PageHeader title="Результат" showBack backTo="/" />
      <div className="flex flex-1 flex-col gap-4 px-5 py-6">
        {id === 'demo' && (
          <div className="glass-card rounded-[24px] p-6 text-sm text-aether-on-variant">
            Демо-результат. Создайте генерацию через мастер.
          </div>
        )}

        {generationQuery.isLoading && (
          <div className="glass-card-gold space-y-4 rounded-[24px] p-6">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}

        {generationQuery.isError && (
          <div className="glass-card rounded-[24px] p-6 text-sm text-amber-200">
            {(generationQuery.error as Error).message}
          </div>
        )}

        {result && (
          <article className="glass-card-gold rounded-[24px] p-6">
            <p className="font-label-caps text-aether-primary">{result.persona}</p>
            <h2 className="premium-text-gradient mt-2 text-2xl font-semibold">
              {result.title}
            </h2>
            <p className="mt-4 whitespace-pre-wrap leading-relaxed text-aether-on-variant">
              {result.body}
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-aether-primary-container px-6 py-3 font-label-caps text-aether-on-primary"
                onClick={() => {
                  haptic('success')
                  shareText(result.share_text || `${result.title}\n\n${result.body}`)
                }}
              >
                Поделиться
                <MaterialIcon name="ios_share" className="text-sm" />
              </button>
              <Link
                to="/create"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-6 py-3 font-label-caps text-aether-on-surface"
              >
                Ещё раз
              </Link>
            </div>
          </article>
        )}

        {generation && !result && generation.status === 'failed' && (
          <div className="glass-card rounded-[24px] p-6 text-sm text-amber-200">
            {generation.detail ?? 'Генерация не удалась'}
          </div>
        )}
      </div>
    </>
  )
}
