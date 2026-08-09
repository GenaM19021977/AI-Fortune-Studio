/**
 * Опрос статуса генерации, пока processing/pending.
 * Интервал по умолчанию 2с — как в IMPLEMENTATION_PLAN §9.3.
 */

export async function pollUntil<T>(
  fetchFn: () => Promise<T>,
  options: {
    intervalMs?: number
    timeoutMs?: number
    isDone: (value: T) => boolean
    signal?: AbortSignal
  },
): Promise<T> {
  const intervalMs = options.intervalMs ?? 2000
  const timeoutMs = options.timeoutMs ?? 60_000
  const started = Date.now()

  // Первый запрос сразу — не ждём первый interval
  let value = await fetchFn()
  if (options.isDone(value)) return value

  while (Date.now() - started < timeoutMs) {
    if (options.signal?.aborted) {
      throw new DOMException('Polling aborted', 'AbortError')
    }
    await sleep(intervalMs, options.signal)
    value = await fetchFn()
    if (options.isDone(value)) return value
  }

  throw new Error(`Polling timed out after ${timeoutMs}ms`)
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Polling aborted', 'AbortError'))
      return
    }
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      window.clearTimeout(timer)
      reject(new DOMException('Polling aborted', 'AbortError'))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}
