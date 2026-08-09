/**
 * Единственная точка интеграции с Telegram Mini Apps SDK.
 *
 * Правила:
 * - не обращаться к window.Telegram напрямую из компонентов — только через этот хук;
 * - в браузере без Telegram — мягкая деградация в mock (config/dev.ts);
 * - ready() + expand() вызываем один раз при монтировании.
 *
 * Шаг 0.6 DEVELOPMENT_GUIDE.md.
 * Шаг 0.9: на телефоне приложение открывается через HTTPS-туннель
 * (cloudflared/ngrok → Vite). Тогда isTelegram=true и initData заполнен —
 * это уже не mock, а реальный WebApp внутри клиента Telegram.
 */

import { useEffect, useMemo } from 'react'

import { DEV_MOCK_TELEGRAM, MOCK_TELEGRAM_USER } from '../config/dev'
import type { TelegramWebApp, TelegramWebAppUser } from '../types/telegram'

/** Тип тактильной отдачи для удобного вызова из UI */
export type HapticType = 'light' | 'success' | 'error'

/** Публичный контракт хука — то, что видят страницы и компоненты */
export interface UseTelegramResult {
  /** Настоящий WebApp или null в mock-режиме */
  webApp: TelegramWebApp | null
  /** Пользователь Telegram (реальный или mock) */
  user: TelegramWebAppUser | null
  /** Имя для приветствия */
  userName: string
  /** Строка initData для Authorization: tma … (пустая в mock) */
  initData: string
  /** true, если открыто внутри Telegram-клиента */
  isTelegram: boolean
  /** true, если используем mock из config/dev.ts */
  isMock: boolean
  /** Тактильная отдача; в браузере — no-op */
  haptic: (type?: HapticType) => void
  /** Шеринг текста через Telegram или clipboard/Web Share API */
  shareText: (text: string) => void
}

/**
 * Есть ли живой Telegram.WebApp в текущем окружении.
 * platform === 'unknown' иногда бывает в desktop-preview — считаем «не Telegram».
 */
function detectTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null

  const webApp = window.Telegram?.WebApp
  if (!webApp) return null

  // Без platform SDK формально есть, но это не полноценный клиент
  if (!webApp.platform || webApp.platform === 'unknown') {
    return null
  }

  return webApp
}

/**
 * Хук Telegram WebApp: инициализация SDK или mock для localhost.
 */
export function useTelegram(): UseTelegramResult {
  const webApp = useMemo(() => detectTelegramWebApp(), [])
  const isTelegram = Boolean(webApp)
  // Mock только если нет Telegram И флаг dev не выключен
  const isMock = !isTelegram && DEV_MOCK_TELEGRAM

  // Сообщаем Telegram, что Mini App готов и нужен полный экран
  useEffect(() => {
    if (!webApp) return
    webApp.ready()
    webApp.expand()
  }, [webApp])

  const user: TelegramWebAppUser | null = isTelegram
    ? (webApp?.initDataUnsafe.user ?? null)
    : isMock
      ? { ...MOCK_TELEGRAM_USER }
      : null

  const userName = user?.first_name || (isMock ? MOCK_TELEGRAM_USER.first_name : 'друг')
  const initData = isTelegram ? (webApp?.initData ?? '') : ''

  /**
   * HapticFeedback есть только в Telegram на мобильных.
   * В браузере молча выходим — иначе упадёт UI при кликах.
   */
  const haptic = (type: HapticType = 'light') => {
    const hapticApi = webApp?.HapticFeedback
    if (!hapticApi) return

    if (type === 'success') {
      hapticApi.notificationOccurred('success')
      return
    }
    if (type === 'error') {
      hapticApi.notificationOccurred('error')
      return
    }
    hapticApi.impactOccurred('light')
  }

  /**
   * Шеринг результата генерации.
   * В Telegram — openTelegramLink; иначе — Web Share API или clipboard.
   */
  const shareText = (text: string) => {
    const encoded = encodeURIComponent(text)
    // Ссылку на бота подставим реальную после шага 0.7; пока заглушка
    const botUrl = encodeURIComponent('https://t.me/ai_fortune_studio_bot')
    const shareUrl = `https://t.me/share/url?url=${botUrl}&text=${encoded}`

    if (webApp) {
      webApp.openTelegramLink(shareUrl)
      return
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      void navigator.share({ text }).catch(() => {
        void navigator.clipboard?.writeText(text)
      })
      return
    }

    void navigator.clipboard?.writeText(text)
  }

  return {
    webApp,
    user,
    userName,
    initData,
    isTelegram,
    isMock,
    haptic,
    shareText,
  }
}
