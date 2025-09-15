# Project Jupiter Landing

A Next.js 14 landing page for Project Jupiter, featuring orbit-scale security visibility.

## Features

- Next.js 14, React 18, TypeScript
- Tailwind CSS with custom Jupiter/space theme
- Framer Motion animations
- Lucide React icons
- Dark mode support
- Custom fonts: Orbitron, Rajdhani, Audiowide, Inter
- Favicon support (`app/favicon.ico`)

## Getting Started

1. **Install dependencies:**
	```bash
	npm install
	```

2. **Run the development server:**
	```bash
	npm run dev
	```
	Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build for production:**
	```bash
	npm run build
	npm start
	```

## Project Structure

- `app/` - Next.js app directory (includes `favicon.ico`, global styles, layout)
- `components/` - UI components (Hero, Footer, TechStack, etc.)
- `tailwind.config.js` - Tailwind CSS configuration
- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `postcss.config.js` - PostCSS configuration

## Configuration

- **Favicon:** Set in `app/layout.tsx` via `<link rel="icon" href="/favicon.ico" />`
- **Custom fonts:** Loaded via `next/font/google` in `app/layout.tsx`
- **Theme:** Tailwind custom colors for Jupiter and space in `tailwind.config.js`
- **Image domains:** Configured in `next.config.js`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint