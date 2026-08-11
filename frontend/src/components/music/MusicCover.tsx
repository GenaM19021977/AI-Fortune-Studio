/**
 * Обложка трека (Song Identity).
 */
export function MusicCover({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <section className="mt-4 flex flex-col items-center gap-2 text-center">
      <div className="group relative">
        <div className="absolute inset-0 rounded-full bg-aether-primary/20 opacity-50 blur-2xl transition-opacity group-hover:opacity-80" />
        <div className="glass-panel-featured relative z-10 h-48 w-48 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-aether-bg to-cyan-950" />
          <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-80">
            🎵
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      </div>
      <div className="mt-4">
        <h2 className="text-[28px] leading-9 font-semibold text-aether-on-surface">
          {title}
        </h2>
        <p className="font-label-caps mt-1 tracking-[0.2em] text-aether-primary">
          {subtitle}
        </p>
      </div>
    </section>
  )
}
