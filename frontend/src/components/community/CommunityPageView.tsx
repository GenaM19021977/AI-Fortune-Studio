import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTelegram } from '../../hooks/useTelegram'
import { MaterialIcon } from '../ui/MaterialIcon'

import { ChallengeBanner } from './ChallengeBanner'
import { GallerySegmentTabs } from './GallerySegmentTabs'
import { LeaderboardList } from './LeaderboardList'
import { LiveActivity } from './LiveActivity'
import { PopularCreations } from './PopularCreations'
import { WeeklyPrizeCard } from './WeeklyPrizeCard'
import type { CommunityCreation } from './communityData'

/**
 * Экран сообщества (макет «Сообщество»).
 * UI-демо на локальных данных; бэкенд ленты — позже.
 */
export function CommunityPageView() {
  const { haptic } = useTelegram()
  const navigate = useNavigate()
  const [notice, setNotice] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  const flash = (message: string) => {
    haptic('light')
    setNotice(message)
  }

  const onOpenCreation = (item: CommunityCreation) => {
    flash(`Работа ${item.author} — превью. Лента сообщества подключится позже.`)
  }

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute top-1/4 -right-20 h-[300px] w-[300px] rounded-full bg-aether-cyan opacity-15 blur-[40px]" />
        <div className="absolute bottom-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-aether-cyan opacity-10 blur-[40px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-aether-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-md items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <MaterialIcon
              name="auto_awesome"
              className="text-2xl text-aether-primary"
            />
            <h1 className="text-xl font-semibold tracking-tight text-aether-primary">
              AI Fortune Studio
            </h1>
          </div>
          <button
            type="button"
            aria-label={searchOpen ? 'Закрыть поиск' : 'Поиск'}
            onClick={() => {
              haptic('light')
              setSearchOpen((v) => !v)
            }}
            className="glass-card flex h-10 w-10 items-center justify-center rounded-full transition-all hover:opacity-80 active:scale-95"
          >
            <MaterialIcon name="search" className="text-aether-on-surface" />
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col space-y-8 px-5 pt-4 pb-8">
        <GallerySegmentTabs active="community" />

        {searchOpen && (
          <label className="glass-card flex items-center gap-2 rounded-xl px-4 py-3">
            <MaterialIcon name="search" className="text-aether-on-variant" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск в сообществе…"
              className="min-w-0 flex-1 bg-transparent text-sm text-aether-on-surface outline-none placeholder:text-aether-on-variant/50"
            />
          </label>
        )}

        {notice && (
          <p
            role="status"
            className="glass-card rounded-xl px-4 py-3 text-center text-sm text-aether-on-variant"
          >
            {notice}
          </p>
        )}

        {query.trim() ? (
          <p className="text-sm text-aether-on-variant">
            Поиск «{query.trim()}» — заглушка. Реальная лента появится позже.
          </p>
        ) : (
          <>
            <ChallengeBanner
              onJoin={() => {
                flash('Челлендж скоро откроется. Пока можно создать работу в мастере.')
                navigate('/create')
              }}
            />
            <PopularCreations
              onViewAll={() => flash('Полный каталог работ — в следующей версии')}
              onOpen={onOpenCreation}
            />
            <WeeklyPrizeCard />
            <LeaderboardList />
            <LiveActivity />
          </>
        )}
      </main>
    </div>
  )
}
