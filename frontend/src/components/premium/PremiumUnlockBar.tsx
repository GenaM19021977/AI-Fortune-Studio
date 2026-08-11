import { MaterialIcon } from '../ui/MaterialIcon'

interface PremiumUnlockBarProps {
  onUnlock: () => void
  busy?: boolean
}

/**
 * Нижняя кнопка оплаты (пока заглушка до распоряжения).
 */
export function PremiumUnlockBar({ onUnlock, busy }: PremiumUnlockBarProps) {
  return (
    <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-t-xl border-t border-white/5 bg-aether-surface-container/60 backdrop-blur-2xl">
      <div className="flex flex-col items-center px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          disabled={busy}
          onClick={onUnlock}
          className="premium-gold-gradient flex h-14 w-full items-center justify-center gap-2 rounded-full shadow-[0_4px_24px_rgba(212,175,55,0.4)] transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-70"
        >
          <MaterialIcon
            name={busy ? 'sync' : 'auto_fix_high'}
            filled
            className={`text-aether-on-primary ${busy ? 'animate-spin' : ''}`}
          />
          <span className="font-label-caps text-[16px] font-bold tracking-widest text-aether-on-primary">
            {busy ? 'Подключение…' : 'Открыть магию'}
          </span>
        </button>
        <p className="mt-3 text-center text-xs text-aether-on-variant/60">
          Безопасная оплата через Telegram Stars или карту (скоро)
        </p>
      </div>
    </div>
  )
}
