import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Project Jupiter - Next-Gen SIEM Platform | Harsha Vardhan',
  description: 'An End-to-End Security Information and Event Management (SIEM) system built with cutting-edge technologies. Developed by Harsha Vardhan using AI collaboration.',
  keywords: 'SIEM, Security, Threat Intelligence, Cybersecurity, Project Jupiter, Harsha Vardhan, AI, Machine Learning',
  authors: [{ name: 'Harsha Vardhan', url: 'https://projectjupiter.in' }],
  creator: 'Harsha Vardhan',
  openGraph: {
    title: 'Project Jupiter - Next-Gen SIEM Platform',
    description: 'An End-to-End Security Information and Event Management (SIEM) system built with cutting-edge technologies.',
    url: 'https://projectjupiter.in',
    siteName: 'Project Jupiter',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Project Jupiter - Next-Gen SIEM Platform',
    description: 'An End-to-End Security Information and Event Management (SIEM) system built with cutting-edge technologies.',
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}