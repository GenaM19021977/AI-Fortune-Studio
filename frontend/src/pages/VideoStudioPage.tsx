import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  StudioStatus,
  type StudioJob,
  VideoPreview,
  VideoToolActions,
} from '../components/video'
import { MaterialIcon } from '../components/ui'
import { useTelegram } from '../hooks/useTelegram'
import { cn } from '../lib/cn'

const IDLE_JOBS: StudioJob[] = [
  { id: 'upscale', label: 'Нейро-апскейл', icon: 'memory', progress: null },
  { id: 'smooth', label: 'Временное сглаживание', icon: 'motion_blur', progress: null },
]

/**
 * Видео-студия (макет «Видео студия»).
 * UI готов; реальная генерация видео — фаза 3 (FFmpeg). Пока — демо-прогресс.
 */
export function VideoStudioPage() {
  const { haptic, shareText } = useTelegram()
  const [playing, setPlaying] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [jobs, setJobs] = useState<StudioJob[]>(IDLE_JOBS)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!generating) return
    const timer = window.setInterval(() => {
      setJobs((prev) => {
        const next = prev.map((job) => {
          if (job.id === 'upscale') {
            const p = Math.min(100, (job.progress ?? 0) + Math.random() * 8)
            return { ...job, progress: p }
          }
          if (job.id === 'smooth') {
            const upscale = prev.find((j) => j.id === 'upscale')
            if ((upscale?.progress ?? 0) < 90) return job
            const p = Math.min(100, (job.progress ?? 0) + Math.random() * 6)
            return { ...job, progress: p === 0 ? 5 : p }
          }
          return job
        })
        return next
      })
    }, 400)
    return () => window.clearInterval(timer)
  }, [generating])

  useEffect(() => {
    if (!generating) return
    const allDone = jobs.every((j) => (j.progress ?? 0) >= 100)
    if (!allDone) return
    setGenerating(false)
    setNotice('Демо-конвейер завершён. Реальный рендер видео появится в фазе 3.')
  }, [jobs, generating])

  const onGenerate = useCallback(() => {
    haptic('success')
    setNotice(null)
    setJobs([
      { id: 'upscale', label: 'Нейро-апскейл', icon: 'memory', progress: 5 },
      { id: 'smooth', label: 'Временное сглаживание', icon: 'motion_blur', progress: null },
    ])
    setGenerating(true)
  }, [haptic])

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="orb-blur absolute top-[-50px] right-[-50px] h-[300px] w-[300px] rounded-full bg-aether-tertiary/20" />
        <div className="orb-blur absolute bottom-[-100px] left-[-100px] h-[400px] w-[400px] rounded-full bg-aether-cyan/10" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-aether-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-md items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <MaterialIcon
              name="auto_awesome"
              filled
              className="text-2xl text-aether-primary"
            />
            <h1 className="text-xl font-semibold tracking-tight text-aether-primary">
              AI Fortune Studio
            </h1>
          </div>
          <Link
            to="/profile"
            aria-label="Настройки"
            className="flex min-h-11 min-w-11 items-center justify-center text-aether-on-variant transition-opacity hover:opacity-80"
          >
            <MaterialIcon name="settings" />
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-md space-y-8 px-5 pt-6 pb-8">
        <div>
          <p className="font-label-caps text-aether-on-variant/70">Видео-студия</p>
          <h2 className="mt-1 text-[28px] leading-9 font-semibold text-aether-on-surface">
            Манифест кадра
          </h2>
        </div>

        <VideoPreview
          playing={playing}
          onTogglePlay={() => {
            haptic('light')
            setPlaying((v) => !v)
          }}
        />

        <VideoToolActions />

        <div className="space-y-4">
          <button
            type="button"
            id="generate-video-btn"
            disabled={generating}
            onClick={onGenerate}
            className={cn(
              'flex h-16 w-full items-center justify-center gap-3 rounded-2xl',
              'bg-gradient-to-r from-aether-primary-container to-aether-primary',
              'text-xl font-semibold text-aether-on-primary',
              'shadow-[0_8px_32px_rgba(212,175,55,0.3)] transition-all active:scale-[0.98]',
              'disabled:opacity-60',
            )}
          >
            <MaterialIcon name="movie_filter" filled />
            {generating ? 'Собираем видео…' : 'Создать видео'}
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              className="glass-card flex h-12 flex-1 items-center justify-center gap-2 font-label-caps text-aether-on-variant transition-colors hover:bg-white/5"
              onClick={() => {
                haptic('light')
                setNotice('Скачивание станет доступно после рендера видео (фаза 3).')
              }}
            >
              <MaterialIcon name="download" />
              Скачать
            </button>
            <button
              type="button"
              className="glass-card flex h-12 flex-1 items-center justify-center gap-2 border-aether-cyan-dim/20 font-label-caps text-aether-on-variant transition-colors hover:bg-white/5"
              onClick={() => {
                haptic('success')
                shareText(
                  'Смотри, что я готовлю в AI Fortune Studio — скоро здесь будет видео ✨',
                )
              }}
            >
              <MaterialIcon name="send" />
              Telegram
            </button>
          </div>
        </div>

        {notice && (
          <p className="rounded-xl border border-aether-primary/20 bg-aether-primary/5 px-4 py-3 text-sm text-aether-on-variant">
            {notice}
          </p>
        )}

        <StudioStatus jobs={jobs} />
      </main>
    </div>
  )
}
