import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/admin/', '/onboarding/', '/sign-in/', '/sign-up/', '/checkout/'],
      },
    ],
    sitemap: 'https://inboxnavigator.com/sitemap.xml',
  }
}
