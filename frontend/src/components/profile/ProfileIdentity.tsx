import { MaterialIcon } from '../ui/MaterialIcon'
import type { MeProfile } from '../../types/api'

interface ProfileIdentityProps {
  me: MeProfile
  photoUrl?: string | null
  readingsCount: number
}

function initials(first: string, last: string): string {
  const a = first.trim().charAt(0)
  const b = last.trim().charAt(0)
  return (a + b).toUpperCase() || '✨'
}

/**
 * Аватар, имя и статистика пользователя.
 */
export function ProfileIdentity({
  me,
  photoUrl,
  readingsCount,
}: ProfileIdentityProps) {
  const displayName =
    [me.first_name, me.last_name].filter(Boolean).join(' ') || 'Странник'
  const title = me.is_premium
    ? 'Мастер цифрового оракула'
    : 'Ученик цифрового оракула'
  const insight = Math.max(0, me.quota.remaining) * 100 + readingsCount * 12
  const level = Math.max(1, Math.min(99, 1 + Math.floor(readingsCount / 3)))

  return (
    <section className="flex flex-col items-center space-y-4 text-center">
      <div className="relative">
        <div className="h-28 w-28 overflow-hidden rounded-full bg-gradient-to-tr from-aether-primary via-aether-tertiary to-aether-cyan p-1 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
          <div className="h-full w-full overflow-hidden rounded-full border-2 border-aether-surface">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-aether-surface-high text-2xl font-bold text-aether-primary">
                {initials(me.first_name, me.last_name)}
              </div>
            )}
          </div>
        </div>
        <div className="absolute right-0 bottom-0 flex items-center justify-center rounded-full bg-aether-primary p-1.5 text-aether-on-primary shadow-lg">
          <MaterialIcon
            name="verified"
            filled
            className="text-[18px]"
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-aether-on-surface">
          {displayName}
        </h2>
        <p className="text-aether-on-variant/70">
          {me.username ? `@${me.username}` : title}
        </p>
        {me.username && (
          <p className="mt-1 text-sm text-aether-on-variant/60">{title}</p>
        )}
      </div>

      <div className="flex w-full gap-4">
        <div className="glass-card flex flex-1 flex-col items-center rounded-xl p-3">
          <span className="text-2xl font-semibold text-aether-primary">
            {readingsCount}
          </span>
          <span className="font-label-caps opacity-60">Чтения</span>
        </div>
        <div className="glass-card flex flex-1 flex-col items-center rounded-xl p-3">
          <span className="text-2xl font-semibold text-aether-primary">
            {insight >= 1000
              ? `${(insight / 1000).toFixed(1).replace('.', ',')} тыс.`
              : insight}
          </span>
          <span className="font-label-caps opacity-60">Инсайт</span>
        </div>
        <div className="glass-card flex flex-1 flex-col items-center rounded-xl p-3">
          <span className="text-2xl font-semibold text-aether-primary">
            УР. {level}
          </span>
          <span className="font-label-caps opacity-60">Восхождение</span>
        </div>
      </div>

      <p className="font-label-caps text-aether-on-variant/50">
        Квота сегодня: {me.quota.used} из {me.quota.daily_limit}
      </p>
    </section>
  )
}
