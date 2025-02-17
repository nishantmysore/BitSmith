import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define which paths require authentication
const authRequiredPaths = [
  "/home",
  "/public",
  "/mydevices",
  "/upload",
  "/schema",
]; // add your protected routes
const subscriptionRequiredPaths = [
  "/home",
  "/public",
  "/mydevices",
  "/upload",
  "/schema",
]; // add routes that need subscription

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path requires authentication
  const requiresAuth = authRequiredPaths.some((path) =>
    pathname.startsWith(path),
  );
  const requiresSubscription = subscriptionRequiredPaths.some((path) =>
    pathname.startsWith(path),
  );

  if (!requiresAuth && !requiresSubscription) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect to login if no token and auth is required
  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Check subscription status if required
  if (requiresSubscription) {
    try {
      const subscriptionRes = await fetch(
        `${request.nextUrl.origin}/api/check-subscription`,
        {
          // Add credentials to ensure cookies are sent
          credentials: "include",
          headers: {
            Cookie: request.headers.get("cookie") || "", // Forward cookies for session
          },
        },
      );

      const subscriptionData = await subscriptionRes.json();

      if (!subscriptionRes.ok || !subscriptionData.active) {
        // Redirect to subscription page if not active
        return NextResponse.redirect(
          new URL("/subscription-required", request.url),
        );
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      return NextResponse.redirect(new URL("/error", request.url));
    }
  }

  return NextResponse.next();
}

// Configure matcher for paths that should run middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
