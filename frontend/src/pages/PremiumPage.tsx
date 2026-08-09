import { PlaceholderPage } from './PlaceholderPage'

/** Экран тарифов (при 429 с generate) */
export function PremiumPage() {
  return (
    <PlaceholderPage
      title="Premium"
      showBack
      description="Тарифы и снятие дневного лимита. Попадём сюда при HTTP 429."
      links={[{ to: '/profile', label: 'К профилю' }]}
    />
  )
}
