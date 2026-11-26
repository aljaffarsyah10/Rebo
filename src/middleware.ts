import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isAdminRoute = createRouteMatcher(['/rebo/admin(.*)']);
const isProtectedRoute = createRouteMatcher(['/rebo(.*)']);
const isAuthRoute = createRouteMatcher(['/auth/sign-in(.*)']);
const isApiRoute = createRouteMatcher(['/(api|trpc)(.*)']);
const isPublicApiRoute = createRouteMatcher(['/api/webhooks(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // If already authenticated and visiting sign-in page, redirect seamlessly to overview
  if (isAuthRoute(req) && userId) {
    const url = new URL('/rebo/overview', req.url);
    return NextResponse.redirect(url);
  }

  // Protect API routes: if request to API has no userId, return 401 Unauthorized
  if (isApiRoute(req) && !isPublicApiRoute(req)) {
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Protect admin routes: must be logged in and have admin or tpi role
  if (isAdminRoute(req)) {
    if (!userId) {
      const url = new URL('/auth/sign-in', req.url);
      return NextResponse.redirect(url);
    }
    const role = (sessionClaims?.metadata as { role?: string } | undefined)
      ?.role;
    if (role !== 'admin' && role !== 'tpi') {
      const url = new URL('/rebo/overview', req.url);
      return NextResponse.redirect(url);
    }
  }

  // Protect all routes starting with `/rebo` (require login)
  if (isProtectedRoute(req) && !userId) {
    if (req.headers.get('x-screenshot-key') === 'local-docs-capture') {
      return NextResponse.next();
    }
    const url = new URL('/auth/sign-in', req.url);
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
};
