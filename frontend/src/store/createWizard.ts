/**
 * Zustand-store мастера создания (шаг 1.15).
 * Черновик живёт только на клиенте до POST /generate/.
 */

import { create } from 'zustand'

export type WizardStep = 1 | 2 | 3 | 4

export type Polarity = 'masculine' | 'feminine' | null

export interface CreateWizardState {
  step: WizardStep
  name: string
  birthDate: string
  event: string
  partnerName: string
  extra: string
  polarity: Polarity
  interests: string[]
  contentMode: string | null
  personaSlug: string | null
  /** Режим пришёл с /create/:mode — шаг 2 можно пропустить */
  modeLocked: boolean

  setStep: (step: WizardStep) => void
  next: () => void
  back: () => void
  setName: (name: string) => void
  setBirthDate: (value: string) => void
  setEvent: (slug: string) => void
  setPartnerName: (value: string) => void
  setExtra: (value: string) => void
  setPolarity: (value: Polarity) => void
  toggleInterest: (tag: string) => void
  setContentMode: (slug: string) => void
  setPersonaSlug: (slug: string) => void
  hydrateFromRoute: (mode?: string, persona?: string | null) => void
  reset: () => void
  /** Собирает extra + полярность/интересы для API */
  buildExtraPayload: () => string
}

const INITIAL = {
  step: 1 as WizardStep,
  name: '',
  birthDate: '',
  event: '',
  partnerName: '',
  extra: '',
  polarity: null as Polarity,
  interests: [] as string[],
  contentMode: null as string | null,
  personaSlug: null as string | null,
  modeLocked: false,
}

const POLARITY_LABEL: Record<Exclude<Polarity, null>, string> = {
  masculine: 'мужской',
  feminine: 'женский',
}

export const useCreateWizardStore = create<CreateWizardState>((set, get) => ({
  ...INITIAL,

  setStep: (step) => set({ step }),

  next: () => {
    const { step, contentMode, modeLocked } = get()
    // Если режим уже выбран с главной — прыгаем с 1 сразу на персонажа (3)
    if (step === 1 && (modeLocked || contentMode)) {
      set({ step: 3 })
      return
    }
    if (step < 4) set({ step: (step + 1) as WizardStep })
  },

  back: () => {
    const { step, modeLocked, contentMode } = get()
    if (step === 3 && (modeLocked || contentMode)) {
      set({ step: 1 })
      return
    }
    if (step > 1) set({ step: (step - 1) as WizardStep })
  },

  setName: (name) => set({ name }),
  setBirthDate: (birthDate) => set({ birthDate }),
  setEvent: (event) => set({ event }),
  setPartnerName: (partnerName) => set({ partnerName }),
  setExtra: (extra) => set({ extra }),
  setPolarity: (polarity) => set({ polarity }),

  toggleInterest: (tag) =>
    set((state) => ({
      interests: state.interests.includes(tag)
        ? state.interests.filter((t) => t !== tag)
        : [...state.interests, tag],
    })),

  setContentMode: (slug) => set({ contentMode: slug }),
  setPersonaSlug: (slug) => set({ personaSlug: slug }),

  hydrateFromRoute: (mode, persona) => {
    set({
      ...INITIAL,
      contentMode: mode || null,
      modeLocked: Boolean(mode),
      personaSlug: persona || null,
      step: 1,
    })
  },

  reset: () => set({ ...INITIAL }),

  buildExtraPayload: () => {
    const { extra, polarity, interests } = get()
    const parts: string[] = []
    if (extra.trim()) parts.push(extra.trim())
    if (polarity) parts.push(`пол: ${POLARITY_LABEL[polarity]}`)
    if (interests.length) parts.push(`интересы: ${interests.join(', ')}`)
    return parts.join('. ').slice(0, 500)
  },
}))
