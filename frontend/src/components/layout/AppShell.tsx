import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'

import { cn } from '../../lib/cn'

import { BottomNav } from './BottomNav'
import { CosmicBackground } from './CosmicBackground'

export interface AppShellProps {
  children?: ReactNode
  showNav?: boolean
  className?: string
}

/**
 * Оболочка Mini App: cosmic bg, safe-area, BottomNav + FAB.
 */
export function AppShell({
  children,
  showNav = true,
  className,
}: AppShellProps) {
  return (
    <div className={cn('fortune-gradient-bg relative flex min-h-full flex-col', className)}>
      <CosmicBackground />
      <div
        className={cn(
          'relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col',
          /* h-20 nav + FAB overhang */
          showNav && 'pb-28',
        )}
      >
        {children ?? <Outlet />}
      </div>
      {showNav && <BottomNav />}
    </div>
  )
}

export function MainLayout() {
  return <AppShell showNav />
}

export function FocusLayout() {
  return <AppShell showNav={false} />
}
