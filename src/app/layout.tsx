import { type Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { PerformanceMonitor } from '@/components/PerformanceMonitor'
import Header from '@/components/Header'
import ErrorBoundary from '@/components/ErrorBoundary'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  display: 'swap',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Inbox Navigator - Email Inbox Management Platform',
  description: 'Manage your email inbox fleet with automated setup, domain management, and comprehensive analytics.',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/favicon.ico', sizes: '180x180', type: 'image/x-icon' }
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning={true}>
          <ErrorBoundary>
            <Header />
            {children}
          </ErrorBoundary>
          <Analytics />
          <SpeedInsights />
          <PerformanceMonitor />
        </body>
      </html>
    </ClerkProvider>
  )
}
