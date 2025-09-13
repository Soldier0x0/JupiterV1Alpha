'use client'

import { useEffect, useRef } from 'react'

export const JupiterBackground = () => {
  return (
    <>
      {/* Artistic geometric background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Base gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #020617 70%, #000000 100%)'
          }}
        />
        
        {/* Geometric shapes */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80 border border-cyan-400/10 rotate-45 animate-spin" style={{ animationDuration: '60s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-60 h-60 border border-orange-400/10 rotate-12 animate-pulse" />
        
        {/* Flowing lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1000 1000">
          <path
            d="M0,300 Q250,100 500,300 T1000,300"
            stroke="url(#gradient1)"
            strokeWidth="1"
            fill="none"
            className="animate-pulse"
          />
          <path
            d="M0,700 Q250,500 500,700 T1000,700"
            stroke="url(#gradient2)"
            strokeWidth="1"
            fill="none"
            className="animate-pulse"
            style={{ animationDelay: '1s' }}
          />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
              <stop offset="50%" stopColor="#f97316" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Minimal particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-40 animate-float-slow"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${12 + Math.random() * 8}s`
            }}
          />
        ))}
      </div>

      {/* Enhanced Photorealistic Jupiter with Rings */}
      <div className="fixed top-16 right-16 w-48 h-48 z-10 pointer-events-none opacity-80 hidden lg:block">
        <div className="relative w-full h-full">
          {/* Jupiter's Ring System - More accurate */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Main ring */}
            <div 
              className="absolute border border-orange-200/30 rounded-full animate-spin"
              style={{ 
                width: '240px', 
                height: '240px',
                animationDuration: '30s',
                transform: 'rotateX(78deg) rotateY(5deg)'
              }}
            />
            {/* Outer ring */}
            <div 
              className="absolute border border-amber-300/20 rounded-full animate-spin"
              style={{ 
                width: '260px', 
                height: '260px',
                animationDuration: '45s',
                animationDirection: 'reverse',
                transform: 'rotateX(78deg) rotateY(5deg)'
              }}
            />
            {/* Inner ring */}
            <div 
              className="absolute border border-yellow-300/40 rounded-full animate-spin"
              style={{ 
                width: '220px', 
                height: '220px',
                animationDuration: '25s',
                transform: 'rotateX(78deg) rotateY(5deg)'
              }}
            />
          </div>
          
          {/* Enhanced Photorealistic Jupiter */}
          <div 
            className="w-full h-full rounded-full animate-rotate-slow shadow-2xl relative overflow-hidden"
            style={{
              background: `
                radial-gradient(ellipse at 30% 20%, #f4d03f 0%, #e67e22 10%, #d35400 25%, #a04000 45%, #8b4513 65%, #654321 80%, #3e2723 95%),
                linear-gradient(90deg, transparent 0%, rgba(230, 126, 34, 0.3) 8%, transparent 16%, rgba(211, 84, 0, 0.4) 24%, transparent 32%, rgba(230, 126, 34, 0.3) 40%, transparent 48%, rgba(211, 84, 0, 0.4) 56%, transparent 64%, rgba(230, 126, 34, 0.3) 72%, transparent 80%, rgba(211, 84, 0, 0.4) 88%, transparent 96%),
                conic-gradient(from 0deg, rgba(244, 208, 63, 0.4) 0%, rgba(230, 126, 34, 0.3) 45%, rgba(211, 84, 0, 0.4) 90%, rgba(160, 64, 0, 0.3) 135%, rgba(139, 69, 19, 0.2) 180%, rgba(101, 67, 33, 0.3) 225%, rgba(62, 39, 35, 0.4) 270%, rgba(244, 208, 63, 0.4) 315%)
              `,
              boxShadow: `
                inset -20px -20px 40px rgba(62, 39, 35, 0.9),
                inset 20px 20px 40px rgba(244, 208, 63, 0.3),
                inset 0px 0px 60px rgba(160, 64, 0, 0.4),
                0 0 80px rgba(230, 126, 34, 0.4),
                0 0 120px rgba(244, 208, 63, 0.2)
              `,
              animationDuration: '50s'
            }}
          >
            {/* Great Red Spot - Enhanced */}
            <div 
              className="absolute opacity-95"
              style={{
                top: '38%',
                right: '22%',
                width: '32px',
                height: '24px',
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, #dc2626 0%, #b91c1c 20%, #991b1b 40%, #7f1d1d 65%, #450a0a 85%, #1f2937 100%)',
                transform: 'rotate(-18deg)',
                boxShadow: 'inset -4px -3px 12px rgba(31, 41, 55, 0.8), inset 3px 3px 8px rgba(220, 38, 38, 0.4)'
              }}
            />
            
            {/* Enhanced atmospheric bands */}
            <div className="absolute inset-0 rounded-full opacity-70">
              <div className="absolute top-[12%] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-900/90 to-transparent" />
              <div className="absolute top-[20%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-800/70 to-transparent" />
              <div className="absolute top-[30%] left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-orange-800/95 to-transparent" />
              <div className="absolute top-[42%] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-900/80 to-transparent" />
              <div className="absolute top-[55%] left-0 right-0 h-[4px] bg-gradient-to-r from-transparent via-orange-900/100 to-transparent" />
              <div className="absolute top-[68%] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-800/85 to-transparent" />
              <div className="absolute top-[78%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-800/90 to-transparent" />
              <div className="absolute top-[88%] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-900/75 to-transparent" />
            </div>
            
            {/* Storm systems and atmospheric features */}
            <div className="absolute inset-0 rounded-full opacity-50">
              <div className="absolute w-4 h-3 rounded-full bg-red-900/90" style={{ top: '28%', left: '65%', transform: 'rotate(35deg)' }} />
              <div className="absolute w-3 h-2 rounded-full bg-orange-800/80" style={{ top: '48%', left: '25%', transform: 'rotate(-25deg)' }} />
              <div className="absolute w-5 h-2 rounded-full bg-yellow-900/70" style={{ top: '65%', left: '75%', transform: 'rotate(55deg)' }} />
              <div className="absolute w-2 h-1 rounded-full bg-amber-800/60" style={{ top: '82%', left: '40%', transform: 'rotate(-45deg)' }} />
            </div>
          </div>
          
          {/* Enhanced atmospheric glow */}
          <div 
            className="absolute inset-0 rounded-full animate-pulse-slow pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(244, 208, 63, 0.25) 0%, rgba(230, 126, 34, 0.15) 30%, rgba(211, 84, 0, 0.08) 60%, transparent 85%)',
              transform: 'scale(1.6)',
              animationDuration: '8s'
            }}
          />
          
          {/* Ring particle system */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-orange-200 rounded-full opacity-50 animate-twinkle"
              style={{
                left: `${50 + Math.cos(i * 30 * Math.PI / 180) * 100}px`,
                top: `${50 + Math.sin(i * 30 * Math.PI / 180) * 100 * 0.25}px`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
    </>
  )
}