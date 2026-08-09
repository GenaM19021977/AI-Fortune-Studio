import { useParams } from 'react-router-dom'

import { PlaceholderPage } from './PlaceholderPage'

/**
 * Мастер создания (заглушка до шагов 1.15–1.16).
 * /create/:mode — предвыбранный режим с главной.
 */
export function CreatePage() {
  const { mode } = useParams<{ mode?: string }>()

  return (
    <PlaceholderPage
      title="Создать"
      showBack
      description={
        mode
          ? `Мастер с режимом «${mode}». Шаги данных → персонаж → подтверждение.`
          : 'Мастер из 4 шагов. Режим можно выбрать здесь или на главной.'
      }
      links={[
        { to: '/create/greeting', label: 'Пример: /create/greeting' },
        { to: '/result/demo', label: 'Перейти к экрану результата' },
      ]}
    />
  )
}
