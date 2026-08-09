import type {
  DailyFortune,
  HistoryItem,
  MeProfile,
  Paginated,
  UserSettings,
  UserSettingsUpdate,
} from '../types/api'
import { apiGet, apiPatch } from './client'

/** GET /api/v1/me/ */
export function fetchMe(): Promise<MeProfile> {
  return apiGet<MeProfile>('/api/v1/me/')
}

/** PATCH /api/v1/me/settings/ */
export function patchMeSettings(payload: UserSettingsUpdate): Promise<UserSettings> {
  return apiPatch<UserSettings>('/api/v1/me/settings/', payload)
}

/** GET /api/v1/me/history/?page= */
export function fetchHistory(page = 1): Promise<Paginated<HistoryItem>> {
  return apiGet<Paginated<HistoryItem>>('/api/v1/me/history/', { page })
}

/** GET /api/v1/daily-fortune/ — без списания квоты */
export function fetchDailyFortune(): Promise<DailyFortune> {
  return apiGet<DailyFortune>('/api/v1/daily-fortune/')
}
