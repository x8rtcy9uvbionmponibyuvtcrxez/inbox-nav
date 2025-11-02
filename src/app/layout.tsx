import { type Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { PerformanceMonitor } from '@/components/PerformanceMonitor'
import PerformanceDashboard from '@/components/PerformanceDashboard'
import ErrorBoundary from '@/components/ErrorBoundary'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import IntercomProvider from '@/components/IntercomProvider'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  display: 'swap',
  subsets: ['latin'],
  preload: true,
  fallback: ['system-ui', 'arial'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  preload: true,
  fallback: ['monospace'],
})

export const metadata: Metadata = {
  title: 'Inbox Navigator - Email Inbox Management Platform',
  description: 'Manage your email inbox fleet with automated setup, domain management, and comprehensive analytics.',
  manifest: '/site.webmanifest',
  other: {
    'preload': '/fonts/inter.woff2',
    'preconnect': 'https://fonts.googleapis.com,https://clerk.com,https://api.stripe.com',
    'dns-prefetch': 'https://fonts.gstatic.com',
  },
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
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      appearance={{
        baseTheme: 'dark',
        elements: {
          // Social buttons - maintain black text for labels
          socialButtonsBlockButton: 'text-black [&>span]:text-black',
          socialButtonsBlockButtonText: 'text-black',
        },
        variables: {
          colorPrimary: '#FFFFFF',
          colorBackground: '#000000',
        },
      }}
    >
      <IntercomProvider>
        <html lang="en" suppressHydrationWarning>
          <head>
            <link rel="preload" href="/api/dashboard" as="fetch" crossOrigin="anonymous" />
            <link rel="preload" href="/dashboard" as="document" />
            <link rel="preload" href="/dashboard/products" as="document" />
            <link rel="preload" href="/dashboard/inboxes" as="document" />
            <link rel="preload" href="/dashboard/domains" as="document" />
            <link rel="dns-prefetch" href="//fonts.googleapis.com" />
            <link rel="dns-prefetch" href="//fonts.gstatic.com" />
            <link rel="dns-prefetch" href="//clerk.com" />
            <link rel="dns-prefetch" href="//api.stripe.com" />
            <link rel="dns-prefetch" href="//vercel.com" />
            <style dangerouslySetInnerHTML={{
              __html: `
                /* Critical CSS for above-the-fold content */
                .text-brand-primary { color: #ffffff; }
                .text-brand-secondary { color: #a1a1aa; }
                .bg-black { background-color: #000000; }
                .min-h-screen { min-height: 100vh; }
                .flex { display: flex; }
                .items-center { align-items: center; }
                .justify-center { justify-content: center; }
                .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
                .font-semibold { font-weight: 600; }
                .text-white { color: #ffffff; }
                .opacity-60 { opacity: 0.6; }
                .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
                .grid { display: grid; }
                .gap-6 { gap: 1.5rem; }
                .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
                .rounded-3xl { border-radius: 1.5rem; }
                .border { border-width: 1px; }
                .border-white\\/10 { border-color: rgba(255, 255, 255, 0.1); }
                .bg-white\\/\\[0\\.04\\] { background-color: rgba(255, 255, 255, 0.04); }
                .shadow-\\[0_40px_80px_-60px_rgba\\(7\\,7\\,7\\,0\\.9\\)\\] { 
                  box-shadow: 0 40px 80px -60px rgba(7, 7, 7, 0.9); 
                }
                .backdrop-blur-xl { backdrop-filter: blur(24px); }
                .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
                .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
                .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
                .font-bold { font-weight: 700; }
                .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
                .leading-relaxed { line-height: 1.625; }
                .space-y-8 > * + * { margin-top: 2rem; }
                .space-y-4 > * + * { margin-top: 1rem; }
                .space-y-6 > * + * { margin-top: 1.5rem; }
              `
            }} />
          </head>
          <body className={`${inter.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning={true}>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
            <Analytics />
            <SpeedInsights />
            <PerformanceMonitor />
            <PerformanceDashboard />
            <ServiceWorkerRegistration />
          </body>
        </html>
      </IntercomProvider>
    </ClerkProvider>
  )
}
