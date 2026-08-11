/** Русские подписи категорий персонажей (API slug → UI). */

export const CATEGORY_LABELS: Record<string, { title: string; subtitle: string }> = {
  mystic: { title: 'Мистика', subtitle: 'Тайны и знаки' },
  humor: { title: 'Юмор', subtitle: 'Остроумие и сарказм' },
  history: { title: 'История', subtitle: 'Древние архивы' },
  sages: { title: 'Мудрецы', subtitle: 'Глубокая мудрость' },
}

export function categoryLabel(slug: string): string {
  return CATEGORY_LABELS[slug]?.title ?? slug
}

export function categorySubtitle(slug: string): string {
  return CATEGORY_LABELS[slug]?.subtitle ?? 'Стили персонажей'
}
