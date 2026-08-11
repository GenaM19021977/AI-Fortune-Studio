import { TELEGRAM_LOGIN_STUB } from '../../config/dev'
import { MaterialIcon } from '../ui/MaterialIcon'

const FEATURES = [
  {
    icon: 'bolt',
    title: 'Мгновенная магия',
    text: 'Космические озарения за секунды.',
    tone: 'text-aether-primary bg-aether-primary/10',
  },
  {
    icon: 'palette',
    title: 'AI-арт',
    text: 'Судьба в образах, музыке и видео.',
    tone: 'text-aether-cyan-dim bg-aether-cyan/10',
  },
  {
    icon: 'psychology',
    title: 'Личные чтения',
    text: 'Подсказки под вашу энергию и стиль.',
    tone: 'text-aether-tertiary bg-aether-tertiary/10',
  },
] as const

interface TelegramLoginPageProps {
  /** Пропуск gateway (заглушка или позже — после реального входа) */
  onContinue: () => void
}

/**
 * Экран входа через Telegram (макет «вход через телегу»).
 * Пока TELEGRAM_LOGIN_STUB — кнопка только открывает приложение в mock-режиме.
 */
export function TelegramLoginPage({ onContinue }: TelegramLoginPageProps) {
  return (
    <div className="relative flex h-full min-h-full w-full flex-col items-center justify-between overflow-hidden bg-[#0F0F1A] px-5 pt-16 pb-10 text-aether-on-surface">
      <div className="mystical-glow pointer-events-none absolute inset-0 -z-10" aria-hidden />
      <div className="light-ray pointer-events-none absolute -z-10" aria-hidden />
      <div
        className="pointer-events-none absolute top-[-10%] right-[-10%] h-64 w-64 animate-pulse rounded-full bg-aether-tertiary opacity-30 blur-[80px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-[-15%] left-[-20%] h-80 w-80 rounded-full bg-aether-cyan opacity-20 blur-[80px]"
        style={{ animation: 'bounce 8s infinite' }}
        aria-hidden
      />

      <main className="z-10 flex w-full max-w-md flex-1 flex-col items-center justify-center space-y-8">
        <section className="flex flex-col items-center space-y-4 text-center">
          <div className="relative">
            <div className="glass-card gold-border ai-pulse mb-6 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full">
              <MaterialIcon
                name="auto_awesome"
                filled
                className="text-[64px] text-aether-primary"
              />
            </div>
            <div className="absolute inset-0 -z-10 rounded-full bg-aether-primary/20 blur-3xl" />
          </div>
          <h1 className="text-4xl leading-tight font-bold tracking-tight text-aether-primary sm:text-5xl">
            AI Fortune Studio
          </h1>
          <p className="max-w-[280px] text-lg text-aether-on-variant">
            Древняя мудрость встречается с будущим интеллектом.
          </p>
        </section>

        <section className="grid w-full grid-cols-1 gap-4 px-1">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="glass-card flex items-center space-x-4 rounded-xl p-4 transition-transform duration-300 hover:scale-[1.02]"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${feature.tone}`}
              >
                <MaterialIcon name={feature.icon} />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-label-caps text-aether-primary">
                  {feature.title}
                </span>
                <span className="text-xs text-aether-on-variant/80">{feature.text}</span>
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer className="z-20 flex w-full max-w-md flex-col items-center space-y-4 px-1 pt-8 pb-4">
        <button
          type="button"
          onClick={onContinue}
          className="flex h-14 w-full items-center justify-center space-x-3 rounded-full bg-gradient-to-r from-aether-primary-container to-aether-primary shadow-[0_8px_32px_rgba(212,175,55,0.3)] transition-all duration-200 active:scale-95"
        >
          <TelegramIcon className="h-6 w-6 fill-aether-on-primary" />
          <span className="text-lg font-bold text-aether-on-primary">
            Войти через Telegram
          </span>
        </button>

        {TELEGRAM_LOGIN_STUB && (
          <p className="text-center text-xs text-aether-on-variant/70">
            Заглушка для разработки — реальный вход через Telegram подключим позже
          </p>
        )}

        <div className="flex flex-col items-center space-y-2 opacity-60">
          <span className="text-xs text-aether-on-surface/80">
            Политика конфиденциальности
          </span>
          <span className="font-label-caps text-[10px] tracking-widest text-aether-on-variant uppercase">
            Версия 0.1.0 — Stellar Nexus
          </span>
        </div>
      </footer>
    </div>
  )
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.35-.49.96-.75 3.78-1.65 6.31-2.74 7.58-3.27 3.61-1.5 4.35-1.76 4.84-1.77.11 0 .35.03.51.16.13.11.17.26.19.37.02.11.02.24.01.37z" />
    </svg>
  )
}
