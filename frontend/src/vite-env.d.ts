/// <reference types="vite/client" />

/**
 * Типы переменных окружения Vite (префикс VITE_).
 * Без этого TypeScript ругается на import.meta.env.VITE_*
 */
interface ImportMetaEnv {
  /** Включает mock Telegram в браузере (по умолчанию true, если не задано) */
  readonly VITE_DEV_MOCK_TELEGRAM?: string
  /** Базовый URL API; пустой = proxy Vite на localhost:8000 */
  readonly VITE_API_URL?: string
  /** Username бота без @ — ссылка «Войти через Telegram» */
  readonly VITE_BOT_USERNAME?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
