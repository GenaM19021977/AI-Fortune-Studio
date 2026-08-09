import { PlaceholderPage } from './PlaceholderPage'

/** Избранное / коллекция */
export function FavoritesPage() {
  return (
    <PlaceholderPage
      title="Избранное"
      showBack
      backTo="/history"
      description="Коллекция сохранённых генераций."
      links={[{ to: '/history', label: 'К истории' }]}
    />
  )
}
