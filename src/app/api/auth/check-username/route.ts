import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/auth/check-username?username=xxx
 * Checks if username exists (User) or is in whitelist (AllowedUser).
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const username = req.nextUrl.searchParams.get('username')?.trim();

    if (!username || username.length < 2) {
      return NextResponse.json({ allowed: false }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json({ exists: true, needsPassword: false });
    }

    const allowedUser = await prisma.allowedUser.findUnique({
      where: { username },
    });

    if (allowedUser) {
      return NextResponse.json({ exists: false, needsPassword: true });
    }

    return NextResponse.json({ allowed: false });
  } catch (error: unknown) {
    console.error('Check username error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
