import { MaterialIcon } from '../ui/MaterialIcon'
import { cn } from '../../lib/cn'

export type ResultActionId =
  | 'edit'
  | 'regenerate'
  | 'copy'
  | 'favorite'
  | 'download'

interface ActionDef {
  id: ResultActionId
  label: string
  icon: string
  filled?: boolean
  hoverIcon: string
  span2?: boolean
}

const ACTIONS: ActionDef[] = [
  {
    id: 'edit',
    label: 'Изменить',
    icon: 'edit',
    hoverIcon: 'group-hover:text-aether-primary',
  },
  {
    id: 'regenerate',
    label: 'Снова',
    icon: 'refresh',
    hoverIcon: 'group-hover:text-aether-cyan-dim',
  },
  {
    id: 'copy',
    label: 'Копировать',
    icon: 'content_copy',
    hoverIcon: 'group-hover:text-aether-primary',
  },
  {
    id: 'favorite',
    label: 'В избранное',
    icon: 'favorite',
    filled: true,
    hoverIcon: 'group-hover:text-[#ffb4ab]',
  },
  {
    id: 'download',
    label: 'Скачать в высоком качестве',
    icon: 'download',
    hoverIcon: 'text-aether-primary',
    span2: true,
  },
]

interface ResultActionGridProps {
  onAction: (id: ResultActionId) => void
  favoriteActive?: boolean
}

/**
 * Сетка действий под карточкой результата.
 */
export function ResultActionGrid({
  onAction,
  favoriteActive = false,
}: ResultActionGridProps) {
  return (
    <section className="grid grid-cols-2 gap-4">
      {ACTIONS.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={() => onAction(action.id)}
          className={cn(
            'glass-panel group flex flex-col items-center justify-center gap-2 rounded-xl p-4 transition-all duration-300 hover:bg-white/10 active:scale-95',
            action.span2 && 'col-span-2 flex-row gap-4',
          )}
        >
          {action.span2 ? (
            <>
              <MaterialIcon
                name={action.icon}
                className={cn('text-aether-primary', action.hoverIcon)}
              />
              <span className="font-label-caps text-aether-on-surface">
                {action.label}
              </span>
            </>
          ) : (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-aether-surface-high transition-colors">
                <MaterialIcon
                  name={action.icon}
                  filled={action.id === 'favorite' ? favoriteActive || action.filled : action.filled}
                  className={cn(
                    'transition-colors',
                    action.id === 'favorite' && favoriteActive
                      ? 'text-[#ffb4ab]'
                      : action.hoverIcon,
                  )}
                />
              </div>
              <span className="font-label-caps text-aether-on-surface">
                {action.label}
              </span>
            </>
          )}
        </button>
      ))}
    </section>
  )
}
