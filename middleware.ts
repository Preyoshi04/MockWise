import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith("/auth");
  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/interview");

  // 1. If no session, allow access to Auth pages but block Protected routes
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // 2. If session exists and user tries to go to Login/Register, send to Dashboard
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robot.jpeg).*)"],
};