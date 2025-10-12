import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Define route categories
  const authRoutes = ["/sign-in", "/sign-up", "/verify"];
  const protectedRoutes = [
    "/dashboard",
    "/mock-interviews/",
    "/session",
    "/resume-analysis",
    "/interview-history",
    "/profile",
    "/report",
    "/practice-questions",
    "/analytics"
  ];
  const publicRoutes = ["/", "/subscription"]; // Added pricing to public routes
  const onboardingRoutes = ["/onboarding"];

  // Check route types with more precise matching
  const isAuthRoute = authRoutes.some((route) => pathname === route);
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isPublicRoute = publicRoutes.some((route) => 
    pathname.startsWith(route)
  );
  const isOnboardingRoute = onboardingRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Case 1: User is not authenticated
  if (!token) {
    // Allow access to auth routes, verify routes, and public routes
    if (isAuthRoute || isPublicRoute) {
      return NextResponse.next();
    }

    // Redirect protected routes to sign-in
    if (isProtectedRoute || isOnboardingRoute) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  // Case 2: User is authenticated
  if (token) {
    const hasOnboarded = token.hasOnboarded === true;

    // If user hasn't onboarded yet
    if (!hasOnboarded) {
      // Allow access to public routes and onboarding
      if (isPublicRoute || isOnboardingRoute) {
        return NextResponse.next();
      }

      // Allow completion of sign-up process
      if (pathname === "/sign-up" || pathname.startsWith("/verify")) {
        return NextResponse.next();
      }

      // Redirect protected routes to onboarding
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
    }

    // If user has completed onboarding
    if (hasOnboarded) {
      // Allow access to public routes
      if (isPublicRoute) {
        return NextResponse.next();
      }

      // Redirect auth routes to dashboard
      if (isAuthRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Allow access to protected routes
      if (isProtectedRoute) {
        return NextResponse.next();
      }

      // Redirect onboarding routes to dashboard
      if (isOnboardingRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  // Default: allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/sign-in",
    "/sign-up",
    "/verify",
    "/",
    "/subscription",
    "/dashboard/:path*",
    "/mock-interviews/:path*",
    "/resume-analysis/:path*",
    "/interview-history/:path*",
    "/profile/:path*",
    "/report/:path*",
    "/onboarding/:path*",
    "/practice-questions/:path*",
    "/analytics/:path*"
  ],
};
