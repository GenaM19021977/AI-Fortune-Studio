import { useEffect, useState } from 'react'

import { DEV_MODE_LABEL } from './config/dev'
import { useTelegram } from './hooks/useTelegram'

interface HealthResponse {
  status: string
  service: string
}

/**
 * Стартовая страница (шаги 0.5–0.6).
 *
 * Проверяет:
 * 1) proxy к Django /api/v1/health/;
 * 2) работу useTelegram (реальный SDK или mock в браузере).
 *
 * Полноценный UI Mini App — с шага 1.11.
 */
function App() {
  const { userName, isTelegram, isMock, haptic } = useTelegram()
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/v1/health/')
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<HealthResponse>
      })
      .then(setHealth)
      .catch((err: Error) => setError(err.message))
  }, [])

  // Подпись режима: сразу видно, mock это или Telegram
  const telegramStatus = isTelegram
    ? 'Telegram WebApp'
    : isMock
      ? DEV_MODE_LABEL
      : 'Telegram недоступен'

  return (
    <div className="fortune-gradient-bg flex min-h-full flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 text-5xl">🔮</div>
      <h1 className="gold-text font-serif text-3xl font-bold tracking-wide">
        AI Fortune Studio
      </h1>
      <p className="mt-3 max-w-sm text-sm text-purple-200/80">
        Привет, {userName}! Персональный AI-генератор поздравлений и предсказаний
      </p>

      {/* Статус Telegram SDK / mock — шаг 0.6 */}
      <div className="mt-6 w-full max-w-sm rounded-2xl border border-purple-500/20 bg-fortune-card p-5 shadow-lg">
        <p className="text-xs uppercase tracking-widest text-purple-300/60">Telegram</p>
        <p
          className={`mt-2 text-sm ${
            isTelegram ? 'text-emerald-400' : isMock ? 'text-amber-300' : 'text-rose-400'
          }`}
        >
          {isTelegram ? '✓' : isMock ? '◎' : '✗'} {telegramStatus}
        </p>
        <button
          type="button"
          className="mt-4 min-h-11 w-full rounded-xl bg-fortune-purple/80 px-4 py-2 text-sm font-medium text-white transition hover:bg-fortune-purple"
          onClick={() => haptic('light')}
        >
          Проверить haptic (в браузере — без эффекта)
        </button>
      </div>

      {/* Статус backend API — шаг 0.5 */}
      <div className="mt-4 w-full max-w-sm rounded-2xl border border-purple-500/20 bg-fortune-card p-5 shadow-lg">
        <p className="text-xs uppercase tracking-widest text-purple-300/60">Backend API</p>
        {health && (
          <p className="mt-2 text-sm text-emerald-400">
            ✓ {health.service} — {health.status}
          </p>
        )}
        {error && (
          <p className="mt-2 text-sm text-amber-400">
            ⚠ API недоступен ({error}). Запустите Django:{' '}
            <code className="text-xs">python manage.py runserver</code>
          </p>
        )}
        {!health && !error && (
          <p className="mt-2 text-sm text-purple-300/50">Проверка подключения…</p>
        )}
      </div>

      <p className="mt-6 text-xs text-purple-400/40">Шаг 0.6 — Telegram WebApp + mock</p>
    </div>
  )
}

export default App
