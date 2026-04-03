import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding(.*)',
  '/checkout(.*)',
  '/api/checkout-with-domains',
  '/api/webhooks/stripe-subscription',
  '/api/webhooks/clerk',
]);

// Routes that should bypass Clerk entirely (no session/CSRF checking)
const CLERK_BYPASS_PATHS = [
  '/api/checkout-with-domains',
  '/api/webhooks/stripe-subscription',
  '/api/webhooks/clerk',
];

const clerkHandler = clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth.protect();
  }
});

export default function middleware(req: NextRequest, event: any) {
  const path = req.nextUrl.pathname;

  // Bypass Clerk entirely for public API routes — Clerk's internal
  // CSRF/session validation blocks unauthenticated POST requests
  // even on routes marked as public via createRouteMatcher.
  if (CLERK_BYPASS_PATHS.some((p) => path === p)) {
    return NextResponse.next();
  }

  return clerkHandler(req, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
