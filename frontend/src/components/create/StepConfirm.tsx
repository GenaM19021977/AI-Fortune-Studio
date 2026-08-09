import { useQuery } from '@tanstack/react-query'

import { fetchEvents, fetchModes, fetchPersonas, queryKeys } from '../../api'
import { useCreateWizardStore } from '../../store/createWizard'

/**
 * Шаг 4 — сводка перед генерацией.
 */
export function StepConfirm() {
  const name = useCreateWizardStore((s) => s.name)
  const birthDate = useCreateWizardStore((s) => s.birthDate)
  const event = useCreateWizardStore((s) => s.event)
  const contentMode = useCreateWizardStore((s) => s.contentMode)
  const personaSlug = useCreateWizardStore((s) => s.personaSlug)
  const interests = useCreateWizardStore((s) => s.interests)
  const extraPreview = useCreateWizardStore((s) => s.buildExtraPayload())

  const modesQuery = useQuery({ queryKey: queryKeys.modes, queryFn: fetchModes })
  const personasQuery = useQuery({
    queryKey: queryKeys.personas(),
    queryFn: () => fetchPersonas(),
  })
  const eventsQuery = useQuery({ queryKey: queryKeys.events, queryFn: fetchEvents })

  const modeName =
    modesQuery.data?.find((m) => m.slug === contentMode)?.name ?? contentMode ?? '—'
  const personaName =
    personasQuery.data?.find((p) => p.slug === personaSlug)?.name ?? personaSlug ?? '—'
  const eventName =
    eventsQuery.data?.find((e) => e.slug === event)?.name ?? (event || 'не указан')

  return (
    <div className="glass-card-gold space-y-4 rounded-[24px] p-6">
      <p className="font-label-caps text-aether-primary">Сводка манифеста</p>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-aether-on-variant">Имя</dt>
          <dd className="font-medium text-aether-on-surface">{name || '—'}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-aether-on-variant">Режим</dt>
          <dd className="font-medium text-aether-on-surface">{modeName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-aether-on-variant">Персонаж</dt>
          <dd className="font-medium text-aether-on-surface">{personaName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-aether-on-variant">Повод</dt>
          <dd className="font-medium text-aether-on-surface">{eventName}</dd>
        </div>
        {birthDate && (
          <div className="flex justify-between gap-4">
            <dt className="text-aether-on-variant">Дата рождения</dt>
            <dd className="font-medium text-aether-on-surface">{birthDate}</dd>
          </div>
        )}
        {interests.length > 0 && (
          <div className="flex justify-between gap-4">
            <dt className="text-aether-on-variant">Интересы</dt>
            <dd className="text-right font-medium text-aether-on-surface">
              {interests.join(', ')}
            </dd>
          </div>
        )}
        {extraPreview && (
          <div>
            <dt className="mb-1 text-aether-on-variant">Дополнительно</dt>
            <dd className="rounded-xl bg-aether-bg/50 p-3 text-aether-on-surface/90">
              {extraPreview}
            </dd>
          </div>
        )}
      </dl>
    </div>
  )
}
