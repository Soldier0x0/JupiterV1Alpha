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
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};
