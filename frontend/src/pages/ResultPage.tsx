import { useParams } from 'react-router-dom'

import { PlaceholderPage } from './PlaceholderPage'

/** Результат генерации (шаг 1.17) */
export function ResultPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <PlaceholderPage
      title="Результат"
      showBack
      backTo="/"
      description={`Генерация ${id ?? '—'}: текст, медиа-вкладки, share.`}
      links={[
        { to: '/history', label: 'К истории' },
        { to: '/create', label: 'Создать ещё' },
      ]}
    />
  )
}
