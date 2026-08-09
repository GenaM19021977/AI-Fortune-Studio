import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'

import { cn } from '../../lib/cn'

import { BottomNav } from './BottomNav'

export interface AppShellProps {
  /** Контент вместо Outlet (для одиночных экранов без nested route) */
  children?: ReactNode
  /** Нижняя навигация — скрываем в мастере / результате / premium */
  showNav?: boolean
  className?: string
}

/**
 * Оболочка Mini App: градиентный фон, safe-area, опциональный BottomNav.
 * Используется и как layout-route (`<Outlet />`), и с children.
 */
export function AppShell({
  children,
  showNav = true,
  className,
}: AppShellProps) {
  return (
    <div
      className={cn(
        'fortune-gradient-bg flex min-h-full flex-col',
        className,
      )}
    >
      <div
        className={cn(
          'mx-auto flex w-full max-w-lg flex-1 flex-col',
          showNav && 'pb-20',
        )}
      >
        {children ?? <Outlet />}
      </div>
      {showNav && <BottomNav />}
    </div>
  )
}

/** Layout-route с нижней навигацией */
export function MainLayout() {
  return <AppShell showNav />
}

/** Layout без BottomNav (мастер, результат, premium) */
export function FocusLayout() {
  return <AppShell showNav={false} />
}
