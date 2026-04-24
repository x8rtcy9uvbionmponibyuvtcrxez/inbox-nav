import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const MARKETING_HOSTS = new Set(['inboxnavigator.com', 'www.inboxnavigator.com']);
const APP_HOSTS = new Set(['app.inboxnavigator.com']);

// Paths that belong exclusively to the app. If someone hits these on the
// marketing host we redirect them over to the app subdomain instead of
// letting the request render without auth.
const APP_ONLY_PREFIXES = [
  '/dashboard',
  '/admin',
  '/onboarding',
  '/checkout',
  '/sign-in',
  '/sign-up',
  '/debug-user-id',
  '/api',
];

// Paths that belong exclusively to the marketing site. If someone hits these
// on the app host we redirect them back to the marketing domain.
const MARKETING_ONLY_PATHS = new Set([
  '/cookies',
  '/privacy',
  '/terms',
  '/refund',
  '/dfy',
]);

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  // Guest-checkout flow: checkout and onboarding must be reachable before the
  // user signs up. Onboarding's client-side code redirects unauth'd users to
  // sign-up, passing the original URL through via redirect_url.
  '/checkout(.*)',
  '/onboarding(.*)',
  '/api/checkout-with-domains',
  '/api/get-session',
  '/api/webhooks/stripe-subscription',
  '/api/webhooks/clerk',
  '/api/analytics/performance',
]);

// Routes that should bypass Clerk entirely (no session/CSRF checking).
// Webhooks verify their own signatures; public APIs are fine without Clerk.
const CLERK_BYPASS_PREFIXES = [
  '/api/checkout-with-domains',
  '/api/get-session',
  '/api/webhooks/',
  '/api/analytics/performance',
];

const clerkHandler = clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth.protect();
  }
});

function normalizeHost(raw: string | null): string {
  if (!raw) return '';
  // Strip port, lowercase, strip trailing dot from FQDN.
  return raw.split(':')[0].toLowerCase().replace(/\.$/, '');
}

function isAppOnly(path: string): boolean {
  return APP_ONLY_PREFIXES.some((p) => path === p || path.startsWith(p + '/'));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function middleware(req: NextRequest, event: any) {
  const host = normalizeHost(req.headers.get('host'));
  const path = req.nextUrl.pathname;
  const appOrigin = process.env.NEXT_PUBLIC_APP_URL || 'https://app.inboxnavigator.com';
  const marketingOrigin = 'https://inboxnavigator.com';

  // Marketing domain: serves the marketing site only. App-only paths get
  // redirected to the app subdomain so unauth'd users can't see (or try to
  // render) authed pages here.
  if (MARKETING_HOSTS.has(host)) {
    if (isAppOnly(path)) {
      return NextResponse.redirect(new URL(path + req.nextUrl.search, appOrigin));
    }
    return NextResponse.next();
  }

  // App subdomain: send `/` and marketing-only pages back to the marketing
  // site so there's exactly one URL per concept.
  if (APP_HOSTS.has(host)) {
    if (path === '/') {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    if (MARKETING_ONLY_PATHS.has(path)) {
      return NextResponse.redirect(new URL(path, marketingOrigin));
    }
  }

  // Bypass Clerk entirely for webhook/public APIs — Clerk's internal
  // CSRF/session validation blocks unauthenticated POSTs even on routes
  // marked public via createRouteMatcher.
  if (CLERK_BYPASS_PREFIXES.some((p) => path === p || path.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  return clerkHandler(req, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
