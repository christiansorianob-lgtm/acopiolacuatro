import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Si necesitas lógica adicional de middleware, la agregas aquí.
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback_super_secret_key_acopio_123_override_forced_value_for_vercel",
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo.png (static files)
     * - manifest.json (PWA manifest)
     * - login (auth page)
     * - imprimir (public print view)
     * - verificar (public verification view)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|logo.png|manifest.json|login|imprimir|verificar).*)",
  ],
};
