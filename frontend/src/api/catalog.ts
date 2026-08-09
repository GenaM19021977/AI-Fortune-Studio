import type { ContentMode, EventType, Persona } from '../types/api'
import { apiGet } from './client'

/** GET /api/v1/modes/ — публичный каталог режимов */
export function fetchModes(): Promise<ContentMode[]> {
  return apiGet<ContentMode[]>('/api/v1/modes/')
}

/** GET /api/v1/personas/?category= */
export function fetchPersonas(category?: string): Promise<Persona[]> {
  return apiGet<Persona[]>('/api/v1/personas/', category ? { category } : undefined)
}

/** GET /api/v1/events/ */
export function fetchEvents(): Promise<EventType[]> {
  return apiGet<EventType[]>('/api/v1/events/')
}

/** GET /api/v1/seasonal/ — активные сезонные поводы */
export function fetchSeasonal(): Promise<EventType[]> {
  return apiGet<EventType[]>('/api/v1/seasonal/')
}
