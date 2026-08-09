import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { fetchModes, queryKeys } from '../api'
import { Button, Card } from '../components/ui'
import { DEV_MODE_LABEL } from '../config/dev'
import { useTelegram } from '../hooks/useTelegram'

/**
 * Временная «главная» до шага 1.14 (ModeGrid + DailyFortune).
 * Уже внутри MainLayout + BottomNav.
 */
export function HomePage() {
  const { userName, isTelegram, isMock, haptic } = useTelegram()

  const modesQuery = useQuery({
    queryKey: queryKeys.modes,
    queryFn: fetchModes,
  })

  const telegramStatus = isTelegram
    ? 'Telegram WebApp'
    : isMock
      ? DEV_MODE_LABEL
      : 'Telegram недоступен'

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-10 text-center">
      <div className="mb-3 text-5xl">🔮</div>
      <h1 className="gold-text font-fortune-display text-3xl font-bold tracking-wide">
        AI Fortune Studio
      </h1>
      <p className="mt-3 max-w-sm text-sm text-purple-200/80">
        Привет, {userName}! Персональный AI-генератор поздравлений и предсказаний
      </p>

      <Card className="mt-6 w-full max-w-sm">
        <p className="text-xs uppercase tracking-widest text-purple-300/60">Telegram</p>
        <p
          className={`mt-2 text-sm ${
            isTelegram ? 'text-emerald-400' : isMock ? 'text-amber-300' : 'text-rose-400'
          }`}
        >
          {isTelegram ? '✓' : isMock ? '◎' : '✗'} {telegramStatus}
        </p>
        <Button className="mt-4" fullWidth onClick={() => haptic('light')}>
          Проверить haptic
        </Button>
      </Card>

      <Card className="mt-4 w-full max-w-sm">
        <p className="text-xs uppercase tracking-widest text-purple-300/60">
          API · GET /modes/
        </p>
        {modesQuery.isLoading && (
          <p className="mt-2 text-sm text-purple-300/50">Загрузка режимов…</p>
        )}
        {modesQuery.isError && (
          <p className="mt-2 text-sm text-amber-400">
            ⚠ {(modesQuery.error as Error).message}
          </p>
        )}
        {modesQuery.data && (
          <ul className="mt-3 space-y-1 text-left text-sm text-purple-100">
            {modesQuery.data.map((mode) => (
              <li key={mode.slug}>
                <Link
                  to={`/create/${mode.slug}`}
                  className="flex items-center rounded-lg px-1 py-1.5 hover:bg-white/5"
                >
                  <span className="mr-2">{mode.emoji}</span>
                  {mode.name}
                  <span className="ml-auto text-xs text-purple-400/60">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
        <Link to="/daily" className="text-fortune-gold/80 hover:underline">
          Предсказание дня
        </Link>
        <Link to="/dev/ui" className="text-purple-300/70 hover:underline">
          UI Kit
        </Link>
      </div>
      <p className="mt-4 text-xs text-purple-400/40">Шаг 1.13 — Layout + роутинг</p>
    </div>
  )
}
