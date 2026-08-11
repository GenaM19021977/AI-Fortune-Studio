import { Link } from 'react-router-dom'

import { cn } from '../../lib/cn'

/**
 * Переключатель внутри вкладки «Галерея»: стили / сообщество.
 */
export function GallerySegmentTabs({ active }: { active: 'library' | 'community' }) {
  return (
    <div className="glass-panel mb-2 flex gap-1 rounded-full p-1">
      <Link
        to="/library"
        className={cn(
          'flex-1 rounded-full py-2 text-center font-label-caps transition-colors',
          active === 'library'
            ? 'bg-aether-primary/20 text-aether-primary'
            : 'text-aether-on-variant/70 hover:text-aether-primary',
        )}
      >
        Стили
      </Link>
      <Link
        to="/community"
        className={cn(
          'flex-1 rounded-full py-2 text-center font-label-caps transition-colors',
          active === 'community'
            ? 'bg-aether-primary/20 text-aether-primary'
            : 'text-aether-on-variant/70 hover:text-aether-primary',
        )}
      >
        Сообщество
      </Link>
    </div>
  )
}
