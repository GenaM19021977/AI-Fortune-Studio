import { PlaceholderPage } from './PlaceholderPage'

/** История генераций (шаг 1.18) */
export function HistoryPage() {
  return (
    <PlaceholderPage
      title="История"
      description="Список генераций из GET /api/v1/me/history/. Тап → /result/:id."
      links={[
        { to: '/favorites', label: 'Избранное' },
        { to: '/result/demo', label: 'Пример результата' },
      ]}
    />
  )
}
