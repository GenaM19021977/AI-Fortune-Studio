import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { cn } from '../../lib/cn'
import { useTelegram } from '../../hooks/useTelegram'

export interface PageHeaderProps {
  title: string
  /** Подзаголовок под title */
  subtitle?: string
  /** Показать кнопку «Назад» (браузер: history; Telegram: позже BackButton) */
  showBack?: boolean
  /** Куда идти при back, если history пуст */
  backTo?: string
  right?: ReactNode
  className?: string
}

/**
 * Шапка экрана: заголовок + опциональный back.
 */
export function PageHeader({
  title,
  subtitle,
  showBack = false,
  backTo = '/',
  right,
  className,
}: PageHeaderProps) {
  const navigate = useNavigate()
  const { haptic } = useTelegram()

  const onBack = () => {
    haptic('light')
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate(backTo)
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex items-center gap-3 px-4 py-3',
        'border-b border-white/10 bg-aether-surface/80 backdrop-blur-md',
        'pt-[max(0.75rem,env(safe-area-inset-top))]',
        className,
      )}
    >
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Назад"
          className={cn(
            'flex min-h-11 min-w-11 items-center justify-center rounded-xl',
            'text-aether-on-surface transition-colors hover:bg-white/5',
          )}
        >
          ←
        </button>
      ) : (
        <span className="w-2" aria-hidden />
      )}

      <div className="min-w-0 flex-1 text-center">
        <h1 className="truncate font-fortune-display text-lg font-bold tracking-wide text-aether-on-surface">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-xs text-aether-on-variant/60">{subtitle}</p>
        )}
      </div>

      <div className="flex min-w-11 items-center justify-end">{right}</div>
    </header>
  )
}
