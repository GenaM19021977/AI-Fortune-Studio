import { MaterialIcon } from '../ui/MaterialIcon'
import { cn } from '../../lib/cn'

interface DevMainButtonProps {
  label: string
  loading?: boolean
  disabled?: boolean
  onClick: () => void
}

/**
 * Золотая CTA мастера (макет CREATE).
 * В Telegram на шаге 4 дублирует MainButton; в браузере — основная кнопка.
 */
export function DevMainButton({
  label,
  loading = false,
  disabled = false,
  onClick,
}: DevMainButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        'glow-gold flex h-16 w-full items-center justify-center space-x-3 rounded-2xl',
        'bg-aether-primary-container text-aether-on-primary',
        'text-xl font-bold transition-transform active:scale-95',
        'disabled:pointer-events-none disabled:opacity-50',
      )}
    >
      {loading ? (
        <>
          <MaterialIcon name="progress_activity" className="animate-spin" />
          <span>Призываем…</span>
        </>
      ) : (
        <>
          <MaterialIcon name="magic_button" filled />
          <span>{label}</span>
        </>
      )}
    </button>
  )
}
