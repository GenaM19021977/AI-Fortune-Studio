import { Link } from 'react-router-dom'

import { MaterialIcon } from '../ui/MaterialIcon'

/**
 * Шапка экрана результата (макет «Результат генерации»).
 */
export function ResultTopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-aether-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-md items-center px-5">
        <Link
          to="/"
          aria-label="На главную"
          className="mr-4 text-aether-primary transition-opacity hover:opacity-80"
        >
          <MaterialIcon name="auto_awesome" />
        </Link>
        <h1 className="text-xl font-semibold tracking-tight text-aether-primary">
          AI Fortune Studio
        </h1>
        <div className="flex-1" />
        <Link
          to="/history"
          aria-label="История"
          className="text-aether-primary transition-opacity hover:opacity-80"
        >
          <MaterialIcon name="history" />
        </Link>
      </div>
    </header>
  )
}
