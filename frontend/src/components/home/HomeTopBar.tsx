import { Link } from 'react-router-dom'

import { MaterialIcon } from '../ui/MaterialIcon'

/**
 * Верхняя панель главной: бренд + уведомления (заглушка → профиль).
 */
export function HomeTopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-aether-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-md items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <MaterialIcon name="auto_awesome" className="text-2xl text-aether-primary" />
          <h1 className="text-xl font-semibold tracking-tight text-aether-primary">
            AI Fortune Studio
          </h1>
        </div>
        <Link
          to="/profile"
          aria-label="Профиль и уведомления"
          className="glass-card flex h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-80"
        >
          <MaterialIcon name="notifications" className="text-aether-on-variant" />
        </Link>
      </div>
    </header>
  )
}
