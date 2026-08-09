import { useQuery } from '@tanstack/react-query'

import { fetchModes, queryKeys } from '../../api'
import { useCreateWizardStore } from '../../store/createWizard'
import { useTelegram } from '../../hooks/useTelegram'
import { cn } from '../../lib/cn'
import { MaterialIcon } from '../ui/MaterialIcon'
import { Skeleton } from '../ui/Skeleton'

const MODE_ICONS: Record<string, string> = {
  greeting: 'waving_hand',
  horoscope: 'nights_stay',
  poem: 'edit_note',
  roast: 'sentiment_very_satisfied',
}

/**
 * Шаг 2 — выбор режима (если не пришёл с главной).
 */
export function StepMode() {
  const { haptic } = useTelegram()
  const contentMode = useCreateWizardStore((s) => s.contentMode)
  const setContentMode = useCreateWizardStore((s) => s.setContentMode)

  const modesQuery = useQuery({
    queryKey: queryKeys.modes,
    queryFn: fetchModes,
  })

  if (modesQuery.isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="glass-card space-y-4 rounded-[24px] p-6">
      <p className="font-label-caps text-aether-primary/80">Режим генерации</p>
      <div className="grid grid-cols-2 gap-3">
        {(modesQuery.data ?? []).map((mode) => {
          const active = contentMode === mode.slug
          return (
            <button
              key={mode.slug}
              type="button"
              onClick={() => {
                haptic('light')
                setContentMode(mode.slug)
              }}
              className={cn(
                'flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all active:scale-95',
                active
                  ? 'border-aether-primary bg-aether-primary/10'
                  : 'border-white/10 bg-aether-surface-low hover:bg-white/5',
              )}
            >
              <MaterialIcon
                name={MODE_ICONS[mode.slug] ?? 'auto_awesome'}
                className={active ? 'text-aether-primary' : 'text-aether-on-variant'}
              />
              <span className="font-semibold text-aether-on-surface">{mode.name}</span>
              <span className="line-clamp-2 text-xs text-aether-on-variant/70">
                {mode.description}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
