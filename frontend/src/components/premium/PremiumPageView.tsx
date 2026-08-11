import { useState } from 'react'

import { useTelegram } from '../../hooks/useTelegram'

import { PremiumHero } from './PremiumHero'
import { PremiumPerks } from './PremiumPerks'
import { PremiumPlanPicker } from './PremiumPlanPicker'
import { PremiumTierCompare } from './PremiumTierCompare'
import { PremiumTopBar } from './PremiumTopBar'
import { PremiumUnlockBar } from './PremiumUnlockBar'
import { PremiumVisualAnchor } from './PremiumVisualAnchor'
import type { PremiumPlanId } from './premiumData'

/**
 * Экран Premium (макет «Премиум доступ»).
 * Оплата — заглушка до отдельного распоряжения.
 */
export function PremiumPageView() {
  const { haptic } = useTelegram()
  const [plan, setPlan] = useState<PremiumPlanId>('yearly')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const onUnlock = () => {
    if (busy) return
    haptic('success')
    setBusy(true)
    setNotice(null)
    window.setTimeout(() => {
      setBusy(false)
      setNotice(
        plan === 'yearly'
          ? 'Оплата пока заглушка. Годовой тариф выберем, когда подключим Stars.'
          : 'Оплата пока заглушка. Месячный тариф выберем, когда подключим Stars.',
      )
    }, 900)
  }

  return (
    <div className="relative flex min-h-full flex-col">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="absolute top-[10%] left-[-20%] h-96 w-96 rounded-full bg-aether-tertiary/10 blur-[120px]" />
        <div className="absolute right-[-20%] bottom-[20%] h-96 w-96 rounded-full bg-aether-cyan/10 blur-[120px]" />
      </div>

      <PremiumTopBar />

      <main className="relative z-10 mx-auto w-full max-w-md flex-1 px-5 pt-24 pb-36">
        <PremiumHero />
        <PremiumTierCompare />
        <PremiumPerks />
        <PremiumPlanPicker
          value={plan}
          onChange={(id) => {
            haptic('light')
            setPlan(id)
          }}
        />
        <PremiumVisualAnchor />

        {notice && (
          <p
            role="status"
            className="glass-card rounded-xl px-4 py-3 text-center text-sm text-aether-on-variant"
          >
            {notice}
          </p>
        )}
      </main>

      <PremiumUnlockBar onUnlock={onUnlock} busy={busy} />
    </div>
  )
}
