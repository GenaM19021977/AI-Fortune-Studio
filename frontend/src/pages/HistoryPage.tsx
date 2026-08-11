import { PlaceholderPage } from './PlaceholderPage'

/** История генераций — доступна из Библиотеки стилей. */
export function HistoryPage() {
  return (
    <PlaceholderPage
      title="История"
      showBack
      backTo="/library"
      description="Список генераций из GET /api/v1/me/history/. Тап → /result/:id."
      links={[
        { to: '/library', label: 'Библиотека стилей' },
        { to: '/favorites', label: 'Избранное' },
      ]}
    />
  )
}
