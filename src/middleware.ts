import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// TEMPORARY: Make all routes public for testing
const isPublicRoute = createRouteMatcher([
  '/(.*)', // Match all routes
]);

export default clerkMiddleware((auth, req) => {
  // TEMPORARY: Skip authentication for testing
  // if (!isPublicRoute(req)) {
  //   auth.protect();
  // }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
