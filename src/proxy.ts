import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;
  const pathname = url.pathname;

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
    "/analytics",
  ];
  const publicRoutes = ["/", "/subscription"];
  const onboardingRoutes = ["/onboarding"];

  const isAuthRoute = authRoutes.some((route) => pathname === route);
  const isVerifyRoute = verifyRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || (route !== "/" && pathname.startsWith(route))
  );
  const isOnboardingRoute = onboardingRoutes.some((route) => pathname.startsWith(route));

  if (!token) {
    if (isAuthRoute || isVerifyRoute || isPublicRoute) return NextResponse.next();
    if (isProtectedRoute || isOnboardingRoute) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    return NextResponse.next();
  }

  const emailVerified = token.emailVerified === true;
  const hasOnboarded = token.hasOnboarded === true;

  if (!emailVerified) {
    if (isVerifyRoute || isPublicRoute) return NextResponse.next();
    return NextResponse.redirect(new URL("/verify", request.url));
  }

  if (!hasOnboarded) {
    if (isOnboardingRoute || isPublicRoute) return NextResponse.next();
    if (isAuthRoute || isProtectedRoute) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
    return NextResponse.next();
  }

  if (isAuthRoute || isVerifyRoute || isOnboardingRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (isPublicRoute || isProtectedRoute) return NextResponse.next();

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
    "/analytics/:path*",
  ],
};