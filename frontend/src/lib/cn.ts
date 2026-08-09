/**
 * Склеивает className-фрагменты, отбрасывая falsy.
 * Без clsx/tailwind-merge — достаточно для ui-кит на старте.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
