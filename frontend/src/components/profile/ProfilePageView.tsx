import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  fetchHistory,
  fetchMe,
  fetchPersonas,
  patchMeSettings,
  queryKeys,
} from '../../api'
import { GATEWAY_STORAGE_KEY } from '../../config/dev'
import { useTelegram } from '../../hooks/useTelegram'
import { Skeleton } from '../ui/Skeleton'

import { ProfileAchievements } from './ProfileAchievements'
import { ProfileIdentity } from './ProfileIdentity'
import { ProfileSettings } from './ProfileSettings'
import {
  ProfileFavoritesTab,
  ProfileHistoryTab,
  ProfileReferralTab,
  ProfileTabs,
  type ProfileTabId,
} from './ProfileTabs'
import { ProfileTopBar } from './ProfileTopBar'

function localeLabel(code: string): string {
  if (code.startsWith('ru')) return 'Русский'
  if (code.startsWith('en')) return 'English'
  return code || 'Русский'
}

/**
 * Экран профиля (макет «Профиль пользователя»).
 * Данные: GET /me/, история, настройки PATCH.
 */
export function ProfilePageView() {
  const { haptic, user, isMock } = useTelegram()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<ProfileTabId>('history')
  const [notice, setNotice] = useState<string | null>(null)

  const meQuery = useQuery({
    queryKey: queryKeys.me,
    queryFn: fetchMe,
  })
  const historyQuery = useQuery({
    queryKey: queryKeys.history(1),
    queryFn: () => fetchHistory(1),
  })
  const personasQuery = useQuery({
    queryKey: queryKeys.personas(),
    queryFn: () => fetchPersonas(),
  })

  const settingsMutation = useMutation({
    mutationFn: patchMeSettings,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.me })
      haptic('success')
    },
    onError: (err: Error) => {
      haptic('error')
      setNotice(err.message || 'Не удалось сохранить настройки')
    },
  })

  const me = meQuery.data
  const historyItems = historyQuery.data?.results ?? []
  const readingsCount = historyQuery.data?.count ?? historyItems.length

  const favoritePersona = useMemo(() => {
    const slug = me?.settings.favorite_persona_slug
    if (!slug || !personasQuery.data) return null
    return personasQuery.data.find((p) => p.slug === slug) ?? null
  }, [me?.settings.favorite_persona_slug, personasQuery.data])

  const referralCode = me
    ? `FORTUNE-${String(me.telegram_id).slice(-5).toUpperCase()}`
    : 'FORTUNE-DEMO'

  const flash = (message: string) => {
    haptic('light')
    setNotice(message)
  }

  const scrollToSettings = () => {
    document
      .getElementById('profile-settings')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const onLogout = () => {
    haptic('light')
    try {
      sessionStorage.removeItem(GATEWAY_STORAGE_KEY)
    } catch {
      /* private mode */
    }
    flash(
      isMock
        ? 'Связь разорвана для этой вкладки. Обновите страницу, чтобы снова увидеть вход.'
        : 'В Telegram Mini App выход не требуется — закройте приложение.',
    )
  }

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute top-[-100px] right-[-50px] h-[300px] w-[300px] rounded-full bg-aether-cyan opacity-40 blur-[80px]" />
        <div className="absolute bottom-[20%] left-[-100px] h-[400px] w-[400px] rounded-full bg-[#6700b5] opacity-40 blur-[80px]" />
      </div>

      <ProfileTopBar onSettings={scrollToSettings} />

      <main className="mx-auto w-full max-w-md flex-1 space-y-8 px-5 pt-6 pb-8">
        {notice && (
          <p
            role="status"
            className="glass-card rounded-xl px-4 py-3 text-center text-sm text-aether-on-variant"
          >
            {notice}
          </p>
        )}

        {meQuery.isLoading && (
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-28 w-28 rounded-full" />
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        )}

        {meQuery.isError && (
          <div className="glass-card rounded-2xl p-6 text-sm text-amber-200">
            {(meQuery.error as Error).message}
            <p className="mt-2 text-aether-on-variant">
              Проверьте, что backend запущен на :8000.
            </p>
          </div>
        )}

        {me && (
          <>
            <ProfileIdentity
              me={me}
              photoUrl={user?.photo_url}
              readingsCount={readingsCount}
            />

            {!me.is_premium && (
              <Link
                to="/premium"
                className="glass-card premium-border block rounded-2xl px-4 py-3 text-center font-label-caps text-aether-primary"
              >
                Открыть Premium
              </Link>
            )}

            <ProfileAchievements
              onViewAll={() => flash('Полный список достижений появится позже')}
            />

            <ProfileTabs
              active={tab}
              onChange={(next) => {
                haptic('light')
                setTab(next)
              }}
            />

            <div className="min-h-[200px]">
              {tab === 'history' && (
                <ProfileHistoryTab
                  items={historyItems}
                  loading={historyQuery.isLoading}
                />
              )}
              {tab === 'favorites' && (
                <ProfileFavoritesTab
                  favoriteTitle={favoritePersona?.name ?? null}
                  favoriteSubtitle={favoritePersona?.title}
                />
              )}
              {tab === 'referral' && (
                <ProfileReferralTab
                  code={referralCode}
                  onCopy={() => {
                    void navigator.clipboard
                      ?.writeText(referralCode)
                      .then(() => flash('Код скопирован'))
                      .catch(() => flash('Не удалось скопировать'))
                  }}
                />
              )}
            </div>

            <ProfileSettings
              localeLabel={localeLabel(me.settings.locale || me.language_code)}
              notificationsEnabled={me.settings.notifications_enabled}
              saving={settingsMutation.isPending}
              onLocale={() =>
                flash('Смена языка оракула — в следующей версии. Сейчас: русский UI.')
              }
              onToggleNotifications={() => {
                settingsMutation.mutate({
                  notifications_enabled: !me.settings.notifications_enabled,
                })
              }}
              onLogout={onLogout}
            />
          </>
        )}
      </main>
    </div>
  )
}
