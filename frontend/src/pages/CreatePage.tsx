import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { createGeneration, isQuotaExceededError } from '../api'
import {
  DevMainButton,
  PreviousFatePreview,
  ProgressDots,
  StepConfirm,
  StepData,
  StepMode,
  StepPersona,
} from '../components/create'
import { MaterialIcon } from '../components/ui'
import { useTelegram } from '../hooks/useTelegram'
import { useCreateWizardStore } from '../store/createWizard'

const STEP_TITLES: Record<number, string> = {
  1: 'Манифест судьбы',
  2: 'Выбор режима',
  3: 'Выбор персонажа',
  4: 'Подтверждение',
}

/**
 * Экран создания по макету «Экран создания» + 4 шага мастера (1.15–1.16).
 * /create/:mode — режим предвыбран; ?persona= — персонаж с карусели.
 */
export function CreatePage() {
  const navigate = useNavigate()
  const { mode } = useParams<{ mode?: string }>()
  const [searchParams] = useSearchParams()
  const personaFromQuery = searchParams.get('persona')

  const { webApp, isTelegram, haptic } = useTelegram()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const step = useCreateWizardStore((s) => s.step)
  const name = useCreateWizardStore((s) => s.name)
  const contentMode = useCreateWizardStore((s) => s.contentMode)
  const personaSlug = useCreateWizardStore((s) => s.personaSlug)
  const birthDate = useCreateWizardStore((s) => s.birthDate)
  const event = useCreateWizardStore((s) => s.event)
  const partnerName = useCreateWizardStore((s) => s.partnerName)
  const next = useCreateWizardStore((s) => s.next)
  const back = useCreateWizardStore((s) => s.back)
  const hydrateFromRoute = useCreateWizardStore((s) => s.hydrateFromRoute)
  const buildExtraPayload = useCreateWizardStore((s) => s.buildExtraPayload)

  useEffect(() => {
    hydrateFromRoute(mode, personaFromQuery)
  }, [mode, personaFromQuery, hydrateFromRoute])

  const canProceed = useMemo(() => {
    if (step === 1) return name.trim().length > 0
    if (step === 2) return Boolean(contentMode)
    if (step === 3) return Boolean(personaSlug)
    if (step === 4) return Boolean(contentMode && personaSlug && name.trim())
    return false
  }, [step, name, contentMode, personaSlug])

  const primaryLabel =
    step < 4 ? 'Далее' : '✨ Сгенерировать'

  const runGenerate = async () => {
    if (!contentMode || !personaSlug || submitting) return
    setSubmitting(true)
    setError(null)
    haptic('success')

    try {
      const result = await createGeneration({
        content_mode: contentMode,
        persona_id: personaSlug,
        name: name.trim(),
        event: event || undefined,
        birth_date: birthDate || undefined,
        partner_name: partnerName || undefined,
        extra: buildExtraPayload() || undefined,
      })
      navigate(`/result/${result.id}`, { replace: true })
    } catch (err) {
      haptic('error')
      if (isQuotaExceededError(err)) {
        navigate('/premium')
        return
      }
      setError(err instanceof Error ? err.message : 'Не удалось сгенерировать')
    } finally {
      setSubmitting(false)
    }
  }

  const onPrimary = () => {
    if (step < 4) {
      if (!canProceed) return
      haptic('light')
      next()
      return
    }
    void runGenerate()
  }

  // Telegram MainButton на финальном шаге
  useEffect(() => {
    if (!isTelegram || !webApp) return
    const btn = webApp.MainButton

    if (step !== 4) {
      btn.hide()
      return
    }

    const handler = () => {
      void runGenerate()
    }

    btn.setText('✨ Сгенерировать')
    btn.show()
    if (canProceed && !submitting) btn.enable()
    else btn.disable()
    btn.onClick(handler)

    return () => {
      btn.offClick(handler)
      btn.hide()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runGenerate замыкает актуальный store
  }, [isTelegram, webApp, step, canProceed, submitting])

  return (
    <div className="relative flex flex-1 flex-col">
      {/* Декор orbs как в макете */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="orb-blur absolute top-[-10%] left-[-10%] h-64 w-64 rounded-full bg-aether-tertiary" />
        <div className="orb-blur absolute right-[-5%] bottom-[20%] h-96 w-96 rounded-full bg-aether-cyan" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-aether-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-md items-center px-5">
          <button
            type="button"
            aria-label="Назад"
            className="mr-2 flex min-h-11 min-w-11 items-center justify-center rounded-xl text-aether-on-surface hover:bg-white/5"
            onClick={() => {
              haptic('light')
              if (step > 1) back()
              else navigate(-1)
            }}
          >
            ←
          </button>
          <MaterialIcon name="auto_awesome" className="mr-3 text-aether-primary" />
          <h1 className="text-xl font-semibold tracking-tight text-aether-primary">
            AI Fortune Studio
          </h1>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-md space-y-8 px-5 pt-6 pb-8">
        <div className="flex items-center justify-between px-1">
          <div className="flex flex-col">
            <span className="font-label-caps text-aether-on-variant/70">
              Мастер создания
            </span>
            <h2 className="text-[28px] leading-9 font-semibold text-aether-on-surface">
              {STEP_TITLES[step]}
            </h2>
          </div>
          <ProgressDots step={step} total={4} />
        </div>

        {step === 1 && <StepData />}
        {step === 2 && <StepMode />}
        {step === 3 && <StepPersona />}
        {step === 4 && <StepConfirm />}

        {error && (
          <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        {/* В браузере всегда; в Telegram на шаге 4 есть MainButton — кнопку тоже оставляем для ясности */}
        <DevMainButton
          label={primaryLabel}
          loading={submitting}
          disabled={!canProceed}
          onClick={onPrimary}
        />

        {step === 1 && <PreviousFatePreview />}
      </main>
    </div>
  )
}
