import { PlaceholderPage } from './PlaceholderPage'

/** Предсказание дня (контент — с daily-fortune API на 1.14) */
export function DailyPage() {
  return (
    <PlaceholderPage
      title="Предсказание дня"
      showBack
      description="Один тап с главной → GET /api/v1/daily-fortune/ (без квоты)."
      links={[{ to: '/', label: 'На главную' }]}
    />
  )
}
