import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface InviteRequest {
  email: string;
}

/**
 * [API] POST /api/admin/invite
 * Adds an email to the AllowedUser (whitelist) table.
 * Protected by a simple ADMIN_SECRET header for now.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const adminSecret = req.headers.get('x-admin-secret');
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: unknown = await req.json();
    const { email } = body as InviteRequest;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const allowedUser = await prisma.allowedUser.upsert({
      where: { email },
      update: {},
      create: { 
        email,
        invitedBy: 'SYSTEM_GENERIC' 
      },
    });

    return NextResponse.json({ message: 'User added to whitelist', user: allowedUser });
  } catch (error: unknown) {
    console.error('Invite Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
