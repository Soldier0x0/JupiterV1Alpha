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
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Open Graph meta tags for social media previews */}
        <meta property="og:title" content="Welcome to Project Jupiter" />
        <meta property="og:description" content="Explore the SIEM tool and tech behind it" />
        <meta property="og:image" content="/Jupiter-removebg-preview.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://projectjupiter.in" />
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Harsha Vardhan",
              "url": "https://projectjupiter.in",
              "image": "https://projectjupiter.in/mypic.jpg",
              "jobTitle": "Cybersecurity Engineer | AI Security Architect",
              "sameAs": [
                "https://github.com/Soldier0x0",
                "https://www.linkedin.com/in/sai-harsha-vardhan/",
                "https://twitter.com/Soldier0x00"
              ]
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}