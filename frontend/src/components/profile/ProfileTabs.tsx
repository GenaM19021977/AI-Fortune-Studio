import { Link } from 'react-router-dom'

import { MaterialIcon } from '../ui/MaterialIcon'
import { Skeleton } from '../ui/Skeleton'
import { cn } from '../../lib/cn'
import type { HistoryItem } from '../../types/api'

export type ProfileTabId = 'history' | 'favorites' | 'referral'

interface ProfileTabsProps {
  active: ProfileTabId
  onChange: (tab: ProfileTabId) => void
}

const TABS: { id: ProfileTabId; label: string }[] = [
  { id: 'history', label: 'История' },
  { id: 'favorites', label: 'Избранное' },
  { id: 'referral', label: 'Рефералы' },
]

/**
 * Вкладки контента профиля.
 */
export function ProfileTabs({ active, onChange }: ProfileTabsProps) {
  return (
    <section className="border-b border-white/5">
      <div className="flex space-x-8">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'font-label-caps pb-3 transition-all',
              active === tab.id
                ? 'border-b-2 border-aether-primary text-aether-primary'
                : 'text-aether-on-variant/60',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </section>
  )
}

function formatRelativeRu(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Недавно'
  const diffMs = Date.now() - date.getTime()
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  if (days <= 0) return 'Сегодня'
  if (days === 1) return 'Вчера'
  if (days < 7) return `${days} дн. назад`
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

interface HistoryTabProps {
  items: HistoryItem[]
  loading?: boolean
}

export function ProfileHistoryTab({ items, loading }: HistoryTabProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="aspect-square rounded-2xl" />
        <Skeleton className="aspect-square rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {items.slice(0, 5).map((item) => (
        <Link
          key={item.id}
          to={`/result/${item.id}`}
          className="glass-card group relative aspect-square overflow-hidden rounded-2xl"
        >
          <div
            className="absolute inset-0 opacity-80 transition-opacity group-hover:opacity-100"
            style={{
              background:
                'radial-gradient(circle at 40% 30%, rgba(0,240,255,0.25), transparent 50%), linear-gradient(160deg, #1a0b2e, #0f0f1a)',
            }}
            aria-hidden
          />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent p-3">
            <span className="text-xs text-aether-primary">
              {formatRelativeRu(item.created_at)}
            </span>
            <p className="truncate text-xs text-aether-on-surface">
              {item.title || item.persona}
            </p>
          </div>
        </Link>
      ))}
      <Link
        to="/create"
        className="glass-card flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 p-4"
      >
        <MaterialIcon
          name="add_circle"
          className="mb-2 text-4xl text-aether-on-variant/40"
        />
        <span className="font-label-caps text-center text-[10px] text-aether-on-variant/40">
          Новое чтение
        </span>
      </Link>
    </div>
  )
}

interface FavoritesTabProps {
  favoriteTitle: string | null
  favoriteSubtitle?: string
}

export function ProfileFavoritesTab({
  favoriteTitle,
  favoriteSubtitle,
}: FavoritesTabProps) {
  if (!favoriteTitle) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center text-sm text-aether-on-variant">
        Пока нет избранного. Отметьте персонажа в галерее стилей.
        <div className="mt-4">
          <Link to="/library" className="font-label-caps text-aether-primary">
            Открыть галерею
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Link
        to="/library"
        className="glass-card gold-border flex items-center space-x-4 rounded-2xl p-4"
      >
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-aether-surface-high to-aether-bg text-3xl">
          ✨
        </div>
        <div className="min-w-0 flex-1">
          <h5 className="truncate text-lg font-bold text-aether-primary">
            {favoriteTitle}
          </h5>
          <p className="text-xs text-aether-on-variant/70">
            {favoriteSubtitle ?? 'Любимый персонаж'}
          </p>
        </div>
        <MaterialIcon name="bookmark" filled className="text-aether-primary" />
      </Link>
    </div>
  )
}

interface ReferralTabProps {
  code: string
  onCopy: () => void
}

export function ProfileReferralTab({ code, onCopy }: ReferralTabProps) {
  return (
    <div className="glass-card relative space-y-6 overflow-hidden rounded-2xl p-6">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-aether-primary/5 blur-2xl" />
      <div className="space-y-2">
        <h4 className="text-2xl font-semibold text-aether-primary">
          Подарите просветление
        </h4>
        <p className="text-aether-on-variant">
          Пригласите друзей в студию и получите 50 бесплатных кредитов за каждый
          успешный ритуал.
        </p>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-white/5 bg-aether-surface-high p-4">
        <code className="font-label-caps text-aether-cyan-dim">{code}</code>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-lg bg-aether-primary-container px-4 py-2 font-label-caps text-[10px] text-aether-on-primary transition-transform active:scale-95"
        >
          Копировать
        </button>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-aether-surface-container">
          <MaterialIcon name="group" className="text-aether-primary" />
        </div>
        <div>
          <p className="font-bold text-aether-on-surface">0 спутников</p>
          <p className="text-xs text-aether-on-variant/60">
            Реферальная программа скоро
          </p>
        </div>
      </div>
    </div>
  )
}
