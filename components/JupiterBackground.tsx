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
      <div className="fixed top-20 left-20 w-24 h-24 z-10 pointer-events-none opacity-80">
        <div className="relative w-full h-full">
          {/* Jupiter surface with realistic colors and patterns */}
          <div 
            className="w-full h-full rounded-full animate-rotate-slow shadow-2xl"
            style={{
              background: `
                radial-gradient(ellipse at 30% 30%, #f4c2a1 0%, #e8a976 25%, #d4885a 50%, #b8683a 75%, #8b4513 100%)
              `,
              boxShadow: `
                inset -8px -8px 16px rgba(139, 69, 19, 0.8),
                inset 8px 8px 16px rgba(244, 194, 161, 0.3),
                0 0 30px rgba(237, 118, 17, 0.4)
              `
            }}
          >
            {/* Jupiter's Great Red Spot */}
            <div 
              className="absolute top-1/3 right-1/4 w-3 h-2 rounded-full opacity-80"
              style={{
                background: 'radial-gradient(ellipse, #d2691e 0%, #8b4513 70%)',
                transform: 'rotate(-15deg)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Simple grid overlay */}
      <div className="fixed inset-0 z-1 pointer-events-none opacity-20 bg-space-grid" />
    </>
  )
}