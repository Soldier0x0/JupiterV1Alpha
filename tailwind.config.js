/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'orbitron': ['Orbitron', 'monospace'],
        'rajdhani': ['Rajdhani', 'sans-serif'],
        'audiowide': ['Audiowide', 'cursive'],
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        // Deep space theme
        space: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // Jupiter colors
        jupiter: {
          50: '#fef7ed',
          100: '#fdedd5',
          200: '#fad7aa',
          300: '#f6bb75',
          400: '#f19537',
          500: '#ed7611',
          600: '#de5d07',
          700: '#b84608',
          800: '#93380e',
          900: '#772f0f',
          950: '#411505',
        },
        // Cyberpunk neon colors
        neon: {
          cyan: '#00f5ff',
          pink: '#ff10f0',
          purple: '#bf00ff',
          orange: '#ff8500',
          green: '#39ff14',
          blue: '#1b03a3',
        },
        // Dark space backgrounds
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
          void: '#000000',
          deep: '#0a0a0f',
          cosmos: '#0d1117',
        }
      },
      backgroundImage: {
        'jupiter-gradient': 'linear-gradient(135deg, #ed7611 0%, #f19537 25%, #f6bb75 50%, #fad7aa 75%, #fdedd5 100%)',
        'space-gradient': 'linear-gradient(135deg, #000000 0%, #0a0a0f 25%, #0d1117 50%, #1e293b 75%, #334155 100%)',
        'neon-gradient': 'linear-gradient(135deg, #00f5ff 0%, #bf00ff 25%, #ff10f0 50%, #ff8500 75%, #39ff14 100%)',
        'cyber-grid': "radial-gradient(circle at 1px 1px, rgba(0,245,255,0.3) 1px, transparent 0)",
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-slow': 'glow 3s ease-in-out infinite alternate',
        'orbit': 'orbit 20s linear infinite',
        'rotate-slow': 'rotate-slow 30s linear infinite',
        'twinkle': 'twinkle 2s ease-in-out infinite alternate',
        'slide-up': 'slide-up 0.8s ease-out',
        'fade-in': 'fade-in 1s ease-out',
        'cyber-pulse': 'cyber-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-30px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 245, 255, 0.5)' },
          '100%': { boxShadow: '0 0 40px rgba(0, 245, 255, 0.8)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(100px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(100px) rotate(-360deg)' },
        },
        'rotate-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        twinkle: {
          '0%': { opacity: 0.3, transform: 'scale(1)' },
          '100%': { opacity: 1, transform: 'scale(1.2)' },
        },
        'slide-up': {
          '0%': { opacity: 0, transform: 'translateY(50px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        'cyber-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 245, 255, 0.5)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 245, 255, 0.8), 0 0 60px rgba(191, 0, 255, 0.3)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundSize: {
        'grid': '50px 50px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}