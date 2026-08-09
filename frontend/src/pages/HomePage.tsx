import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import {
  fetchDailyFortune,
  fetchHistory,
  fetchModes,
  fetchPersonas,
  queryKeys,
} from '../api'
import {
  DailyFortuneCard,
  HomeTopBar,
  ModeGrid,
  PersonaCarousel,
  RecentEchoes,
} from '../components/home'
import { useTelegram } from '../hooks/useTelegram'

/**
 * Главная Mini App (шаг 1.14) — макет Techno-Mysticism из DESIGN.md / code.html.
 * Данные только с API (modes, daily-fortune, personas, history).
 */
export function HomePage() {
  const { userName } = useTelegram()

  const modesQuery = useQuery({
    queryKey: queryKeys.modes,
    queryFn: fetchModes,
  })

  const fortuneQuery = useQuery({
    queryKey: queryKeys.dailyFortune,
    queryFn: fetchDailyFortune,
  })

  const personasQuery = useQuery({
    queryKey: queryKeys.personas(),
    queryFn: () => fetchPersonas(),
  })

  const historyQuery = useQuery({
    queryKey: queryKeys.history(1),
    queryFn: () => fetchHistory(1),
  })

  return (
    <div className="relative flex flex-1 flex-col">
      <HomeTopBar />

      <main className="relative z-10 mx-auto w-full max-w-md space-y-8 px-5 pt-4 pb-8">
        {/* Greeting */}
        <section>
          <p className="font-label-caps mb-1 tracking-widest text-aether-primary">
            Техно-мистика
          </p>
          <h2 className="text-[28px] leading-9 font-bold text-aether-on-surface">
            Привет, {userName}
          </h2>
          <p className="mt-1 text-base text-aether-on-variant/80">
            Космос уже выстраивается для вашего цифрового чтения сегодня.
          </p>
        </section>

        {/* Daily fortune */}
        <section>
          <DailyFortuneCard
            fortune={fortuneQuery.data}
            isLoading={fortuneQuery.isLoading}
            isError={fortuneQuery.isError}
          />
        </section>

        {/* Modes grid */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-2xl font-semibold text-aether-on-surface">
              Искусства прорицания
            </h3>
            <Link to="/create" className="font-label-caps text-aether-primary">
              Все режимы
            </Link>
          </div>
          <ModeGrid
            modes={modesQuery.data ?? []}
            isLoading={modesQuery.isLoading}
          />
        </section>

        {/* Personas as Quick Oracles */}
        <section>
          <h3 className="mb-4 text-2xl font-semibold text-aether-on-surface">
            Быстрые оракулы
          </h3>
          <PersonaCarousel
            personas={personasQuery.data ?? []}
            isLoading={personasQuery.isLoading}
          />
        </section>

        {/* Recent history */}
        <section className="pb-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-2xl font-semibold text-aether-on-surface">
              Ваши отголоски
            </h3>
            <Link
              to="/history"
              className="font-label-caps text-aether-on-variant/50"
            >
              Недавнее
            </Link>
          </div>
          <RecentEchoes
            items={historyQuery.data?.results.slice(0, 8) ?? []}
            isLoading={historyQuery.isLoading}
          />
        </section>
      </main>
    </div>
  )
}
