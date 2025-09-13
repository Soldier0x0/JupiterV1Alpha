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

      {/* Artistic Jupiter representation - abstract */}
      <div className="fixed top-24 right-24 w-32 h-32 z-10 pointer-events-none opacity-30 hidden lg:block">
        <div className="relative w-full h-full">
          {/* Abstract planet representation */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400/40 via-amber-500/30 to-orange-600/40 blur-sm" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-orange-500/60 via-amber-400/50 to-red-500/40 animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-1/3 right-1/4 w-4 h-3 rounded-full bg-red-600/60 animate-pulse" style={{ animationDelay: '2s' }} />
          
          {/* Orbital ring */}
          <div className="absolute -inset-8 border border-orange-400/20 rounded-full animate-spin" style={{ animationDuration: '30s' }} />
        </div>
      </div>
    </>
  )
}