import { cn } from '../../lib/cn'

import { PREMIUM_PLANS, type PremiumPlanId } from './premiumData'

interface PremiumPlanPickerProps {
  value: PremiumPlanId
  onChange: (id: PremiumPlanId) => void
}

/**
 * Выбор тарифа: месяц / год.
 */
export function PremiumPlanPicker({ value, onChange }: PremiumPlanPickerProps) {
  return (
    <section className="mb-8 space-y-3">
      <h3 className="font-label-caps tracking-widest text-aether-on-variant px-1">
        Выберите путь
      </h3>
      <div className="space-y-3">
        {PREMIUM_PLANS.map((plan) => {
          const selected = value === plan.id
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onChange(plan.id)}
              className={cn(
                'glass-card relative block w-full overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300',
                selected
                  ? 'border-aether-primary bg-aether-primary/10'
                  : 'border-white/10',
                plan.recommended && 'premium-shimmer',
              )}
            >
              {plan.badge && (
                <div className="absolute top-0 left-0 rounded-br-lg bg-aether-primary px-3 py-1 text-[10px] font-bold text-aether-on-primary">
                  {plan.badge}
                </div>
              )}
              <div
                className={cn(
                  'flex items-center justify-between',
                  plan.recommended && 'mt-2',
                )}
              >
                <div>
                  <span className="block font-bold text-aether-on-surface">
                    {plan.title}
                  </span>
                  <span
                    className={cn(
                      'text-xs',
                      plan.recommended
                        ? 'text-aether-primary'
                        : 'text-aether-on-variant',
                    )}
                  >
                    {plan.subtitle}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-2xl font-bold">{plan.price}</span>
                  <span className="block text-xs text-aether-on-variant">
                    {plan.period}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
