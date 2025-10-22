import { type Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { PerformanceMonitor } from '@/components/PerformanceMonitor'
import ErrorBoundary from '@/components/ErrorBoundary'
import IntercomProvider from '@/components/IntercomProvider'
import IntercomLauncher from '@/components/IntercomLauncher'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
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
      { url: '/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' }
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://app.inboxnavigator.com',
    siteName: 'Inbox Navigator',
    title: 'Inbox Navigator - Email Inbox Management Platform',
    description: 'Manage your email inbox fleet with automated setup, domain management, and comprehensive analytics.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Inbox Navigator - Email Inbox Management Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@inboxnavigator',
    creator: '@inboxnavigator',
    title: 'Inbox Navigator - Email Inbox Management Platform',
    description: 'Manage your email inbox fleet with automated setup, domain management, and comprehensive analytics.',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Force rebuild to clear cache
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning={true}>
                 <IntercomProvider>
                   <ErrorBoundary>
                     {children}
                   </ErrorBoundary>
                   <Analytics />
                   <SpeedInsights />
                   <PerformanceMonitor />
                   <IntercomLauncher />
                   <ServiceWorkerRegistration />
                 </IntercomProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
