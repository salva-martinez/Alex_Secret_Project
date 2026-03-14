import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest): Promise<NextResponse> {
  let token = null;
  try {
    token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
  } catch {
    token = null;
  }

  const isAuthenticated = !!token;
  const isLoginPage = req.nextUrl.pathname === '/login';

  // Si está logueado e intenta ir a /login, redirigir a home
  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Si no está logueado y no es /login
  if (!isAuthenticated && !isLoginPage) {
    // Para APIs devolver 401; para páginas redirigir a login
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Incluye todas las rutas excepto:
     * - api/auth (NextAuth)
     * - api/admin (webhooks/APIs externas)
     * - _next/static, _next/image, favicon.ico
     */
    '/((?!api/auth|api/admin|_next/static|_next/image|favicon.ico).*)',
  ],
};
