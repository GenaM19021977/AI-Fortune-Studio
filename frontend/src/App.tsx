import { useEffect, useState } from 'react'

interface HealthResponse {
  status: string
  service: string
}

/**
 * Стартовая страница шага 0.5 — проверка Vite + Tailwind + proxy к Django API.
 * Полный UI — с шага 1.11.
 */
function App() {
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

  return (
    <div className="fortune-gradient-bg flex min-h-full flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 text-5xl">🔮</div>
      <h1 className="gold-text font-serif text-3xl font-bold tracking-wide">
        AI Fortune Studio
      </h1>
      <p className="mt-3 max-w-sm text-sm text-purple-200/80">
        Telegram Mini App — персональный AI-генератор поздравлений и предсказаний
      </p>

      <div className="mt-8 w-full max-w-sm rounded-2xl border border-purple-500/20 bg-fortune-card p-5 shadow-lg">
        <p className="text-xs uppercase tracking-widest text-purple-300/60">Backend API</p>
        {health && (
          <p className="mt-2 text-sm text-emerald-400">
            ✓ {health.service} — {health.status}
          </p>
        )}
        {error && (
          <p className="mt-2 text-sm text-amber-400">
            ⚠ API недоступен ({error}). Запустите Django: <code className="text-xs">python manage.py runserver</code>
          </p>
        )}
        {!health && !error && (
          <p className="mt-2 text-sm text-purple-300/50">Проверка подключения…</p>
        )}
      </div>

      <p className="mt-6 text-xs text-purple-400/40">Шаг 0.5 — frontend scaffold</p>
    </div>
  )
}

export default App
