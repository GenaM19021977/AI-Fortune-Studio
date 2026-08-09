import { useEffect, useState } from 'react'

import { fetchModes } from '../api'

const SPLASH_MESSAGES = [
  'Aligning the constellations...',
  'Consulting the neural network...',
  'Decrypting ancient scrolls...',
  'Calibrating cosmic energies...',
  'Generating your destiny...',
  'Finalizing the vision...',
] as const

const WELCOME_TEXT = 'Welcome to the Future'

/** Минимальное время показа — не мигает при быстром API */
const MIN_MS = 2200
/** Жёсткий потолок — не блокируем приложение навсегда */
const MAX_MS = 6000

export interface AppSplashState {
  visible: boolean
  progress: number
  statusText: string
}

/**
 * Splash при каждом cold start Mini App (кнопка «Открыть студию»).
 * Параллельно: анимация прогресса + prefetch /modes/.
 */
export function useAppSplash(): AppSplashState {
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState<string>(SPLASH_MESSAGES[0])

  useEffect(() => {
    const started = Date.now()
    let progressValue = 0
    let finished = false
    let apiReady = false
    let intervalId = 0
    let welcomeTimer = 0

    const finish = () => {
      if (finished) return
      finished = true
      window.clearInterval(intervalId)
      setProgress(100)
      setStatusText(WELCOME_TEXT)
      welcomeTimer = window.setTimeout(() => setVisible(false), 450)
    }

    const tryFinish = () => {
      const elapsed = Date.now() - started
      if (apiReady && elapsed >= MIN_MS) {
        finish()
        return
      }
      if (elapsed >= MAX_MS) {
        finish()
      }
    }

    void fetchModes()
      .then(() => {
        apiReady = true
        tryFinish()
      })
      .catch(() => {
        apiReady = true
        tryFinish()
      })

    intervalId = window.setInterval(() => {
      progressValue = Math.min(92, progressValue + Math.random() * 8)
      setProgress(progressValue)
      const msgIndex = Math.min(
        SPLASH_MESSAGES.length - 1,
        Math.floor((progressValue / 92) * SPLASH_MESSAGES.length),
      )
      setStatusText(SPLASH_MESSAGES[msgIndex] ?? SPLASH_MESSAGES[0])
      tryFinish()
    }, 150)

    const maxTimer = window.setTimeout(() => {
      apiReady = true
      tryFinish()
    }, MAX_MS)

    return () => {
      window.clearInterval(intervalId)
      window.clearTimeout(maxTimer)
      window.clearTimeout(welcomeTimer)
    }
  }, [])

  return { visible, progress, statusText }
}
