import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { fetchHistory, queryKeys } from '../../api'

/**
 * Блок «предыдущая судьба» из макета — превью последней генерации.
 */
export function PreviousFatePreview() {
  const historyQuery = useQuery({
    queryKey: queryKeys.history(1),
    queryFn: () => fetchHistory(1),
  })

  const item = historyQuery.data?.results[0]

  return (
    <div className="grid h-48 grid-cols-5 gap-4">
      <div className="glass-card group relative col-span-3 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-aether-surface-high via-[#1a0b2e] to-aether-bg opacity-90 transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-40">
          ✨
        </div>
        <div className="absolute bottom-4 left-4 z-10">
          <p className="font-label-caps text-[10px] text-aether-primary">
            Предыдущая судьба
          </p>
          {item ? (
            <Link
              to={`/result/${item.id}`}
              className="line-clamp-1 text-sm font-bold text-aether-on-surface hover:underline"
            >
              {item.title || item.persona}
            </Link>
          ) : (
            <p className="text-sm font-bold text-aether-on-variant/60">Пока пусто</p>
          )}
        </div>
      </div>
      <div className="col-span-2 flex flex-col items-center justify-center space-y-2 rounded-2xl border border-white/5 bg-aether-surface-high p-4 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-aether-cyan/20">
          <span className="material-symbols-outlined text-aether-cyan-dim">monitoring</span>
        </div>
        <div>
          <p className="text-2xl font-semibold text-aether-primary">
            {historyQuery.data ? Math.min(99, 60 + historyQuery.data.count) : '—'}%
          </p>
          <p className="font-label-caps text-[10px] text-aether-on-variant">Синхрон</p>
        </div>
      </div>
    </div>
  )
}
