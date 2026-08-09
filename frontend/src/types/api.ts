/**
 * Типы ответов Django API (шаг 1.12).
 * Поля совпадают с DRF-сериализаторами — без лишних преобразований.
 */

export interface ContentMode {
  slug: string
  name: string
  emoji: string
  description: string
  phase: number
  sort_order: number
}

export interface Persona {
  slug: string
  name: string
  title: string
  category: string
  emoji: string
  gradient: string
  voice_tone: string
  signature: string
  is_premium: boolean
  sort_order: number
}

export interface EventType {
  slug: string
  name: string
  emoji: string
  season_start: string | null
  season_end: string | null
  sort_order: number
}

export interface QuotaSnapshot {
  daily_limit: number
  used: number
  remaining: number
}

export interface UserSettings {
  locale: string
  notifications_enabled: boolean
  favorite_persona_slug: string | null
}

export interface MeProfile {
  telegram_id: number
  username: string | null
  first_name: string
  last_name: string
  language_code: string
  is_premium: boolean
  settings: UserSettings
  quota: QuotaSnapshot
  created_at: string
}

export interface HistoryItem {
  id: string
  status: string
  content_mode: string
  persona: string
  persona_slug: string
  title: string
  body: string
  share_text: string
  source: string | null
  created_at: string
}

export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface DailyFortune {
  date: string
  title: string
  body: string
  share_text: string
  persona: string
  persona_slug: string | null
  source: string
}

export interface GenerationResultPayload {
  title: string
  body: string
  share_text: string
  persona: string
  source: string
}

export interface GenerationResponse {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | string
  result: GenerationResultPayload | null
  quota_remaining: number
  detail?: string
  poll_url?: string
}

export interface GenerateRequest {
  content_mode: string
  persona_id: string
  name?: string
  event?: string
  birth_date?: string
  partner_name?: string | null
  extra?: string
}

export interface UserSettingsUpdate {
  locale?: string
  notifications_enabled?: boolean
  favorite_persona_slug?: string | null
}
