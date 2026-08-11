import { Link } from 'react-router-dom'

import { MaterialIcon } from '../ui/MaterialIcon'

/**
 * Шапка экрана Premium: бренд + закрыть.
 */
export function PremiumTopBar() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-aether-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-md items-center px-5">
        <MaterialIcon name="auto_awesome" className="mr-3 text-aether-primary" />
        <h1 className="text-xl font-semibold tracking-tight text-aether-primary">
          AI Fortune Studio
        </h1>
        <Link
          to="/"
          aria-label="Закрыть"
          className="ml-auto text-aether-on-variant transition-opacity hover:opacity-80"
        >
          <MaterialIcon name="close" />
        </Link>
      </div>
    </header>
  )
}
