import { Link } from 'react-router-dom'

import { PageHeader } from '../components/layout'
import { Card } from '../components/ui'

interface PlaceholderPageProps {
  title: string
  description: string
  /** Показать кнопку назад в шапке */
  showBack?: boolean
  /** Куда идти при back, если history пуст */
  backTo?: string
  /** Ссылки для проверки роутинга на шаге 1.13 */
  links?: Array<{ to: string; label: string }>
}

/**
 * Заглушка экрана до наполнения (1.14–1.18).
 * Нужна, чтобы навигация и layout уже работали на 1.13.
 */
export function PlaceholderPage({
  title,
  description,
  showBack = false,
  backTo,
  links = [],
}: PlaceholderPageProps) {
  return (
    <>
      <PageHeader title={title} showBack={showBack} backTo={backTo} />
      <div className="flex flex-1 flex-col px-4 py-6">
        <Card>
          <p className="text-sm text-purple-100">{description}</p>
          <p className="mt-2 text-xs text-purple-400/50">
            Контент экрана — на следующих шагах DEVELOPMENT_GUIDE.
          </p>
        </Card>

        {links.length > 0 && (
          <ul className="mt-6 space-y-2">
            {links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="block rounded-xl border border-purple-500/20 bg-fortune-card px-4 py-3 text-sm text-fortune-gold/90 hover:border-fortune-accent/40"
                >
                  {link.label} →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
