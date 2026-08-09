import type { GenerateRequest, GenerationResponse } from '../types/api'
import { apiGet, apiPost } from './client'
import { pollUntil } from './poll'

/** POST /api/v1/generate/ */
export function createGeneration(payload: GenerateRequest): Promise<GenerationResponse> {
  return apiPost<GenerationResponse>('/api/v1/generate/', payload)
}

/** GET /api/v1/generate/:id/ */
export function fetchGeneration(id: string): Promise<GenerationResponse> {
  return apiGet<GenerationResponse>(`/api/v1/generate/${id}/`)
}

/**
 * Ждёт completed/failed (для медиа/фоновых job).
 * Текстовая генерация сейчас синхронная — helper нужен на фазу 2.
 */
export function pollGeneration(
  id: string,
  options?: { intervalMs?: number; timeoutMs?: number; signal?: AbortSignal },
): Promise<GenerationResponse> {
  return pollUntil(() => fetchGeneration(id), {
    intervalMs: options?.intervalMs,
    timeoutMs: options?.timeoutMs,
    signal: options?.signal,
    isDone: (gen) => gen.status === 'completed' || gen.status === 'failed',
  })
}
