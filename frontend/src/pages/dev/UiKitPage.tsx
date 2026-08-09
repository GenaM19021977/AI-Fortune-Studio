import { useState } from 'react'
import { Link } from 'react-router-dom'

import { AppShell } from '../../components/layout'
import { Button, Card, Chip, Skeleton } from '../../components/ui'

const CATEGORIES = ['Все', 'Мистика', 'Юмор', 'История', 'Мудрецы'] as const

/**
 * Временная витрина ui-компонентов (шаг 1.11).
 * Удаляется на шаге 4.4 вместе с маршрутом /dev/ui.
 */
export function UiKitPage() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('Все')

  return (
    <AppShell showNav={false}>
      <div className="space-y-8 px-4 py-8 pb-16">
        <header>
          <Link
            to="/"
            className="text-sm text-purple-300/70 hover:text-purple-200"
          >
            ← На главную
          </Link>
          <h1 className="gold-text mt-3 font-fortune-display text-2xl font-bold tracking-wide">
            UI Kit
          </h1>
          <p className="mt-1 text-sm text-purple-200/70">
            Токены §9.1 · Button · Chip · Card · Skeleton · Layout
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-purple-300/60">
            Tokens
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {(
              [
                ['bg', 'bg-fortune-bg'],
                ['surface', 'bg-fortune-surface'],
                ['card', 'bg-fortune-card'],
                ['gold', 'bg-fortune-gold'],
                ['purple', 'bg-fortune-purple'],
                ['accent', 'bg-fortune-accent'],
              ] as const
            ).map(([label, swatch]) => (
              <div key={label} className="text-center">
                <div
                  className={`mx-auto h-12 w-full rounded-xl border border-white/10 ${swatch}`}
                />
                <p className="mt-1 text-[10px] text-purple-300/70">{label}</p>
              </div>
            ))}
          </div>
          <p className="font-fortune-display text-lg text-purple-100">
            Display: Georgia / serif
          </p>
          <p className="font-fortune-ui text-sm text-purple-200/80">
            UI: system-ui
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-purple-300/60">
            Button
          </h2>
          <div className="flex flex-col gap-2">
            <Button fullWidth>Primary — Сгенерировать</Button>
            <Button variant="secondary" fullWidth>
              Secondary — Premium
            </Button>
            <Button variant="outline" fullWidth>
              Outline
            </Button>
            <Button variant="ghost" fullWidth>
              Ghost
            </Button>
            <Button disabled fullWidth>
              Disabled
            </Button>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-purple-300/60">
            Chip
          </h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((name) => (
              <Chip
                key={name}
                selected={category === name}
                onClick={() => setCategory(name)}
              >
                {name}
              </Chip>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-purple-300/60">
            Card
          </h2>
          <Card>
            <p className="text-sm text-purple-100">Обычная карточка</p>
            <p className="mt-1 text-xs text-purple-300/60">border + fortune-card</p>
          </Card>
          <Card glow>
            <p className="gold-text font-fortune-display text-lg font-bold">
              Card + glow
            </p>
            <p className="mt-1 text-sm text-purple-200/80">
              Предсказание дня · Бабка с лавочки
            </p>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-purple-300/60">
            Skeleton
          </h2>
          <Card>
            <div className="flex items-center gap-3">
              <Skeleton circle className="h-12 w-12 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="mt-4 h-24 w-full" />
          </Card>
        </section>
      </div>
    </AppShell>
  )
}
