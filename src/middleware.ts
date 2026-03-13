import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest): NextResponse {
  // Temporary bypass to debug 500 error
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|api/admin|login|_next/static|_next/image|favicon.ico).*)",
  ],
};
