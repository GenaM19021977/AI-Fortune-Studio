import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { fetchDailyFortune, fetchGeneration, queryKeys } from '../../api'
import { useTelegram } from '../../hooks/useTelegram'
import { MaterialIcon } from '../ui/MaterialIcon'
import { Skeleton } from '../ui/Skeleton'

import { StoryBackgroundPicker } from './StoryBackgroundPicker'
import { StoryFrame } from './StoryFrame'
import { DEMO_STORY, STORY_ESSENCES } from './storiesData'

/**
 * Экран предпросмотра сторис (макет «Предпросмотр сторис»).
 * Источник: ?id=generation | ?daily=1 | демо.
 * Публикация — заглушка через shareText до реального Stories API.
 */
export function StoriesPreviewPageView() {
  const [searchParams] = useSearchParams()
  const generationId = searchParams.get('id')
  const fromDaily = searchParams.get('daily') === '1'
  const { shareText, haptic } = useTelegram()

  const [essenceId, setEssenceId] = useState(STORY_ESSENCES[0].id)
  const [revealKey, setRevealKey] = useState(0)
  const [posting, setPosting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const generationQuery = useQuery({
    queryKey: queryKeys.generation(generationId ?? ''),
    queryFn: () => fetchGeneration(generationId!),
    enabled: Boolean(generationId),
  })

  const dailyQuery = useQuery({
    queryKey: queryKeys.dailyFortune,
    queryFn: fetchDailyFortune,
    enabled: fromDaily && !generationId,
  })

  const essence =
    STORY_ESSENCES.find((e) => e.id === essenceId) ?? STORY_ESSENCES[0]

  const content = useMemo(() => {
    const result = generationQuery.data?.result
    if (result) {
      const quote =
        result.body.length > 120
          ? `${result.body.slice(0, 120).trim()}…`
          : result.body
      return {
        title: result.title || result.persona || DEMO_STORY.title,
        quote: quote || DEMO_STORY.quote,
        share: result.share_text || `${result.title}\n\n${result.body}`,
      }
    }
    const fortune = dailyQuery.data
    if (fortune) {
      const quote =
        fortune.body.length > 120
          ? `${fortune.body.slice(0, 120).trim()}…`
          : fortune.body
      return {
        title: fortune.title || fortune.persona || DEMO_STORY.title,
        quote: quote || DEMO_STORY.quote,
        share: fortune.share_text || `${fortune.title}\n\n${fortune.body}`,
      }
    }
    return {
      title: DEMO_STORY.title,
      quote: DEMO_STORY.quote,
      share: `${DEMO_STORY.title}\n\n«${DEMO_STORY.quote}»\n\nAI Fortune Studio`,
    }
  }, [dailyQuery.data, generationQuery.data?.result])

  const loading =
    (Boolean(generationId) && generationQuery.isLoading) ||
    (fromDaily && !generationId && dailyQuery.isLoading)

  const closeTo = generationId
    ? `/result/${generationId}`
    : fromDaily
      ? '/daily'
      : '/'

  const onPost = () => {
    if (posting) return
    haptic('success')
    setPosting(true)
    shareText(content.share)
    window.setTimeout(() => {
      setPosting(false)
      setNotice(
        'Публикация в сторис пока заглушка — текст отправлен через шаринг Telegram.',
      )
    }, 800)
  }

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-aether-surface text-aether-on-surface">
      <div
        className="story-ambient-orb top-[-10%] left-[-10%] h-64 w-64 bg-aether-violet"
        aria-hidden
      />
      <div
        className="story-ambient-orb right-[-10%] bottom-[-10%] h-72 w-72 bg-aether-cyan"
        style={{ animationDelay: '-5s' }}
        aria-hidden
      />

      <header className="absolute top-0 z-50 flex w-full items-center justify-between p-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <Link
          to={closeTo}
          aria-label="Закрыть"
          className="glass-card group flex h-10 w-10 items-center justify-center rounded-full text-aether-on-surface transition-colors hover:bg-aether-surface-high"
        >
          <MaterialIcon
            name="close"
            className="transition-transform duration-200 group-hover:-translate-x-0.5"
          />
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 pt-16 pb-4">
        {loading ? (
          <Skeleton className="aspect-[9/16] w-full max-w-[320px] rounded-3xl" />
        ) : (
          <StoryFrame
            title={content.title}
            quote={content.quote}
            background={essence.gradient}
            revealKey={`${essenceId}-${revealKey}`}
          />
        )}
      </main>

      <StoryBackgroundPicker
        value={essenceId}
        onChange={(next) => {
          haptic('light')
          setEssenceId(next.id)
          setRevealKey((k) => k + 1)
        }}
      />

      {notice && (
        <p
          role="status"
          className="relative z-20 mx-auto mb-3 max-w-md px-6 text-center text-xs text-aether-on-variant"
        >
          {notice}
        </p>
      )}

      <footer className="relative z-20 mx-auto flex w-full max-w-md flex-col items-center px-5 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          disabled={posting || loading}
          onClick={onPost}
          className="group relative flex h-14 w-full max-w-[320px] items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-aether-primary-container to-[#e9c349] text-lg font-semibold text-[#241a00] shadow-[0_4px_24px_rgba(212,175,55,0.4)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_4px_32px_rgba(212,175,55,0.6)] disabled:opacity-70"
        >
          <div className="absolute inset-0 w-full -translate-x-full -skew-x-12 bg-white/20 transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
          <MaterialIcon
            name={posting ? 'sync' : 'send'}
            className={posting ? 'animate-spin' : ''}
          />
          {posting ? 'Отправка…' : 'Опубликовать в сторис'}
        </button>
      </footer>
    </div>
  )
}
