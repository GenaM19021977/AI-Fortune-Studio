/**
 * Иконка Material Symbols (подключена в index.html).
 * filled — заливка для активного состояния навбара.
 */
export function MaterialIcon({
  name,
  className,
  filled = false,
}: {
  name: string
  className?: string
  filled?: boolean
}) {
  return (
    <span
      className={`material-symbols-outlined ${filled ? 'filled' : ''} ${className ?? ''}`}
      aria-hidden
    >
      {name}
    </span>
  )
}
