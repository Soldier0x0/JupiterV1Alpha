'use client'

import { useEffect, useRef } from 'react'

export const JupiterBackground = () => {
  return (
    <>
      {/* Simplified space background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Deep space gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, #0d1117 0%, #020617 50%, #000411 100%)'
          }}
        />
        
        {/* Static stars */}
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-60 animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
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