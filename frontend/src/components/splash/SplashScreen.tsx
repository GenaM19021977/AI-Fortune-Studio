import { MaterialIcon } from '../ui/MaterialIcon'

import { SplashParticles } from './SplashParticles'

export interface SplashScreenProps {
  /** 0–100 */
  progress: number
  statusText: string
}

/**
 * Экран загрузки при открытии Mini App («Открыть студию»).
 * Макет: D:\\…\\Экран загрузки\\code.html
 */
export function SplashScreen({ progress, statusText }: SplashScreenProps) {
  const clamped = Math.min(100, Math.max(0, progress))

  return (
    <div className="relative flex h-full min-h-full w-full flex-col items-center justify-center overflow-hidden bg-[#0F0F1A] text-aether-on-surface">
      {/* Atmospheric layers */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1A0B2E_0%,#0F0F1A_100%)]" />
        <div className="neon-cyan-glow absolute top-[-50px] left-[-50px] h-[300px] w-[300px] rounded-full" />
        <div
          className="absolute right-[-100px] bottom-[-100px] h-[400px] w-[400px] rounded-full opacity-10 blur-[80px]"
          style={{ background: '#D4AF37' }}
        />
        <SplashParticles />
      </div>

      <main className="relative z-10 flex h-full w-full max-w-md flex-col items-center justify-between px-5 py-16">
        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          <div className="group relative">
            <div className="absolute -inset-8 rounded-full bg-aether-primary/20 opacity-50 blur-3xl transition-opacity duration-1000 group-hover:opacity-75" />
            <div className="glass-panel animate-float relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-[32px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-aether-primary/10 to-transparent" />
              <MaterialIcon
                name="auto_awesome"
                filled
                className="mystic-glow relative text-7xl text-aether-primary"
              />
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-[28px] leading-9 font-semibold tracking-tight text-aether-primary">
              AI Fortune Studio
            </h1>
            <p className="font-label-caps tracking-[0.2em] text-aether-on-variant/60">
              Unlocking Destiny
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col items-center space-y-4">
          <div className="glass-panel h-1.5 w-full overflow-hidden rounded-full p-px">
            <div
              className="progress-bar-fill h-full rounded-full bg-gradient-to-r from-aether-primary-container via-aether-primary to-[#ffe088]"
              style={{ width: `${clamped}%` }}
            />
          </div>

          <div className="flex items-center gap-2">
            <MaterialIcon
              name="magic_button"
              className="animate-pulse text-[14px] text-aether-primary/80"
            />
            <p className="font-label-caps text-aether-on-variant/80">{statusText}</p>
          </div>

          <div className="pt-4">
            <span className="text-xs text-aether-on-variant/30">v0.1.0-mystic</span>
          </div>
        </div>
      </main>
    </div>
  )
}
