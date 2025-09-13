'use client'

import { useEffect, useRef } from 'react'

export const JupiterBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const jupiterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Stars animation
    const stars: Array<{
      x: number
      y: number
      size: number
      opacity: number
      twinkleSpeed: number
      twinkleOffset: number
    }> = []

    // Create stars
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinkleOffset: Math.random() * Math.PI * 2
      })
    }

    let time = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw deep space gradient
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
      )
      gradient.addColorStop(0, '#0a0a0f')
      gradient.addColorStop(0.5, '#000510')
      gradient.addColorStop(1, '#000000')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw twinkling stars
      stars.forEach((star, index) => {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 245, 255, ${star.opacity * twinkle})`
        ctx.fill()

        // Add glow effect for larger stars
        if (star.size > 1.5) {
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(0, 245, 255, ${star.opacity * twinkle * 0.1})`
          ctx.fill()
        }
      })

      // Draw orbital rings around Jupiter position
      const jupiterElement = jupiterRef.current
      if (jupiterElement) {
        const rect = jupiterElement.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2 + window.scrollX
        const centerY = rect.top + rect.height / 2 + window.scrollY
        
        if (centerX > -100 && centerX < canvas.width + 100 && centerY > -100 && centerY < canvas.height + 100) {
          // Draw orbital rings
          for (let i = 1; i <= 3; i++) {
            ctx.beginPath()
            ctx.arc(centerX, centerY, 80 + i * 20, 0, Math.PI * 2)
            ctx.strokeStyle = `rgba(237, 118, 17, ${0.1 + Math.sin(time * 0.01 + i) * 0.05})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      time += 1
      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <>
      {/* WebGL-style background canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: 'transparent' }}
      />
      
      {/* Realistic Jupiter Planet - positioned in top-left */}
      <div
        ref={jupiterRef}
        className="fixed top-20 left-20 w-32 h-32 z-10 pointer-events-none opacity-60"
      >
        <div className="relative w-full h-full">
          {/* Jupiter surface with realistic colors and patterns */}
          <div 
            className="w-full h-full rounded-full animate-rotate-slow shadow-2xl"
            style={{
              background: `
                radial-gradient(ellipse at 30% 30%, #f4c2a1 0%, #e8a976 25%, #d4885a 50%, #b8683a 75%, #8b4513 100%),
                linear-gradient(90deg, transparent 0%, rgba(139, 69, 19, 0.3) 20%, transparent 40%, rgba(139, 69, 19, 0.2) 60%, transparent 80%),
                linear-gradient(45deg, rgba(244, 194, 161, 0.6) 0%, transparent 25%, rgba(212, 136, 90, 0.4) 50%, transparent 75%)
              `,
              boxShadow: `
                inset -20px -20px 40px rgba(139, 69, 19, 0.8),
                inset 20px 20px 40px rgba(244, 194, 161, 0.3),
                0 0 60px rgba(237, 118, 17, 0.4)
              `
            }}
          >
            {/* Jupiter's Great Red Spot */}
            <div 
              className="absolute top-1/3 right-1/4 w-6 h-4 rounded-full opacity-80"
              style={{
                background: 'radial-gradient(ellipse, #d2691e 0%, #8b4513 70%, #654321 100%)',
                transform: 'rotate(-15deg)'
              }}
            />
            
            {/* Jupiter's bands */}
            <div className="absolute inset-0 rounded-full opacity-40">
              <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-900 to-transparent" />
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-800 to-transparent" />
              <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-900 to-transparent" />
            </div>
          </div>
          
          {/* Jupiter's glow */}
          <div 
            className="absolute inset-0 rounded-full animate-pulse-slow"
            style={{
              background: 'radial-gradient(circle, rgba(237, 118, 17, 0.3) 0%, rgba(237, 118, 17, 0.1) 40%, transparent 70%)',
              transform: 'scale(1.3)'
            }}
          />
        </div>
      </div>

      {/* Cyber grid overlay */}
      <div className="fixed inset-0 z-1 pointer-events-none cyber-grid-overlay opacity-30" />
      
      {/* Floating particles */}
      <div className="fixed inset-0 z-1 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-neon-cyan rounded-full animate-float-slow opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
    </>
  )
}