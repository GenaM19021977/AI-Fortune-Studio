import { useQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { fetchGeneration, queryKeys } from '../api'
import {
  ResultActionGrid,
  ResultHeroCard,
  ResultShareBar,
  ResultTopBar,
  type ResultActionId,
  type ShareBarState,
} from '../components/result'
import { Skeleton } from '../components/ui'
import { useTelegram } from '../hooks/useTelegram'
import type { GenerationResultPayload } from '../types/api'

/** Демо, когда открыли /result/demo без API */
const DEMO_RESULT: GenerationResultPayload = {
  title: 'Ваше цифровое знамение',
  body: 'Алгоритмы сошлись на редком выравнивании. Этот образ отмечает прорыв на вашем пути: логика машины нашла гармонию с вашей личной энергией.',
  share_text:
    'Ваше цифровое знамение\n\nАлгоритмы сошлись на редком выравнивании. Этот образ отмечает прорыв на вашем пути.',
  persona: 'Небесный странник',
  source: 'demo',
}

function formatGenDate(iso?: string): string {
  const date = iso ? new Date(iso) : new Date()
  if (Number.isNaN(date.getTime())) {
    return `СОЗД: ${new Date().toLocaleDateString('ru-RU')}`
  }
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yy = String(date.getFullYear()).slice(-2)
  return `СОЗД: ${dd}.${mm}.${yy}`
}

/**
 * Экран результата генерации (макет «Результат генерации»).
 * Медиа-вкладки и скачивание HQ — фаза 2; сейчас текст + действия-заглушки.
 */
export function ResultPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { shareText, haptic } = useTelegram()

  const [shareState, setShareState] = useState<ShareBarState>('idle')
  const [favorite, setFavorite] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const isDemo = id === 'demo'

  const generationQuery = useQuery({
    queryKey: queryKeys.generation(id),
    queryFn: () => fetchGeneration(id),
    enabled: Boolean(id) && !isDemo,
  })

  const generation = generationQuery.data
  const result = isDemo ? DEMO_RESULT : generation?.result

  const sharePayload =
    result?.share_text ||
    (result ? `${result.title}\n\n${result.body}` : '')

  const onShare = useCallback(() => {
    if (!sharePayload || shareState === 'sharing') return
    haptic('success')
    setShareState('sharing')
    shareText(sharePayload)
    window.setTimeout(() => setShareState('done'), 1200)
    window.setTimeout(() => setShareState('idle'), 2800)
  }, [haptic, sharePayload, shareState, shareText])

  const onAction = useCallback(
    (actionId: ResultActionId) => {
      haptic('light')
      if (actionId === 'edit' || actionId === 'regenerate') {
        navigate('/create')
        return
      }
      if (actionId === 'copy' && result) {
        void navigator.clipboard
          ?.writeText(`${result.title}\n\n${result.body}`)
          .then(() => setNotice('Текст скопирован'))
          .catch(() => setNotice('Не удалось скопировать'))
        return
      }
      if (actionId === 'favorite') {
        setFavorite((prev) => {
          const next = !prev
          setNotice(
            next
              ? 'Добавлено в избранное (локально, API позже)'
              : 'Убрано из избранного',
          )
          return next
        })
        return
      }
      if (actionId === 'download') {
        setNotice('Скачивание в высоком качестве появится в фазе 2')
      }
    },
    [haptic, navigate, result],
  )

  return (
    <div className="relative flex min-h-full flex-col">
      <div
        className="pointer-events-none fixed top-[-10%] left-[-10%] -z-[1] h-64 w-64 rounded-full bg-[#1A0B2E] opacity-40 blur-[80px]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed right-[-10%] bottom-[-20%] -z-[1] h-96 w-96 rounded-full bg-[#00F0FF22] opacity-40 blur-[80px]"
        aria-hidden
      />

      <ResultTopBar />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col space-y-8 px-5 pt-6 pb-32">
        {notice && (
          <p
            role="status"
            className="glass-panel rounded-xl px-4 py-3 text-center text-sm text-aether-on-variant"
          >
            {notice}
          </p>
        )}

        {generationQuery.isLoading && !isDemo && (
          <div className="glass-panel-gold space-y-4 rounded-[24px] p-6">
            <Skeleton className="aspect-[4/5] w-full rounded-xl" />
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {generationQuery.isError && !isDemo && (
          <div className="glass-panel rounded-[24px] p-6 text-sm text-amber-200">
            {(generationQuery.error as Error).message}
          </div>
        )}

        {result && (
          <>
            <ResultHeroCard
              persona={result.persona}
              title={result.title}
              body={result.body}
              teaser={result.title}
              createdLabel={formatGenDate()}
              fidelityLabel={
                result.source === 'fallback'
                  ? 'ИСТОЧНИК: ШАБЛОН'
                  : result.source === 'demo'
                    ? 'РЕЖИМ: ДЕМО'
                    : 'ТОЧНОСТЬ ИИ: 99.4%'
              }
            />
            <ResultActionGrid
              onAction={onAction}
              favoriteActive={favorite}
            />
            <Link
              to={
                isDemo || !id
                  ? '/stories'
                  : `/stories?id=${encodeURIComponent(id)}`
              }
              className="glass-panel flex items-center justify-center gap-2 rounded-xl p-4 font-label-caps text-aether-primary transition-colors hover:bg-white/10"
            >
              Предпросмотр сторис
            </Link>
          </>
        )}

        {generation && !result && generation.status === 'failed' && (
          <div className="glass-panel rounded-[24px] p-6 text-sm text-amber-200">
            {generation.detail ?? 'Генерация не удалась'}
          </div>
        )}

        {generation &&
          !result &&
          (generation.status === 'pending' ||
            generation.status === 'processing') && (
            <div className="glass-panel rounded-[24px] p-6 text-sm text-aether-on-variant">
              Генерация ещё идёт… обновите через мгновение.
            </div>
          )}
      </main>

      {result && (
        <ResultShareBar state={shareState} onShare={onShare} />
      )}
    </div>
  )
}
