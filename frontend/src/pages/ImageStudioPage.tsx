import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  IMAGE_STYLES,
  ImagePreview,
  ImageStyleGrid,
  ImageUploadZone,
} from '../components/image'
import { StudioStatus, type StudioJob } from '../components/video'
import { MaterialIcon } from '../components/ui'
import { useTelegram } from '../hooks/useTelegram'
import { cn } from '../lib/cn'

const IDLE_JOBS: StudioJob[] = [
  { id: 'encode', label: 'Кодирование артефакта', icon: 'memory', progress: null },
  { id: 'style', label: 'Наложение стиля', icon: 'palette', progress: null },
]

/**
 * Студия картинок (макет «Картинки студия»).
 * UI + локальный превью; нейро-генерация изображений — фаза 2.
 */
export function ImageStudioPage() {
  const { haptic, shareText } = useTelegram()
  const [fileName, setFileName] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [styleId, setStyleId] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [transformed, setTransformed] = useState(false)
  const [jobs, setJobs] = useState<StudioJob[]>(IDLE_JOBS)
  const [notice, setNotice] = useState<string | null>(null)

  const styleLabel = useMemo(() => {
    if (!styleId) return null
    return IMAGE_STYLES.find((s) => s.id === styleId)?.label ?? styleId
  }, [styleId])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  useEffect(() => {
    if (!generating) return
    const timer = window.setInterval(() => {
      setJobs((prev) =>
        prev.map((job) => {
          if (job.id === 'encode') {
            return {
              ...job,
              progress: Math.min(100, (job.progress ?? 0) + Math.random() * 10),
            }
          }
          if (job.id === 'style') {
            const encode = prev.find((j) => j.id === 'encode')
            if ((encode?.progress ?? 0) < 85) return job
            const p = Math.min(100, (job.progress ?? 0) + Math.random() * 8)
            return { ...job, progress: p === 0 ? 8 : p }
          }
          return job
        }),
      )
    }, 350)
    return () => window.clearInterval(timer)
  }, [generating])

  useEffect(() => {
    if (!generating) return
    if (!jobs.every((j) => (j.progress ?? 0) >= 100)) return
    setGenerating(false)
    setTransformed(true)
    setNotice(
      'Демо-преобразование завершено. Реальная генерация картинок — в фазе 2.',
    )
  }, [jobs, generating])

  const onFile = useCallback(
    (file: File) => {
      haptic('light')
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setFileName(file.name)
      setPreviewUrl(URL.createObjectURL(file))
      setTransformed(false)
      setNotice(null)
      setJobs(IDLE_JOBS)
    },
    [haptic, previewUrl],
  )

  const onTransform = useCallback(() => {
    if (!previewUrl) {
      setNotice('Сначала загрузите исходное изображение.')
      haptic('error')
      return
    }
    if (!styleId) {
      setNotice('Выберите эстетику стиля.')
      haptic('error')
      return
    }
    haptic('success')
    setNotice(null)
    setTransformed(false)
    setJobs([
      { id: 'encode', label: 'Кодирование артефакта', icon: 'memory', progress: 5 },
      { id: 'style', label: 'Наложение стиля', icon: 'palette', progress: null },
    ])
    setGenerating(true)
  }, [haptic, previewUrl, styleId])

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="orb-blur absolute top-[-10%] left-[-10%] h-96 w-96 animate-pulse rounded-full bg-aether-tertiary/40" />
        <div className="orb-blur absolute right-[-5%] bottom-[5%] h-80 w-80 rounded-full bg-aether-cyan/30" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-aether-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-md items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <MaterialIcon
              name="auto_awesome"
              filled
              className="text-aether-primary"
            />
            <h1 className="text-xl font-semibold tracking-tight text-aether-primary">
              AI Fortune Studio
            </h1>
          </div>
          <Link
            to="/profile"
            aria-label="Настройки"
            className="glass-card flex h-10 w-10 items-center justify-center rounded-full text-aether-on-variant"
          >
            <MaterialIcon name="settings" />
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-md space-y-8 px-5 pt-6 pb-28">
        <div>
          <p className="font-label-caps text-aether-on-variant/70">Студия картинок</p>
          <h2 className="mt-1 text-[28px] leading-9 font-semibold text-aether-on-surface">
            Магия образа
          </h2>
        </div>

        <ImageUploadZone
          fileName={fileName}
          previewUrl={previewUrl}
          onFile={onFile}
        />

        <ImagePreview
          previewUrl={previewUrl}
          transformed={transformed}
          styleLabel={styleLabel}
        />

        <ImageStyleGrid
          selectedId={styleId}
          onSelect={(id) => {
            haptic('light')
            setStyleId(id)
            setTransformed(false)
          }}
        />

        {notice && (
          <p className="rounded-xl border border-aether-primary/20 bg-aether-primary/5 px-4 py-3 text-sm text-aether-on-variant">
            {notice}
          </p>
        )}

        <StudioStatus jobs={jobs} />

        <div className="flex gap-3">
          <button
            type="button"
            className="glass-card flex h-12 flex-1 items-center justify-center gap-2 font-label-caps text-aether-on-variant"
            onClick={() => {
              haptic('light')
              setNotice('Скачивание будет доступно после реальной генерации (фаза 2).')
            }}
          >
            <MaterialIcon name="download" />
            Скачать
          </button>
          <button
            type="button"
            className="glass-card flex h-12 flex-1 items-center justify-center gap-2 font-label-caps text-aether-on-variant"
            onClick={() => {
              haptic('success')
              shareText(
                `Готовлю картинку в AI Fortune Studio${styleLabel ? ` — стиль «${styleLabel}»` : ''} ✨`,
              )
            }}
          >
            <MaterialIcon name="send" />
            Telegram
          </button>
        </div>
      </main>

      {/* CTA над BottomNav, как в макете */}
      <div className="fixed bottom-24 left-1/2 z-50 w-full max-w-[calc(100%-40px)] -translate-x-1/2 md:max-w-md">
        <button
          type="button"
          id="magic-btn"
          disabled={generating}
          onClick={onTransform}
          className={cn(
            'relative flex h-16 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl',
            'bg-gradient-to-r from-[#d4af37] to-[#B8860B]',
            'shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all active:scale-95',
            'disabled:opacity-70',
          )}
        >
          {generating ? (
            <>
              <MaterialIcon name="sync" className="animate-spin text-aether-on-primary" />
              <span className="font-label-caps text-sm font-bold tracking-widest text-aether-on-primary uppercase">
                Канализируем энергию…
              </span>
            </>
          ) : (
            <>
              <MaterialIcon
                name="magic_button"
                filled
                className="text-2xl text-aether-on-primary"
              />
              <span className="font-label-caps text-sm font-bold tracking-widest text-aether-on-primary uppercase">
                Магическое преобразование
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
