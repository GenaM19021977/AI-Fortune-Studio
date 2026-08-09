import { Link, useLocation } from 'react-router-dom'

import { useTelegram } from '../../hooks/useTelegram'
import { cn } from '../../lib/cn'

interface NavItem {
  to: string
  label: string
  icon: string
  /** Совпадение пути: exact для главной */
  match: (pathname: string) => boolean
}

const NAV_ITEMS: NavItem[] = [
  {
    to: '/',
    label: 'Главная',
    icon: '🏠',
    match: (p) => p === '/',
  },
  {
    to: '/create',
    label: 'Создать',
    icon: '✨',
    match: (p) => p.startsWith('/create'),
  },
  {
    to: '/history',
    label: 'История',
    icon: '📜',
    match: (p) => p.startsWith('/history') || p.startsWith('/favorites'),
  },
  {
    to: '/profile',
    label: 'Профиль',
    icon: '👤',
    match: (p) => p.startsWith('/profile'),
  },
]

/**
 * Нижняя навигация Mini App (IMPLEMENTATION_PLAN §9.4).
 * Touch targets ≥ 44px; haptic при переходе.
 */
export function BottomNav() {
  const { pathname } = useLocation()
  const { haptic } = useTelegram()

  return (
    <nav
      aria-label="Основная навигация"
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 border-t border-purple-500/20',
        'bg-fortune-surface/90 backdrop-blur-xl',
        'pb-[max(0.5rem,env(safe-area-inset-bottom))]',
      )}
    >
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const active = item.match(pathname)
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => haptic('light')}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-h-11 min-w-16 flex-1 flex-col items-center justify-center gap-0.5',
                'text-[10px] font-medium uppercase tracking-wide transition-colors',
                active
                  ? 'text-fortune-gold drop-shadow-[0_0_8px_rgba(245,197,66,0.35)]'
                  : 'text-purple-300/55 hover:text-purple-200',
              )}
            >
              <span className="text-lg leading-none" aria-hidden>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
