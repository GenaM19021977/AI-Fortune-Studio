/**
 * Атмосферный фон: cyan-orbs + violet nebula (DESIGN.md).
 */
export function CosmicBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="cyan-glow-orb -top-20 -left-20 h-64 w-64" />
      <div className="cyan-glow-orb top-1/2 -right-32 h-96 w-96 opacity-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1A0B2E_0%,#0F0F1A_100%)] opacity-60" />
    </div>
  )
}
