import { useEffect, useRef } from 'react'

/**
 * Золотые частицы на canvas (экран загрузки из code.html).
 * Чистим rAF и listeners при размонтировании.
 */
export function SplashParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    type Particle = {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
    }

    let particles: Particle[] = []
    let rafId = 0
    let alive = true

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const makeParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.2,
    })

    const init = () => {
      particles = Array.from({ length: 50 }, makeParticle)
    }

    const tick = () => {
      if (!alive) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        p.x += p.speedX
        p.y += p.speedY
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1
        ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
      rafId = requestAnimationFrame(tick)
    }

    resize()
    init()
    tick()
    window.addEventListener('resize', resize)

    return () => {
      alive = false
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full opacity-30"
      aria-hidden
    />
  )
}
