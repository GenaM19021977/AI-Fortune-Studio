/**
 * Типы Telegram Mini Apps SDK (window.Telegram.WebApp).
 *
 * Скрипт telegram-web-app.js подключается в index.html.
 * В обычном браузере объект может отсутствовать — тогда useTelegram
 * переключается на mock из config/dev.ts.
 *
 * Описываем только те поля, которые реально используем в проекте,
 * чтобы не тащить огромный community-пакет типов на старте.
 */

/** Пользователь из initDataUnsafe.user */
export interface TelegramWebAppUser {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  photo_url?: string
}

/** Небезопасные (непроверенные подписью) данные из WebApp */
export interface TelegramWebAppInitDataUnsafe {
  user?: TelegramWebAppUser
  auth_date?: number
  hash?: string
  start_param?: string
}

/** Тактильная отдача — делает Mini App «нативнее» на телефоне */
export interface TelegramHapticFeedback {
  impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
  notificationOccurred: (type: 'error' | 'success' | 'warning') => void
  selectionChanged: () => void
}

/**
 * Главная кнопка внизу экрана Telegram.
 * На шаге 1.16 используем её как «Сгенерировать».
 */
export interface TelegramMainButton {
  text: string
  color: string
  textColor: string
  isVisible: boolean
  isActive: boolean
  isProgressVisible: boolean
  setText: (text: string) => void
  onClick: (callback: () => void) => void
  offClick: (callback: () => void) => void
  show: () => void
  hide: () => void
  enable: () => void
  disable: () => void
  showProgress: (leaveActive?: boolean) => void
  hideProgress: () => void
}

/** Системная кнопка «Назад» в шапке Telegram */
export interface TelegramBackButton {
  isVisible: boolean
  onClick: (callback: () => void) => void
  offClick: (callback: () => void) => void
  show: () => void
  hide: () => void
}

/** Основной объект Telegram.WebApp */
export interface TelegramWebApp {
  initData: string
  initDataUnsafe: TelegramWebAppInitDataUnsafe
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: Record<string, string>
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  ready: () => void
  expand: () => void
  close: () => void
  openTelegramLink: (url: string) => void
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void
  HapticFeedback?: TelegramHapticFeedback
  MainButton: TelegramMainButton
  BackButton: TelegramBackButton
}

declare global {
  interface Window {
    /** Глобальный объект Telegram Mini Apps; отсутствует вне Telegram */
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

export {}
