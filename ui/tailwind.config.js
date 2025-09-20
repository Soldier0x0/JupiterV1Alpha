/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        zinc: {
          950: '#070707',
          800: '#27272a',
        },
        teal: {
          DEFAULT: '#22d3ee',
        },
        gradientStart: '#0b0b0b',
        gradientEnd: '#27272a',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        card: '0 4px 6px rgba(0, 0, 0, 0.1)',
        hover: '0 8px 16px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};
