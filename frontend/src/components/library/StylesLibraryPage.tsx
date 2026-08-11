import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'

import { fetchMe, fetchPersonas, queryKeys } from '../../api'
import { categoryLabel } from '../../lib/personaCategories'
import { useTelegram } from '../../hooks/useTelegram'
import { GallerySegmentTabs } from '../community'
import { MaterialIcon } from '../ui/MaterialIcon'
import { Skeleton } from '../ui/Skeleton'

import { FavoriteStyleCard } from './FavoriteStyleCard'
import { PremiumStylesBanner, StyleCategoryCard } from './StyleCategoryCard'

const CATEGORY_EMOJI: Record<string, string> = {
  mystic: '🔮',
  humor: '😄',
  history: '📜',
  sages: '🧙',
}

/**
 * Библиотека стилей (макет «Библиотека стилей») — вкладка Галерея.
 * Данные: GET /personas/ + любимый персонаж из /me/.
 */
export function StylesLibraryPage() {
  const { haptic } = useTelegram()
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryFilter = searchParams.get('category')
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  const personasQuery = useQuery({
    queryKey: queryKeys.personas(),
    queryFn: () => fetchPersonas(),
  })
  const meQuery = useQuery({
    queryKey: queryKeys.me,
    queryFn: fetchMe,
  })

  const personas = personasQuery.data ?? []
  const favoriteSlug = meQuery.data?.settings.favorite_persona_slug

  const favorites = useMemo(() => {
    if (!personas.length) return []
    const fav = personas.find((p) => p.slug === favoriteSlug)
    const rest = personas.filter((p) => p.slug !== favoriteSlug && !p.is_premium)
    return fav ? [fav, ...rest.slice(0, 5)] : rest.slice(0, 6)
  }, [personas, favoriteSlug])

  const categories = useMemo(() => {
    const map = new Map<string, { count: number; emoji: string }>()
    for (const p of personas) {
      const prev = map.get(p.category)
      map.set(p.category, {
        count: (prev?.count ?? 0) + 1,
        emoji: CATEGORY_EMOJI[p.category] || p.emoji || '✨',
      })
    }
    return [...map.entries()].map(([slug, meta]) => ({ slug, ...meta }))
  }, [personas])

  const filteredPersonas = useMemo(() => {
    let list = personas
    if (categoryFilter) {
      list = list.filter((p) => p.category === categoryFilter)
    }
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.slug.includes(q),
      )
    }
    return list
  }, [personas, categoryFilter, query])

  const showSearchResults = searchOpen || Boolean(categoryFilter) || Boolean(query.trim())

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="absolute top-[20%] left-[-10%] h-64 w-64 rounded-full bg-aether-tertiary/10 blur-[80px]" />
        <div className="absolute right-[-10%] bottom-[30%] h-80 w-80 rounded-full bg-aether-cyan/10 blur-[100px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-aether-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-md items-center px-5">
          <MaterialIcon
            name="auto_awesome"
            filled
            className="mr-3 text-aether-primary"
          />
          <h1 className="text-xl font-semibold tracking-tight text-aether-primary">
            AI Fortune Studio
          </h1>
          <button
            type="button"
            aria-label="Поиск"
            className="ml-auto flex min-h-11 min-w-11 items-center justify-center text-aether-on-variant transition-opacity hover:opacity-80"
            onClick={() => {
              haptic('light')
              setSearchOpen((v) => !v)
            }}
          >
            <MaterialIcon name="search" />
          </button>
        </div>
        {searchOpen && (
          <div className="px-5 pb-3">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Найти стиль или персонажа…"
              className="form-input-glow w-full border-b border-[#4d4635] bg-transparent py-2 text-base text-aether-on-surface"
              autoFocus
            />
          </div>
        )}
      </header>

      <main className="relative z-10 mx-auto w-full max-w-md space-y-8 px-5 pt-6 pb-8">
        <GallerySegmentTabs active="library" />

        {!showSearchResults && (
          <>
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-aether-on-surface">
                  Избранные стили
                </h2>
                <Link
                  to="/history"
                  className="font-label-caps text-aether-primary"
                >
                  История
                </Link>
              </div>
              {personasQuery.isLoading ? (
                <div className="hide-scrollbar -mx-5 flex gap-4 overflow-x-auto px-5 pb-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[3/4] w-40 shrink-0 rounded-[24px]" />
                  ))}
                </div>
              ) : (
                <div className="hide-scrollbar -mx-5 flex space-x-4 overflow-x-auto px-5 pb-4">
                  {favorites.map((persona) => (
                    <FavoriteStyleCard
                      key={persona.slug}
                      persona={persona}
                      highlighted={persona.slug === favoriteSlug}
                    />
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-aether-on-surface">
                Исследовать стили
              </h2>
              {personasQuery.isLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-48 rounded-[24px]" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {categories.map((cat) => (
                    <StyleCategoryCard
                      key={cat.slug}
                      category={cat.slug}
                      count={cat.count}
                      emoji={cat.emoji}
                    />
                  ))}
                  <PremiumStylesBanner />
                </div>
              )}
            </section>
          </>
        )}

        {showSearchResults && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-aether-on-surface">
                {categoryFilter
                  ? categoryLabel(categoryFilter)
                  : 'Результаты поиска'}
              </h2>
              {(categoryFilter || query) && (
                <button
                  type="button"
                  className="font-label-caps text-aether-primary"
                  onClick={() => {
                    setSearchParams({})
                    setQuery('')
                    setSearchOpen(false)
                  }}
                >
                  Сбросить
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {filteredPersonas.map((persona) => (
                <FavoriteStyleCard
                  key={persona.slug}
                  persona={persona}
                  highlighted={persona.slug === favoriteSlug}
                  fill
                />
              ))}
            </div>
            {filteredPersonas.length === 0 && (
              <p className="glass-card rounded-2xl p-5 text-sm text-aether-on-variant">
                Ничего не найдено. Попробуйте другой запрос.
              </p>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
