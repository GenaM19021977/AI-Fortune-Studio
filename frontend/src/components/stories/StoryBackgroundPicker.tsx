import { cn } from '../../lib/cn'

import { STORY_ESSENCES, type StoryEssence } from './storiesData'

interface StoryBackgroundPickerProps {
  value: string
  onChange: (essence: StoryEssence) => void
}

/**
 * Горизонтальный выбор фона («сущности») для сторис.
 */
export function StoryBackgroundPicker({
  value,
  onChange,
}: StoryBackgroundPickerProps) {
  return (
    <section className="relative z-20 mb-6 w-full max-w-md px-6">
      <h3 className="font-label-caps mb-4 text-center tracking-widest text-aether-primary uppercase">
        Выберите сущность фона
      </h3>
      <div className="hide-scrollbar flex gap-4 overflow-x-auto pb-2">
        {STORY_ESSENCES.map((essence) => {
          const selected = essence.id === value
          return (
            <button
              key={essence.id}
              type="button"
              aria-label={essence.label}
              aria-pressed={selected}
              onClick={() => onChange(essence)}
              className={cn(
                'relative aspect-[9/16] w-20 shrink-0 overflow-hidden rounded-lg transition-all duration-300',
                selected
                  ? 'gold-border-glow'
                  : 'border border-white/10 hover:border-aether-primary/50',
              )}
            >
              <div
                className={cn(
                  'h-full w-full transition-opacity',
                  selected ? 'opacity-80' : 'opacity-60 hover:opacity-100',
                )}
                style={{ background: essence.gradient }}
                aria-hidden
              />
              {selected && (
                <div className="pointer-events-none absolute inset-0 bg-aether-primary/10" />
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
