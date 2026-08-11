import { MaterialIcon } from '../ui/MaterialIcon'
import { cn } from '../../lib/cn'

interface ProfileSettingsProps {
  localeLabel: string
  notificationsEnabled: boolean
  onToggleNotifications: () => void
  onLocale: () => void
  onLogout: () => void
  saving?: boolean
}

/**
 * Блок быстрых настроек («Выравнивание системы»).
 */
export function ProfileSettings({
  localeLabel,
  notificationsEnabled,
  onToggleNotifications,
  onLocale,
  onLogout,
  saving,
}: ProfileSettingsProps) {
  return (
    <section id="profile-settings" className="space-y-4 scroll-mt-24">
      <h3 className="font-label-caps text-aether-on-variant">
        Выравнивание системы
      </h3>
      <div className="glass-card overflow-hidden rounded-2xl">
        <button
          type="button"
          onClick={onLocale}
          className="flex w-full items-center justify-between border-b border-white/5 p-4 transition-colors active:bg-white/5"
        >
          <div className="flex items-center space-x-3">
            <MaterialIcon name="language" className="text-aether-on-variant" />
            <span>Язык оракула</span>
          </div>
          <div className="flex items-center space-x-1 text-aether-on-variant/60">
            <span className="text-xs">{localeLabel}</span>
            <MaterialIcon name="chevron_right" />
          </div>
        </button>

        <div className="flex items-center justify-between border-b border-white/5 p-4 transition-colors active:bg-white/5">
          <div className="flex items-center space-x-3">
            <MaterialIcon
              name="notifications"
              className="text-aether-on-variant"
            />
            <span>Пророческие оповещения</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={notificationsEnabled}
            disabled={saving}
            onClick={onToggleNotifications}
            className={cn(
              'relative h-5 w-10 rounded-full p-0.5 transition-colors',
              notificationsEnabled ? 'bg-aether-primary/20' : 'bg-white/10',
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 h-4 w-4 rounded-full bg-aether-primary transition-all',
                notificationsEnabled ? 'right-0.5' : 'left-0.5 opacity-50',
              )}
            />
          </button>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center space-x-3 p-4 text-[#ffb4ab] transition-colors active:bg-white/5"
        >
          <MaterialIcon name="logout" />
          <span>Разорвать связь</span>
        </button>
      </div>
    </section>
  )
}
