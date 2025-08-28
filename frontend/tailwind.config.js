/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./frontend/src/**/*.{ts,tsx,js,jsx,css}"],
  theme: {
    container: { center: true, padding: "16px", screens: { "2xl": "1200px" } },
    extend: {
      fontFamily: {
        sans: ["Inter","system-ui","Segoe UI","Roboto","Helvetica","Arial","sans-serif"],
        mono: ["JetBrains Mono","ui-monospace","SFMono-Regular","monospace"]
      },
      colors: {
        bg: "#0b1016",
        panel: "#11161d",
        card: "#151b23",
        text: "#e7edf6",
        muted: "#9aa3b2",
        brand: { DEFAULT: "#1ea8ff" }
      },
      borderRadius: { xl: "1rem", "2xl": "1.25rem" },
      boxShadow: { soft: "0 4px 24px rgba(0,0,0,.12)" }
    }
  },
  plugins: [require("@tailwindcss/typography")],
}