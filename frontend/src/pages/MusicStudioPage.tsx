import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  LyricsPanel,
  MusicCover,
  MusicPlayer,
  MusicStudioActions,
} from '../components/music'
import { MaterialIcon } from '../components/ui'
import { useTelegram } from '../hooks/useTelegram'

/**
 * Музыкальная студия (макет «Музыкальная студия»).
 * UI готов; TTS / генерация аудио — фаза 2–3. Пока демо-плеер.
 */
export function MusicStudioPage() {
  const { haptic, shareText } = useTelegram()
  const [playing, setPlaying] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="orb-blur absolute top-0 left-[-10%] h-[300px] w-[300px] animate-pulse rounded-full bg-[#1A0B2E] opacity-40" />
        <div
          className="orb-blur absolute right-[-10%] bottom-20 h-[300px] w-[300px] animate-pulse rounded-full bg-[#00F0FF] opacity-20"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-aether-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-md items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <MaterialIcon name="auto_awesome" className="text-2xl text-aether-primary" />
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

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-col gap-8 px-5 pt-6 pb-8">
        <div>
          <p className="font-label-caps text-aether-on-variant/70">Музыкальная студия</p>
          <h2 className="mt-1 text-[28px] leading-9 font-semibold text-aether-on-surface">
            Небесные отголоски
          </h2>
        </div>

        <MusicCover
          title="Небесные отголоски"
          subtitle="Создано AI Oracle"
        />

        <LyricsPanel />

        <MusicPlayer
          playing={playing}
          onToggle={() => {
            haptic('light')
            setPlaying((v) => !v)
          }}
        />

        <MusicStudioActions
          onAction={(id) => {
            haptic('light')
            const labels = {
              karaoke: 'Караоке появится вместе с TTS (фаза 2).',
              instru: 'Инструментал будет доступен после генерации аудио.',
              remix: 'Ремикс — в следующих фазах медиа-пайплайна.',
            } as const
            setNotice(labels[id])
          }}
        />

        {notice && (
          <p className="rounded-xl border border-aether-primary/20 bg-aether-primary/5 px-4 py-3 text-sm text-aether-on-variant">
            {notice}
          </p>
        )}

        <div className="mb-4 flex gap-4">
          <button
            type="button"
            className="glass-panel flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-base text-aether-on-surface transition-all hover:border-aether-primary/50"
            onClick={() => {
              haptic('light')
              setNotice('Скачивание аудио станет доступно после TTS (фаза 2).')
            }}
          >
            <MaterialIcon name="download" />
            <span>Скачать</span>
          </button>
          <button
            type="button"
            className="glass-panel flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-base text-aether-on-surface transition-all hover:border-aether-primary/50"
            onClick={() => {
              haptic('success')
              shareText(
                'Слушаю «Небесные отголоски» в AI Fortune Studio ✨\nСкоро здесь будет настоящий AI-трек.',
              )
            }}
          >
            <MaterialIcon name="share" />
            <span>Поделиться</span>
          </button>
        </div>
      </main>
    </div>
  )
}
