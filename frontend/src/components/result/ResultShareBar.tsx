import { MaterialIcon } from '../ui/MaterialIcon'

export type ShareBarState = 'idle' | 'sharing' | 'done'

interface ResultShareBarProps {
  state: ShareBarState
  onShare: () => void
}

/**
 * Нижняя золотая кнопка «Поделиться в Telegram».
 */
export function ResultShareBar({ state, onShare }: ResultShareBarProps) {
  const label =
    state === 'sharing'
      ? 'Подключение…'
      : state === 'done'
        ? 'Отправлено в Telegram'
        : 'Поделиться в Telegram'

  const icon =
    state === 'sharing' ? 'sync' : state === 'done' ? 'check_circle' : 'send'

  return (
    <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-50 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto mx-auto max-w-md">
        <button
          type="button"
          disabled={state === 'sharing'}
          onClick={onShare}
          className="gold-gradient-btn flex h-14 w-full items-center justify-center gap-3 rounded-full shadow-2xl transition-transform active:scale-[0.98] disabled:opacity-80"
        >
          <MaterialIcon
            name={icon}
            className={`text-aether-on-primary ${state === 'sharing' ? 'animate-spin' : ''}`}
          />
          <span className="text-lg font-bold tracking-tight text-aether-on-primary">
            {label}
          </span>
        </button>
      </div>
    </div>
  )
}
