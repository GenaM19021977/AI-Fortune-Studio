/**
 * Конфиг локальной разработки фронтенда (шаг 0.6).
 *
 * Зачем отдельный файл:
 * - в браузере на localhost нет Telegram WebApp → нужен mock;
 * - флаги читаем из Vite env (VITE_*), чтобы не хардкодить поведение;
 * - mock-пользователь совпадает с идеей ENABLE_DEV_AUTH на бэкенде (шаг 1.4).
 */

/**
 * Включает mock Telegram, если SDK недоступен.
 * По умолчанию true — удобно для 90% работы в Chrome на localhost.
 * Отключить: VITE_DEV_MOCK_TELEGRAM=false в frontend/.env
 */
export const DEV_MOCK_TELEGRAM =
  import.meta.env.VITE_DEV_MOCK_TELEGRAM !== 'false'

/**
 * Тестовый пользователь для браузера без Telegram.
 * id=1 — тот же, что ожидается в X-Dev-User-Id на бэкенде (фаза 1).
 */
export const MOCK_TELEGRAM_USER = {
  id: 1,
  first_name: 'Тест',
  last_name: 'Разработчик',
  username: 'dev_tester',
  language_code: 'ru',
  is_premium: false,
} as const

/** Подпись режима в UI — чтобы сразу видеть, mock это или реальный Telegram */
export const DEV_MODE_LABEL = 'Dev / Mock Telegram'

/**
 * Username бота без @ (для ссылки t.me/…).
 * Задайте VITE_BOT_USERNAME в frontend/.env.
 */
export const BOT_USERNAME = (
  import.meta.env.VITE_BOT_USERNAME || 'ai_fortune_studio_bot'
).replace(/^@/, '')

export const BOT_OPEN_URL = `https://t.me/${BOT_USERNAME}`

/**
 * Заглушка экрана «Войти через Telegram».
 * true — кнопка только пропускает в приложение (без t.me / initData).
 * Выключить только по явному распоряжению: false + реальный вход через бота.
 */
export const TELEGRAM_LOGIN_STUB = true

/** sessionStorage: пользователь прошёл gateway в этой вкладке */
export const GATEWAY_STORAGE_KEY = 'afs_gateway_done'
