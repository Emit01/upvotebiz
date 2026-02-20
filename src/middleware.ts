import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.isAdmin) {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  const userProtectedPaths = [
    "/statistics",
    "/new-order",
    "/orders",
    "/add-funds",
    "/transactions",
    "/services",
    "/profile",
    "/api-docs",
  ];

  if (userProtectedPaths.some((p) => pathname.startsWith(p))) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/statistics/:path*",
    "/new-order/:path*",
    "/orders/:path*",
    "/add-funds/:path*",
    "/transactions/:path*",
    "/services/:path*",
    "/profile/:path*",
    "/api-docs/:path*",
    "/admin/:path*",
  ],
};
