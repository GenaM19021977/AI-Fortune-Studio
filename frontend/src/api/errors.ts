/**
 * Ошибки HTTP-клиента.
 * QuotaExceededError (429) — сигнал уйти на /premium (шаг 1.18+).
 */

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(message: string, status: number, body: unknown = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

/** Дневной лимит генераций исчерпан */
export class QuotaExceededError extends ApiError {
  constructor(message = 'Дневной лимит исчерпан', body: unknown = null) {
    super(message, 429, body)
    this.name = 'QuotaExceededError'
  }
}

export function isQuotaExceededError(error: unknown): error is QuotaExceededError {
  return error instanceof QuotaExceededError
}
