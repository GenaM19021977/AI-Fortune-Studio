import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { fetchPersonas, queryKeys } from '../../api'
import { useCreateWizardStore } from '../../store/createWizard'
import { useTelegram } from '../../hooks/useTelegram'
import { cn } from '../../lib/cn'
import { MaterialIcon } from '../ui/MaterialIcon'
import { Skeleton } from '../ui/Skeleton'

const FILTERS = [
  { id: 'all', label: 'Все' },
  { id: 'mystic', label: 'Мистика' },
  { id: 'humor', label: 'Юмор' },
  { id: 'history', label: 'История' },
  { id: 'sages', label: 'Мудрецы' },
] as const

/**
 * Шаг 3 — выбор персонажа.
 */
export function StepPersona() {
  const navigate = useNavigate()
  const { haptic } = useTelegram()
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all')

  const personaSlug = useCreateWizardStore((s) => s.personaSlug)
  const setPersonaSlug = useCreateWizardStore((s) => s.setPersonaSlug)

  const personasQuery = useQuery({
    queryKey: queryKeys.personas(),
    queryFn: () => fetchPersonas(),
  })

  const filtered = useMemo(() => {
    const list = personasQuery.data ?? []
    if (filter === 'all') return list
    return list.filter((p) => p.category === filter)
  }, [personasQuery.data, filter])

  return (
    <div className="space-y-4">
      <div className="hide-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              haptic('light')
              setFilter(f.id)
            }}
            className={cn(
              'shrink-0 rounded-full border px-4 py-2 font-label-caps text-[10px]',
              filter === f.id
                ? 'border-aether-primary/40 bg-aether-primary/10 text-aether-primary'
                : 'border-[#4d4635] text-aether-on-variant',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {personasQuery.isLoading && (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((persona) => {
          const active = personaSlug === persona.slug
          const locked = persona.is_premium

          return (
            <button
              key={persona.slug}
              type="button"
              onClick={() => {
                haptic('light')
                if (locked) {
                  navigate('/premium')
                  return
                }
                setPersonaSlug(persona.slug)
              }}
              className={cn(
                'glass-card relative flex flex-col items-start gap-2 rounded-2xl p-4 text-left transition-all active:scale-95',
                active && 'gold-glow',
                locked && 'opacity-70',
              )}
            >
              {locked && (
                <MaterialIcon
                  name="lock"
                  className="absolute top-3 right-3 text-sm text-aether-primary"
                />
              )}
              <span className="text-2xl" aria-hidden>
                {persona.emoji || '✨'}
              </span>
              <span className="font-semibold text-aether-on-surface">{persona.name}</span>
              <span className="line-clamp-2 text-xs text-aether-on-variant/70">
                {persona.title}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
