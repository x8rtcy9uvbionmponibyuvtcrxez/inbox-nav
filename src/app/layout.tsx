import { type Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { PerformanceMonitor } from '@/components/PerformanceMonitor'
import Header from '@/components/Header'
import ErrorBoundary from '@/components/ErrorBoundary'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Inbox Navigator - Email Inbox Management Platform',
  description: 'Manage your email inbox fleet with automated setup, domain management, and comprehensive analytics.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning={true}>
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
