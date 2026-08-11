import { cn } from '../../lib/cn'

export interface ImageStyleOption {
  id: string
  label: string
  emoji: string
  gradient: string
}

export const IMAGE_STYLES: ImageStyleOption[] = [
  { id: 'anime', label: 'Аниме', emoji: '🎌', gradient: 'from-sky-600 to-emerald-800' },
  { id: 'cyberpunk', label: 'Киберпанк', emoji: '🌃', gradient: 'from-fuchsia-700 to-cyan-900' },
  { id: 'oil', label: 'Масло', emoji: '🖼️', gradient: 'from-amber-800 to-yellow-900' },
  { id: 'watercolor', label: 'Акварель', emoji: '💧', gradient: 'from-violet-600 to-indigo-900' },
  { id: 'pixel', label: 'Пиксель', emoji: '👾', gradient: 'from-purple-700 to-blue-900' },
  { id: 'realistic', label: 'Реализм', emoji: '💎', gradient: 'from-slate-500 to-zinc-800' },
]

export const IMAGE_STYLE_CHIPS = [
  'Disney',
  'LEGO',
  'Minecraft',
  'Неон',
] as const

interface ImageStyleGridProps {
  selectedId: string | null
  onSelect: (id: string) => void
}

/**
 * Сетка эстетик + горизонтальные чипы (макет Select Aesthetic Essence).
 */
export function ImageStyleGrid({ selectedId, onSelect }: ImageStyleGridProps) {
  return (
    <section className="space-y-4">
      <h2 className="font-label-caps tracking-widest text-aether-on-variant">
        Выберите эстетику
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {IMAGE_STYLES.map((style) => {
          const active = selectedId === style.id
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onSelect(style.id)}
              className={cn(
                'glass-card group p-2 text-left transition-all duration-300',
                active && 'premium-border',
              )}
            >
              <div
                className={cn(
                  'relative mb-2 flex h-20 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br',
                  style.gradient,
                )}
              >
                <span className="text-3xl">{style.emoji}</span>
              </div>
              <span
                className={cn(
                  'block px-1 font-label-caps text-[11px] transition-colors',
                  active ? 'text-aether-primary' : 'text-aether-on-surface group-hover:text-aether-primary',
                )}
              >
                {style.label}
              </span>
            </button>
          )
        })}
      </div>

      <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2">
        {IMAGE_STYLE_CHIPS.map((chip) => {
          const active = selectedId === chip
          return (
            <button
              key={chip}
              type="button"
              onClick={() => onSelect(chip)}
              className={cn(
                'glass-card shrink-0 px-4 py-3 transition-colors',
                active
                  ? 'border-aether-primary/40 text-aether-primary'
                  : 'border-white/5 text-aether-on-variant hover:border-aether-primary/30',
              )}
            >
              <span className="font-label-caps text-[10px] uppercase">{chip}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
