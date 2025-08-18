/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Clean minimal palette inspired by ChatGPT version
        cosmic: {
          black: '#0b0c10',
          dark: '#111214',
          gray: '#1a1d23',
          muted: '#2a2d35',
          border: '#374151',
        },
        jupiter: {
          primary: '#ef4444',      // Clean red
          secondary: '#22d3ee',    // Teal accent (kept for variety)  
          warning: '#f59e0b',      // Amber
          success: '#10b981',      // Emerald
          danger: '#ef4444',       // Red
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'glow': '0 0 15px rgba(34, 211, 238, 0.2)',
        'glow-red': '0 0 15px rgba(239, 68, 68, 0.2)',
      },
      animation: {
        // Only essential animations - no infinite/distracting ones
        'spin': 'spin 1s linear infinite',
      },
      keyframes: {
        // Removed float, glow, and other distracting animations
      }
    },
  },
  darkMode: 'class',
  plugins: [],
};