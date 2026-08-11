import { MaterialIcon } from '../ui/MaterialIcon'
import { useTelegram } from '../../hooks/useTelegram'

interface ProfileTopBarProps {
  onSettings?: () => void
}

/**
 * Шапка профиля: бренд + настройки.
 */
export function ProfileTopBar({ onSettings }: ProfileTopBarProps) {
  const { haptic } = useTelegram()

  return (
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
        <div className="flex-1" />
        <button
          type="button"
          aria-label="Настройки"
          onClick={() => {
            haptic('light')
            onSettings?.()
          }}
          className="text-aether-on-variant transition-opacity hover:opacity-80"
        >
          <MaterialIcon name="settings" />
        </button>
      </div>
    </header>
  )
}
