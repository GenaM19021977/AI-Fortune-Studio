import { cn } from '../../lib/cn'

interface ProgressDotsProps {
  /** Текущий шаг 1…total */
  step: number
  total?: number
}

/**
 * Индикатор шагов мастера (полоски из макета Creation Master).
 */
export function ProgressDots({ step, total = 4 }: ProgressDotsProps) {
  return (
    <div className="flex space-x-1" aria-label={`Шаг ${step} из ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        const active = i + 1 <= step
        return (
          <div
            key={i}
            className={cn(
              'h-1.5 w-8 rounded-full transition-colors',
              active ? 'bg-aether-primary' : 'bg-aether-surface-high',
            )}
          />
        )
      })}
    </div>
  )
}
