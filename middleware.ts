import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 1. Get the session cookie (if you are using Firebase Session Cookies)
  // If you are using Client-side Auth only, we check for the presence 
  // of a custom cookie we set during login.
  const session = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  // 2. Define your Route types
  const isAuthPage = pathname.startsWith("/auth");
  const isLandingPage = pathname === "/";
  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/interview");

  // 3. Logic: If no sessionyy and trying to access a protected route
  if (!session && isProtectedRoute) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Logic: If session exists and trying to access login/register, send to dashboard
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 5. IMPORTANT: Allow access to landing page (/) whether logged in or not
  return NextResponse.next();
}

// Only run middleware on these specific paths to keep the app fast
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};