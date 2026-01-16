import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Define route categories
  const authRoutes = ["/sign-in", "/sign-up"];
  const verifyRoutes = ["/verify"];
  const protectedRoutes = [
    "/dashboard",
    "/mock-interviews",
    "/session",
    "/resume-analysis",
    "/interview-history",
    "/profile",
    "/report",
    "/practice-questions",
    "/analytics"
  ];
  const publicRoutes = ["/", "/subscription"];
  const onboardingRoutes = ["/onboarding"];

  // Check route types with more precise matching
  const isAuthRoute = authRoutes.some((route) => pathname === route);
  const isVerifyRoute = verifyRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isPublicRoute = publicRoutes.some((route) => 
    pathname === route || (route !== "/" && pathname.startsWith(route))
  );
  const isOnboardingRoute = onboardingRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Case 1: User is not authenticated
  if (!token) {
    // Allow access to auth routes, verify routes, and public routes
    if (isAuthRoute || isVerifyRoute || isPublicRoute) {
      return NextResponse.next();
    }

    // Redirect protected routes and onboarding to sign-in
    if (isProtectedRoute || isOnboardingRoute) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    return NextResponse.next();
  }

  // Case 2: User is authenticated
  if (token) {
    const emailVerified = token.emailVerified === true;
    const hasOnboarded = token.hasOnboarded === true;

    // Priority 1: Check email verification (highest priority)
    if (!emailVerified) {
      // Allow access to verify route and public routes
      if (isVerifyRoute || isPublicRoute) {
        return NextResponse.next();
      }

      // Redirect everything else to verify
      return NextResponse.redirect(new URL("/verify", request.url));
    }

    // Priority 2: Check onboarding (after email is verified)
    if (emailVerified && !hasOnboarded) {
      // Allow access to onboarding route and public routes
      if (isOnboardingRoute || isPublicRoute) {
        return NextResponse.next();
      }

      // Redirect protected routes to onboarding
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }

      // Redirect auth routes to onboarding
      if (isAuthRoute) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }

      return NextResponse.next();
    }

    // Priority 3: User is fully verified and onboarded
    if (emailVerified && hasOnboarded) {
      // Allow access to public routes
      if (isPublicRoute) {
        return NextResponse.next();
      }

      // Redirect auth routes to dashboard
      if (isAuthRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Redirect verify and onboarding routes to dashboard
      if (isVerifyRoute || isOnboardingRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Allow access to protected routes
      if (isProtectedRoute) {
        return NextResponse.next();
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
    "/verify/:path*",
    "/",
    "/subscription/:path*",
    "/dashboard/:path*",
    "/mock-interviews/:path*",
    "/session/:path*",
    "/resume-analysis/:path*",
    "/interview-history/:path*",
    "/profile/:path*",
    "/report/:path*",
    "/onboarding/:path*",
    "/practice-questions/:path*",
    "/analytics/:path*"
  ],
};
