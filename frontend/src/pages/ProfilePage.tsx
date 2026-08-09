import { PlaceholderPage } from './PlaceholderPage'

/** Профиль и лимиты (шаг 1.18) */
export function ProfilePage() {
  return (
    <PlaceholderPage
      title="Профиль"
      description="Аватар Telegram, квота «N из 5», настройки, Premium."
      links={[
        { to: '/premium', label: 'Тарифы Premium' },
        { to: '/dev/ui', label: 'UI Kit (dev)' },
      ]}
    />
  )
}
