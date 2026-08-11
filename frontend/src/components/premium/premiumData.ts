/** Тарифы и привилегии экрана Premium (макет «Премиум доступ»). */

export type PremiumPlanId = 'monthly' | 'yearly'

export interface PremiumPlan {
  id: PremiumPlanId
  title: string
  subtitle: string
  price: string
  period: string
  recommended?: boolean
  badge?: string
}

export interface PremiumPerk {
  id: string
  icon: string
  title: string
  description: string
}

export const PREMIUM_HERO = {
  eyebrow: 'ВОСХОЖДЕНИЕ К МАСТЕРСТВУ',
  titleBefore: 'Откройте свою ',
  titleGold: 'цифровую судьбу',
  subtitle:
    'Полная сила техно-мистики и продвинутых ИИ-моделей AI Fortune Studio.',
} as const

export const PREMIUM_TIERS = {
  free: {
    label: 'Бесплатно',
    price: '0 €',
    caption: 'Обычный доступ',
  },
  premium: {
    label: 'Premium',
    price: '9,99 €',
    caption: 'Полный потенциал',
    badge: 'Элита',
  },
} as const

export const PREMIUM_PERKS: PremiumPerk[] = [
  {
    id: 'unlimited',
    icon: 'all_inclusive',
    title: 'Безлимитные генерации',
    description: 'Без дневных лимитов — исследуйте космос без остановки.',
  },
  {
    id: 'hd',
    icon: 'high_quality',
    title: 'HD-картинки и видео',
    description: 'Судьба в чёткости 4K и плавном движении.',
  },
  {
    id: 'priority',
    icon: 'speed',
    title: 'Приоритетная очередь',
    description: 'Ваши чтения обрабатываются первыми на быстрых серверах.',
  },
  {
    id: 'styles',
    icon: 'palette',
    title: 'Эксклюзивные стили',
    description: 'Секретные колоды и мистические фильтры, недоступные другим.',
  },
]

export const PREMIUM_PLANS: PremiumPlan[] = [
  {
    id: 'monthly',
    title: 'Месячный ритуал',
    subtitle: 'Отмена в любой момент',
    price: '9,99 €',
    period: '/ мес.',
  },
  {
    id: 'yearly',
    title: 'Годовое просветление',
    subtitle: 'Экономия 40% в год',
    price: '79,99 €',
    period: '/ год',
    recommended: true,
    badge: 'Выгоднее',
  },
]
