import { Link } from 'react-router-dom'

import { MaterialIcon } from '../ui/MaterialIcon'

/**
 * Bento-сетка инструментов студии.
 */
export function VideoToolActions() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Link
        to="/image"
        className="glass-card group flex flex-col items-center justify-center gap-3 border-aether-primary/20 p-4 transition-colors hover:border-aether-primary/40"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-aether-primary-container/20 transition-transform group-hover:scale-110">
          <MaterialIcon name="image" className="text-aether-primary" />
        </div>
        <span className="font-label-caps text-center text-aether-on-surface">
          Анимировать фото
        </span>
      </Link>
      <Link
        to="/library"
        className="glass-card group flex flex-col items-center justify-center gap-3 border-white/10 p-4 transition-colors hover:border-white/20"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-aether-cyan/10 transition-transform group-hover:scale-110">
          <MaterialIcon name="style" className="text-aether-cyan-dim" />
        </div>
        <span className="font-label-caps text-center text-aether-on-surface">
          Фильтр стиля
        </span>
      </Link>
    </div>
  )
}
