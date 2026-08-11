import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { fetchEvents, queryKeys } from '../../api'
import { useCreateWizardStore } from '../../store/createWizard'
import { useTelegram } from '../../hooks/useTelegram'
import { cn } from '../../lib/cn'
import { MaterialIcon } from '../ui/MaterialIcon'
import { Skeleton } from '../ui/Skeleton'

const INTEREST_TAGS = [
  'Мистика',
  'Юмор',
  'История',
  'Мудрость',
  'Любовь',
  'Карьера',
] as const

const POLARITY_OPTIONS = [
  { id: 'masculine' as const, label: 'Мужской' },
  { id: 'feminine' as const, label: 'Женский' },
]

/**
 * Шаг 1 — данные (макет «Экран создания» / Fate Manifest).
 */
export function StepData() {
  const { userName, haptic } = useTelegram()
  const eventsQuery = useQuery({
    queryKey: queryKeys.events,
    queryFn: fetchEvents,
  })

  const name = useCreateWizardStore((s) => s.name)
  const birthDate = useCreateWizardStore((s) => s.birthDate)
  const event = useCreateWizardStore((s) => s.event)
  const extra = useCreateWizardStore((s) => s.extra)
  const polarity = useCreateWizardStore((s) => s.polarity)
  const interests = useCreateWizardStore((s) => s.interests)
  const partnerName = useCreateWizardStore((s) => s.partnerName)
  const contentMode = useCreateWizardStore((s) => s.contentMode)

  const setName = useCreateWizardStore((s) => s.setName)
  const setBirthDate = useCreateWizardStore((s) => s.setBirthDate)
  const setEvent = useCreateWizardStore((s) => s.setEvent)
  const setExtra = useCreateWizardStore((s) => s.setExtra)
  const setPolarity = useCreateWizardStore((s) => s.setPolarity)
  const toggleInterest = useCreateWizardStore((s) => s.toggleInterest)
  const setPartnerName = useCreateWizardStore((s) => s.setPartnerName)

  const showPartner = contentMode === 'love'

  return (
    <div className="space-y-4">
      {/* Идентичность */}
      <div className="glass-card space-y-4 rounded-[24px] p-6">
        <div className="space-y-2">
          <label className="ml-1 font-label-caps text-aether-primary/80">
            Имя
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Как обращаться"
            className="form-input-glow w-full border-b border-[#4d4635] bg-aether-bg/40 px-0 py-3 text-lg text-aether-on-surface transition-all focus:bg-transparent"
          />
          <button
            type="button"
            className="font-label-caps text-[10px] text-aether-cyan-dim"
            onClick={() => {
              haptic('light')
              setName(userName)
            }}
          >
            Подставить имя из Telegram
          </button>
        </div>

        <div className="space-y-2">
          <label className="ml-1 font-label-caps text-aether-primary/80">
            Пол
          </label>
          <div className="flex rounded-xl bg-aether-bg/60 p-1">
            {POLARITY_OPTIONS.map((opt) => {
              const active = polarity === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    haptic('light')
                    setPolarity(active ? null : opt.id)
                  }}
                  className={cn(
                    'flex-1 rounded-lg px-2 py-2.5 font-label-caps text-[10px] transition-all',
                    active
                      ? 'bg-aether-primary-container text-aether-on-primary'
                      : 'text-aether-on-variant hover:text-aether-on-surface',
                  )}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="ml-1 font-label-caps text-aether-primary/80">
            Дата рождения
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="form-input-glow w-full border-b border-[#4d4635] bg-aether-bg/40 px-0 py-3 text-lg text-aether-on-surface transition-all focus:bg-transparent"
          />
        </div>

        {showPartner && (
          <div className="space-y-2">
            <label className="ml-1 font-label-caps text-aether-primary/80">
              Имя партнёра
            </label>
            <input
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="Для love-режима"
              className="form-input-glow w-full border-b border-[#4d4635] bg-aether-bg/40 px-0 py-3 text-lg text-aether-on-surface transition-all focus:bg-transparent"
            />
          </div>
        )}
      </div>

      {/* Повод и интересы */}
      <div className="glass-card space-y-4 rounded-[24px] p-6">
        <div className="space-y-2">
          <label className="ml-1 font-label-caps text-aether-primary/80">
            Повод
          </label>
          {eventsQuery.isLoading && <Skeleton className="h-12 w-full" />}
          {eventsQuery.data && (
            <div className="relative">
              <select
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                className="form-input-glow w-full appearance-none border-b border-[#4d4635] bg-aether-bg/40 py-3 pr-10 text-lg text-aether-on-surface focus:bg-transparent"
              >
                <option value="">Выберите повод</option>
                {eventsQuery.data.map((ev) => (
                  <option key={ev.slug} value={ev.slug}>
                    {ev.emoji} {ev.name}
                  </option>
                ))}
              </select>
              <MaterialIcon
                name="expand_more"
                className="pointer-events-none absolute top-3 right-0 text-aether-primary"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="ml-1 font-label-caps text-aether-primary/80">
            Интересы
          </label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_TAGS.map((tag) => {
              const active = interests.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    haptic('light')
                    toggleInterest(tag)
                  }}
                  className={cn(
                    'rounded-full border px-3 py-1.5 font-label-caps text-[10px] transition-colors',
                    active
                      ? 'border-aether-primary/40 bg-aether-primary/10 text-aether-primary'
                      : 'border-[#4d4635] text-aether-on-variant',
                  )}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Промпт + носитель */}
      <div className="glass-card-gold relative space-y-4 overflow-hidden rounded-[24px] p-6">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full bg-aether-primary/5 blur-3xl" />
        <div className="relative space-y-2">
          <label className="ml-1 font-label-caps text-aether-primary">
            Дополнительно
          </label>
          <textarea
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            rows={3}
            placeholder="Опишите, какую энергию хотите призвать…"
            className="w-full resize-none rounded-xl border border-[#4d4635] bg-aether-bg/60 p-4 text-base text-aether-on-surface transition-all focus:border-aether-primary focus:ring-1 focus:ring-aether-primary/20"
          />
        </div>
        <div className="relative space-y-2">
          <label className="ml-1 font-label-caps text-aether-primary">
            Формат результата
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center justify-center rounded-xl border border-aether-primary bg-aether-primary/10 p-3">
              <MaterialIcon name="auto_stories" className="mb-1 text-aether-primary" />
              <span className="font-label-caps text-[10px]">Текст</span>
            </div>
            <Link
              to="/image"
              className="flex flex-col items-center justify-center rounded-xl border border-aether-primary/30 bg-aether-primary/5 p-3 transition-transform active:scale-95"
            >
              <MaterialIcon name="image" className="mb-1 text-aether-primary" />
              <span className="font-label-caps text-[10px]">Картинка</span>
            </Link>
            <Link
              to="/music"
              className="flex flex-col items-center justify-center rounded-xl border border-aether-cyan-dim/30 bg-aether-cyan/5 p-3 transition-transform active:scale-95"
            >
              <MaterialIcon name="music_note" className="mb-1 text-aether-cyan-dim" />
              <span className="font-label-caps text-[10px]">Музыка</span>
            </Link>
          </div>
          <Link
            to="/video"
            className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 font-label-caps text-[10px] text-aether-on-variant transition-colors hover:border-aether-primary/30"
          >
            <MaterialIcon name="movie_filter" className="text-sm text-aether-primary" />
            Видео-студия
          </Link>
        </div>
      </div>
    </div>
  )
}
