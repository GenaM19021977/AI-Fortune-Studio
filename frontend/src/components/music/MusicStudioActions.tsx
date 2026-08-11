import { MaterialIcon } from '../ui/MaterialIcon'

const ACTIONS = [
  { id: 'karaoke', icon: 'mic_external_on', label: 'Караоке' },
  { id: 'instru', icon: 'graphic_eq', label: 'Минус' },
  { id: 'remix', icon: 'rebase_edit', label: 'Ремикс' },
] as const

interface MusicStudioActionsProps {
  onAction: (id: (typeof ACTIONS)[number]['id']) => void
}

/**
 * Сетка действий студии: караоке / минус / ремикс.
 */
export function MusicStudioActions({ onAction }: MusicStudioActionsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {ACTIONS.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={() => onAction(action.id)}
          className="glass-panel flex flex-col items-center gap-2 rounded-2xl py-4 transition-colors hover:bg-white/10"
        >
          <MaterialIcon name={action.icon} className="text-aether-cyan-dim" />
          <span className="font-label-caps">{action.label}</span>
        </button>
      ))}
    </div>
  )
}
