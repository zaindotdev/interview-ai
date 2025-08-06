import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Debug logging (remove in production)
  console.log("Middleware - Path:", pathname);
  console.log("Middleware - Token exists:", !!token);
  console.log("Middleware - Has onboarded:", token?.hasOnboarded);

  // Define route categories
  const authRoutes = ["/sign-in", "/sign-up", "/verify/:path*"];
  const protectedRoutes = [
    "/dashboard",
    "/mock-interviews",
    "/resume-analysis",
    "/interview-history",
    "/profile",
    "/report/:id*",
    "/practice-questions",
    '/analytics'
  ];
  const publicRoutes = ["/"];
  const onboardingRoutes = ["/onboarding"];

  // Check route types
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isPublicRoute = publicRoutes.includes(pathname);
  const isOnboardingRoute = onboardingRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Case 1: User is not authenticated
  if (!token) {
    // Redirect protected routes to sign-in
    if (isProtectedRoute || isOnboardingRoute) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Allow access to auth routes and public routes
    if (isAuthRoute || isPublicRoute) {
      return NextResponse.next();
    }

    // For any other route, redirect to home
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Case 2: User is authenticated
  if (token) {
    // Check if user has completed onboarding
    const hasOnboarded = token.hasOnboarded === true;

    // If user hasn't onboarded yet
    if (!hasOnboarded) {
      // Redirect auth routes to onboarding
      if (isAuthRoute) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }

      // Redirect protected routes to onboarding
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }

      // Allow access to onboarding routes
      if (isOnboardingRoute) {
        return NextResponse.next();
      }

      // Redirect home to onboarding
      if (isPublicRoute) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
    }

    // If user has completed onboarding
    if (hasOnboarded) {
      // Redirect auth routes to dashboard
      if (isAuthRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Redirect onboarding routes to dashboard (user already onboarded)
      if (isOnboardingRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Allow access to protected routes
      if (isProtectedRoute) {
        return NextResponse.next();
      }

      // Redirect home to dashboard for onboarded users
      if (isPublicRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  // Default: allow the request to continue
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/sign-in",
    "/sign-up",
    "/verify/:path*",
    "/",
    "/dashboard",
    "/mock-interviews",
    "/resume-analysis",
    "/interview-history",
    "/profile",
    "/report/:id*",
    "/onboarding",
    "/practice-questions",
    '/analytics'
  ],
};
