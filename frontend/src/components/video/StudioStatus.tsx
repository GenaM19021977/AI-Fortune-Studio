import { cn } from '../../lib/cn'
import { MaterialIcon } from '../ui/MaterialIcon'

export interface StudioJob {
  id: string
  label: string
  icon: string
  /** 0–100; null = в очереди */
  progress: number | null
}

interface StudioStatusProps {
  jobs: StudioJob[]
}

/**
 * Список статусов пайплайна студии (макет Studio Status).
 */
export function StudioStatus({ jobs }: StudioStatusProps) {
  return (
    <section className="glass-card space-y-4 rounded-[24px] p-4">
      <h3 className="font-label-caps px-1 text-aether-on-variant/60">
        Статус студии
      </h3>
      <div className="space-y-3">
        {jobs.map((job) => {
          const queued = job.progress === null
          const pct = job.progress ?? 0
          return (
            <div
              key={job.id}
              className={cn(
                'flex items-center gap-4 rounded-xl border border-white/5 bg-aether-surface-low p-3',
                queued && 'opacity-60',
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  queued ? 'bg-aether-on-variant/10' : 'bg-aether-primary/10',
                )}
              >
                <MaterialIcon
                  name={job.icon}
                  className={queued ? 'text-aether-on-variant' : 'text-aether-primary'}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-aether-on-surface">{job.label}</p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-white/5">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      queued ? 'bg-white/10' : 'bg-aether-primary',
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <span
                className={cn(
                  'font-mono text-xs',
                  queued ? 'text-aether-on-variant' : 'text-aether-primary',
                )}
              >
                {queued ? 'Очередь' : `${Math.floor(pct)}%`}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
