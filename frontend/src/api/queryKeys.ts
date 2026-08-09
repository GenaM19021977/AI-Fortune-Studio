/** Ключи TanStack Query — единый реестр, без строк-литералов по проекту. */

export const queryKeys = {
  modes: ['modes'] as const,
  personas: (category?: string) =>
    category ? (['personas', category] as const) : (['personas'] as const),
  events: ['events'] as const,
  seasonal: ['seasonal'] as const,
  me: ['me'] as const,
  history: (page: number) => ['history', page] as const,
  dailyFortune: ['daily-fortune'] as const,
  generation: (id: string) => ['generation', id] as const,
}
