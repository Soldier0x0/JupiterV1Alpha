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

      {/* Photorealistic Jupiter with Rings */}
      <div className="fixed top-20 right-20 w-40 h-40 z-10 pointer-events-none opacity-90 hidden lg:block">
        <div className="relative w-full h-full">
          {/* Jupiter's Rings - Multiple layers for realism */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Ring 1 - Main ring */}
            <div 
              className="absolute border border-orange-300/20 rounded-full animate-spin"
              style={{ 
                width: '200px', 
                height: '200px',
                animationDuration: '25s',
                transform: 'rotateX(75deg)'
              }}
            />
            {/* Ring 2 - Outer ring */}
            <div 
              className="absolute border border-amber-400/15 rounded-full animate-spin"
              style={{ 
                width: '220px', 
                height: '220px',
                animationDuration: '35s',
                animationDirection: 'reverse',
                transform: 'rotateX(75deg)'
              }}
            />
            {/* Ring 3 - Inner ring */}
            <div 
              className="absolute border border-yellow-400/25 rounded-full animate-spin"
              style={{ 
                width: '180px', 
                height: '180px',
                animationDuration: '20s',
                transform: 'rotateX(75deg)'
              }}
            />
          </div>
          
          {/* Photorealistic Jupiter Planet */}
          <div 
            className="w-full h-full rounded-full animate-rotate-slow shadow-2xl relative overflow-hidden"
            style={{
              background: `
                radial-gradient(ellipse at 25% 25%, #f4d03f 0%, #dc7633 15%, #a04000 35%, #6c2c0a 65%, #4a1810 85%, #2c0e08 100%),
                linear-gradient(90deg, transparent 0%, rgba(220, 118, 51, 0.4) 10%, transparent 20%, rgba(160, 64, 0, 0.3) 30%, transparent 40%, rgba(220, 118, 51, 0.4) 50%, transparent 60%, rgba(160, 64, 0, 0.3) 70%, transparent 80%, rgba(220, 118, 51, 0.4) 90%, transparent 100%),
                linear-gradient(45deg, rgba(244, 208, 63, 0.6) 0%, transparent 15%, rgba(220, 118, 51, 0.4) 25%, transparent 35%, rgba(160, 64, 0, 0.3) 45%, transparent 55%, rgba(220, 118, 51, 0.4) 65%, transparent 75%, rgba(244, 208, 63, 0.6) 85%, transparent 100%)
              `,
              boxShadow: `
                inset -15px -15px 30px rgba(76, 24, 16, 0.9),
                inset 15px 15px 30px rgba(244, 208, 63, 0.4),
                inset 0px 0px 50px rgba(160, 64, 0, 0.3),
                0 0 60px rgba(220, 118, 51, 0.5),
                0 0 100px rgba(244, 208, 63, 0.2)
              `,
              animationDuration: '40s'
            }}
          >
            {/* Jupiter's Great Red Spot - More realistic */}
            <div 
              className="absolute opacity-90"
              style={{
                top: '35%',
                right: '20%',
                width: '25px',
                height: '18px',
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, #dc2626 0%, #991b1b 30%, #7f1d1d 60%, #450a0a 100%)',
                transform: 'rotate(-20deg)',
                boxShadow: 'inset -3px -2px 8px rgba(69, 10, 10, 0.8), inset 2px 2px 6px rgba(220, 38, 38, 0.4)'
              }}
            />
            
            {/* Jupiter's atmospheric bands - More detailed */}
            <div className="absolute inset-0 rounded-full opacity-60">
              <div className="absolute top-[15%] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-800/80 to-transparent" />
              <div className="absolute top-[25%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-700/60 to-transparent" />
              <div className="absolute top-[45%] left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-orange-900/90 to-transparent" />
              <div className="absolute top-[60%] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-800/70 to-transparent" />
              <div className="absolute top-[75%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-800/80 to-transparent" />
              <div className="absolute top-[85%] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-900/60 to-transparent" />
            </div>
            
            {/* Atmospheric swirls and storms */}
            <div className="absolute inset-0 rounded-full opacity-40">
              <div 
                className="absolute w-3 h-2 rounded-full bg-red-800/80"
                style={{ top: '25%', left: '60%', transform: 'rotate(45deg)' }}
              />
              <div 
                className="absolute w-2 h-1 rounded-full bg-orange-700/60"
                style={{ top: '55%', left: '30%', transform: 'rotate(-30deg)' }}
              />
              <div 
                className="absolute w-4 h-1 rounded-full bg-yellow-800/50"
                style={{ top: '70%', left: '70%', transform: 'rotate(60deg)' }}
              />
            </div>
          </div>
          
          {/* Jupiter's atmospheric glow */}
          <div 
            className="absolute inset-0 rounded-full animate-pulse-slow pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(244, 208, 63, 0.3) 0%, rgba(220, 118, 51, 0.2) 40%, rgba(160, 64, 0, 0.1) 70%, transparent 100%)',
              transform: 'scale(1.4)',
              animationDuration: '6s'
            }}
          />
          
          {/* Additional ring particles for realism */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-orange-300 rounded-full opacity-40"
              style={{
                left: `${45 + Math.cos(i * 45 * Math.PI / 180) * 85}px`,
                top: `${45 + Math.sin(i * 45 * Math.PI / 180) * 85 * 0.2}px`,
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
        </div>
      </div>
    </>
  )
}