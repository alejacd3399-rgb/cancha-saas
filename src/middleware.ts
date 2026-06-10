import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login");
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isAdmin = req.nextUrl.pathname.startsWith("/admin");

  // Si intenta entrar al dashboard sin login → redirige al login
  if ((isDashboard || isAdmin) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Si ya está logueado e intenta ir al login → redirige al dashboard
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  // El middleware aplica a estas rutas
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login"],
};