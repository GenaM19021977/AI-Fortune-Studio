import { useCallback, useState } from 'react'

import { GATEWAY_STORAGE_KEY } from '../config/dev'
import { useTelegram } from './useTelegram'

/**
 * Нужен ли экран «Войти через Telegram».
 * Внутри Telegram — нет; после кнопки входа (сейчас заглушка) — нет до закрытия вкладки.
 */
export function useAuthGateway() {
  const { isTelegram } = useTelegram()

  const [passed, setPassed] = useState(() => {
    if (typeof sessionStorage === 'undefined') return false
    return sessionStorage.getItem(GATEWAY_STORAGE_KEY) === '1'
  })

  const continueFromGateway = useCallback(() => {
    try {
      sessionStorage.setItem(GATEWAY_STORAGE_KEY, '1')
    } catch {
      /* private mode */
    }
    setPassed(true)
  }, [])

  const showGateway = !isTelegram && !passed

  return { showGateway, continueFromGateway, isTelegram }
}
