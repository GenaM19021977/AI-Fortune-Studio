/**
 * Базовый HTTP-клиент к Django API (шаг 1.12).
 *
 * - VITE_API_URL пустой → относительные `/api/...` через Vite proxy;
 * - есть initData → `Authorization: tma …`;
 * - иначе в dev mock → `X-Dev-User-Id` (ENABLE_DEV_AUTH на бэкенде).
 */

import { DEV_MOCK_TELEGRAM, MOCK_TELEGRAM_USER } from '../config/dev'
import { ApiError, QuotaExceededError } from './errors'

/** База без завершающего слэша; пустая строка = same-origin + proxy */
export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalized}`
}

/**
 * Auth-заголовки на каждый запрос.
 * Читаем Telegram.WebApp напрямую — клиент не зависит от React-хука.
 */
export function buildAuthHeaders(): Record<string, string> {
  const initData = window.Telegram?.WebApp?.initData?.trim() ?? ''
  if (initData) {
    return { Authorization: `tma ${initData}` }
  }

  // Браузер без Telegram: dev bypass, как в DEVELOPMENT_GUIDE 1.12
  if (DEV_MOCK_TELEGRAM) {
    return { 'X-Dev-User-Id': String(MOCK_TELEGRAM_USER.id) }
  }

  return {}
}

export type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  /** JSON-тело; Content-Type выставится автоматически */
  json?: unknown
  /** Query-параметры (?page=1) */
  query?: Record<string, string | number | boolean | null | undefined>
}

function withQuery(path: string, query?: ApiRequestOptions['query']): string {
  if (!query) return path
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue
    params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

function errorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>
    if (typeof record.detail === 'string') return record.detail
    if (typeof record.message === 'string') return record.message
  }
  return fallback
}

/**
 * Универсальный fetch к `/api/v1/...`.
 * Бросает ApiError / QuotaExceededError при !ok.
 */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { json, query, headers, ...rest } = options
  const url = apiUrl(withQuery(path, query))

  const mergedHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...buildAuthHeaders(),
  }

  if (headers) {
    const extra = new Headers(headers)
    extra.forEach((value, key) => {
      mergedHeaders[key] = value
    })
  }

  let body: BodyInit | undefined
  if (json !== undefined) {
    mergedHeaders['Content-Type'] = 'application/json'
    body = JSON.stringify(json)
  }

  const response = await fetch(url, {
    ...rest,
    headers: mergedHeaders,
    body,
  })

  const payload = await parseBody(response)

  if (!response.ok) {
    const message = errorMessage(payload, `HTTP ${response.status}`)
    if (response.status === 429) {
      throw new QuotaExceededError(message, payload)
    }
    throw new ApiError(message, response.status, payload)
  }

  return payload as T
}

/** GET-хелпер */
export function apiGet<T>(
  path: string,
  query?: ApiRequestOptions['query'],
): Promise<T> {
  return apiRequest<T>(path, { method: 'GET', query })
}

/** POST JSON */
export function apiPost<T>(path: string, json?: unknown): Promise<T> {
  return apiRequest<T>(path, { method: 'POST', json })
}

/** PATCH JSON */
export function apiPatch<T>(path: string, json?: unknown): Promise<T> {
  return apiRequest<T>(path, { method: 'PATCH', json })
}
