/** Фоны «сущности» для предпросмотра сторис (без CDN). */

export interface StoryEssence {
  id: string
  label: string
  /** CSS background для превью и кадра */
  gradient: string
}

export const STORY_ESSENCES: StoryEssence[] = [
  {
    id: 'nebula',
    label: 'Космическая туманность',
    gradient:
      'radial-gradient(circle at 30% 20%, rgba(206,158,255,0.55), transparent 45%), radial-gradient(circle at 70% 70%, rgba(212,175,55,0.35), transparent 40%), linear-gradient(160deg, #1a0b2e, #0f0f1a)',
  },
  {
    id: 'gold',
    label: 'Золотые следы',
    gradient:
      'radial-gradient(circle at 50% 30%, rgba(242,202,80,0.45), transparent 50%), linear-gradient(200deg, #2a1a00, #0f0f1a)',
  },
  {
    id: 'teal',
    label: 'Бирюзовый туман',
    gradient:
      'radial-gradient(circle at 40% 40%, rgba(0,238,252,0.4), transparent 50%), linear-gradient(180deg, #00363a, #0f0f1a)',
  },
  {
    id: 'fire',
    label: 'Огненная сингулярность',
    gradient:
      'radial-gradient(circle at 50% 60%, rgba(255,100,50,0.45), transparent 45%), linear-gradient(160deg, #2a0a00, #0f0f1a)',
  },
  {
    id: 'crystal',
    label: 'Кристальная призма',
    gradient:
      'conic-gradient(from 180deg at 50% 50%, rgba(0,240,255,0.25), rgba(206,158,255,0.3), rgba(242,202,80,0.25), rgba(0,240,255,0.25)), linear-gradient(160deg, #1b1a26, #0d0d18)',
  },
  {
    id: 'dark',
    label: 'Тёмная материя',
    gradient:
      'radial-gradient(circle at 50% 50%, rgba(103,0,181,0.35), transparent 55%), linear-gradient(180deg, #0d0d18, #000)',
  },
]

export const DEMO_STORY = {
  title: 'Небесный странник',
  quote: 'Путешествие бесконечных возможностей ждёт под движущимися звёздами.',
} as const
