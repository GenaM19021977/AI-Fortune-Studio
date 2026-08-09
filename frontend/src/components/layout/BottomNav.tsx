import { Link, useLocation } from 'react-router-dom'

import { useTelegram } from '../../hooks/useTelegram'
import { cn } from '../../lib/cn'
import { MaterialIcon } from '../ui/MaterialIcon'

interface NavItem {
  to: string
  label: string
  icon: string
  match: (pathname: string) => boolean
}

/** Как в code.html: Home | Create | [FAB spacer] | Gallery | Profile */
const LEFT_ITEMS: NavItem[] = [
  {
    to: '/',
    label: 'Главная',
    icon: 'home',
    match: (p) => p === '/',
  },
  {
    to: '/create',
    label: 'Создать',
    icon: 'magic_button',
    match: (p) => p.startsWith('/create'),
  },
]

const RIGHT_ITEMS: NavItem[] = [
  {
    to: '/history',
    label: 'Галерея',
    icon: 'auto_stories',
    match: (p) => p.startsWith('/history') || p.startsWith('/favorites'),
  },
  {
    to: '/profile',
    label: 'Профиль',
    icon: 'person',
    match: (p) => p.startsWith('/profile'),
  },
]

function NavLink({ item }: { item: NavItem }) {
  const { pathname } = useLocation()
  const { haptic } = useTelegram()
  const active = item.match(pathname)

  return (
    <Link
      to={item.to}
      onClick={() => haptic('light')}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex min-h-11 flex-1 flex-col items-center justify-center',
        'active:scale-90 transition-transform duration-200',
        active
          ? 'text-aether-primary drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]'
          : 'text-aether-on-variant/70 hover:text-aether-primary',
      )}
    >
      <MaterialIcon name={item.icon} filled={active} className="text-[22px]" />
      <span className="font-label-caps mt-1 text-[10px] tracking-wider">{item.label}</span>
    </Link>
  )
}

/**
 * FAB «Create» — золотой круг над навбаром (DESIGN.md / code.html).
 */
export function CreateFab() {
  const { haptic } = useTelegram()

  return (
    <Link
      to="/create"
      onClick={() => haptic('light')}
      aria-label="Создать"
      className={cn(
        'fixed bottom-24 left-1/2 z-50 flex h-16 w-16 -translate-x-1/2 items-center justify-center',
        'rounded-full bg-gradient-to-b from-[#f2ca50] to-[#d4af37] shadow-2xl',
        'active:scale-90 transition-transform group',
      )}
    >
      <span className="absolute inset-0 rounded-full bg-aether-cyan/40 opacity-40 blur-md group-hover:animate-pulse" />
      <MaterialIcon
        name="magic_button"
        filled
        className="relative z-10 text-3xl font-bold text-aether-on-primary"
      />
    </Link>
  )
}

/**
 * Нижняя навигация + FAB по макету главной.
 */
export function BottomNav() {
  return (
    <>
      <CreateFab />
      <nav
        aria-label="Основная навигация"
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 rounded-t-xl',
          'border-t border-white/5 bg-aether-surface-container/60 backdrop-blur-2xl',
          'shadow-[0_-4px_24px_rgba(0,0,0,0.4)]',
          'pb-[max(0.25rem,env(safe-area-inset-bottom))]',
        )}
      >
        <div className="mx-auto flex h-20 w-full max-w-md items-center justify-around px-4">
          {LEFT_ITEMS.map((item) => (
            <NavLink key={item.to} item={item} />
          ))}
          <div className="w-12 shrink-0" aria-hidden />
          {RIGHT_ITEMS.map((item) => (
            <NavLink key={item.to} item={item} />
          ))}
        </div>
      </nav>
    </>
  )
}
