/**
 * Демо-данные экрана «Сообщество» (макет).
 * Реальный API ленты / рейтинга — позже.
 */

export interface CommunityCreation {
  id: string
  author: string
  likesLabel: string
  /** CSS-градиент вместо CDN-картинки на этапе UI */
  gradient: string
  icon: string
}

export interface CommunityLeader {
  id: string
  name: string
  threadsLabel: string
  pointsLabel: string
  trend: 'up' | 'flat' | 'down'
  trendLabel: string
  rank: number
  gradient: string
}

export interface LiveEvent {
  id: string
  text: string
  tone: 'live' | 'info'
  pulse?: boolean
}

export const COMMUNITY_CHALLENGE = {
  badge: 'Активный челлендж',
  title: 'Чтение солнечного затмения',
  description:
    'Создайте промпт, который покажет двойственность света и тени. Топ-5 получат 500 кредитов.',
  cta: 'Участвовать',
} as const

export const COMMUNITY_CREATIONS: CommunityCreation[] = [
  {
    id: 'c1',
    author: '@nebula_seeker',
    likesLabel: '1,2 тыс.',
    gradient:
      'radial-gradient(circle at 30% 20%, rgba(0,240,255,0.35), transparent 50%), linear-gradient(160deg, #1a0b2e, #0f0f1a)',
    icon: 'dark_mode',
  },
  {
    id: 'c2',
    author: '@cyber_shaman',
    likesLabel: '892',
    gradient:
      'radial-gradient(circle at 70% 30%, rgba(212,175,55,0.35), transparent 45%), linear-gradient(200deg, #1f1e2a, #0d0d18)',
    icon: 'diamond',
  },
]

export const WEEKLY_PRIZE = {
  title: 'Приз недели мистики',
  bodyPrefix: 'Лучший автор недели получает бейдж',
  badge: '«Архимаг»',
  bodySuffix: ' и 1000 осколков души.',
} as const

export const COMMUNITY_LEADERS: CommunityLeader[] = [
  {
    id: 'l1',
    name: 'OracleZero',
    threadsLabel: '42 активных треда',
    pointsLabel: '12 450 очк.',
    trend: 'up',
    trendLabel: '↑ 12%',
    rank: 1,
    gradient: 'linear-gradient(135deg, #d4af37, #00eefc)',
  },
  {
    id: 'l2',
    name: 'Star_Weaver',
    threadsLabel: '38 активных тредов',
    pointsLabel: '9 820 очк.',
    trend: 'flat',
    trendLabel: '—',
    rank: 2,
    gradient: 'linear-gradient(135deg, #ce9eff, #1a0b2e)',
  },
  {
    id: 'l3',
    name: 'Void_Echo',
    threadsLabel: '31 активный тред',
    pointsLabel: '8 150 очк.',
    trend: 'down',
    trendLabel: '↓ 4%',
    rank: 3,
    gradient: 'linear-gradient(135deg, #00dbe9, #480081)',
  },
]

export const LIVE_ACTIVITY: LiveEvent[] = [
  {
    id: 'a1',
    text: '@mystic_ai только что создал шедевр…',
    tone: 'live',
    pulse: true,
  },
  {
    id: 'a2',
    text: '320 пользователей сейчас медитируют…',
    tone: 'info',
  },
]
