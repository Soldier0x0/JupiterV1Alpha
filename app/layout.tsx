import type { Metadata } from 'next'
import { Inter, Orbitron, Rajdhani, Audiowide } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' })
const rajdhani = Rajdhani({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rajdhani' 
})
const audiowide = Audiowide({ 
  subsets: ['latin'], 
  weight: ['400'],
  variable: '--font-audiowide' 
})

export const metadata: Metadata = {
  title: 'Project Jupiter - Orbit-Scale Security Visibility | Harsha Vardhan',
  description: 'Next-generation AI-powered SIEM platform with orbit-scale security visibility. Real-time detection and analytics designed for defenders of tomorrow.',
  keywords: 'SIEM, Cybersecurity, AI Analytics, Threat Detection, Project Jupiter, Harsha Vardhan, Security Platform, Real-time Detection',
  authors: [{ name: 'Harsha Vardhan', url: 'https://projectjupiter.in' }],
  creator: 'Harsha Vardhan',
  openGraph: {
    title: 'Project Jupiter - Orbit-Scale Security Visibility',
    description: 'Next-generation AI-powered SIEM platform with orbit-scale security visibility. Real-time detection and analytics designed for defenders of tomorrow.',
    url: 'https://projectjupiter.in',
    siteName: 'Project Jupiter',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Project Jupiter - Orbit-Scale Security Visibility',
    description: 'Next-generation AI-powered SIEM platform with orbit-scale security visibility.',
    creator: '@Soldier0x00',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${orbitron.variable} ${rajdhani.variable} ${audiowide.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}