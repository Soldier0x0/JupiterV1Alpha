/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      colors: {
        // Professional brand colors
        brand: {
          50: '#fef7ed',
          100: '#fdedd3',
          200: '#fbd6a5',
          300: '#f8b76d',
          400: '#f59032',
          500: '#f2720a', // Primary brand color
          600: '#e35d00',
          700: '#bc4502',
          800: '#963708',
          900: '#7a300a',
          950: '#421604',
        },
        // Enhanced slate palette
        slate: {
          850: '#1a202c',
          925: '#0f1419',
          950: '#020617',
        },
        // Professional accent colors
        accent: {
          orange: {
            400: '#fb923c',
            500: '#f97316',
            600: '#ea580c',
          },
          red: {
            400: '#f87171',
            500: '#ef4444',
            600: '#dc2626',
          },
          blue: {
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
          },
          emerald: {
            400: '#34d399',
            500: '#10b981',
            600: '#059669',
          },
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'glow-orange': '0 0 20px rgba(249, 115, 22, 0.15)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.15)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.15)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.15)',
        'professional': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'card': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideInUp: {
          'from': { transform: 'translateY(20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          'from': { transform: 'translateX(20px)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          'from': { transform: 'scale(0.95)', opacity: '0' },
          'to': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        glow: {
          'from': { boxShadow: '0 0 20px rgba(249, 115, 22, 0.1)' },
          'to': { boxShadow: '0 0 30px rgba(249, 115, 22, 0.2)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-professional': 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#cbd5e1', // slate-300
            h1: {
              color: '#f1f5f9', // slate-100
            },
            h2: {
              color: '#f1f5f9', // slate-100
            },
            h3: {
              color: '#f1f5f9', // slate-100
            },
            h4: {
              color: '#f1f5f9', // slate-100
            },
            strong: {
              color: '#f1f5f9', // slate-100
            },
            code: {
              color: '#f1f5f9', // slate-100
            },
            pre: {
              backgroundColor: '#1e293b', // slate-800
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}