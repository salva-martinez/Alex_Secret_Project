import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface InviteRequest {
  username: string;
}

const USERNAME_MIN_LENGTH = 2;
const USERNAME_MAX_LENGTH = 32;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

/**
 * [API] POST /api/admin/invite
 * Adds a username to the AllowedUser (whitelist) table.
 * Protected by x-admin-secret header.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const adminSecret = req.headers.get('x-admin-secret');
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: unknown = await req.json();
    const { username } = body as InviteRequest;

    const trimmed = username?.trim();

    if (
      !trimmed ||
      trimmed.length < USERNAME_MIN_LENGTH ||
      trimmed.length > USERNAME_MAX_LENGTH
    ) {
      return NextResponse.json(
        { error: `Username must be ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (!USERNAME_REGEX.test(trimmed)) {
      return NextResponse.json(
        { error: 'Username can only contain letters, numbers and underscore' },
        { status: 400 }
      );
    }

    const allowedUser = await prisma.allowedUser.upsert({
      where: { username: trimmed },
      update: {},
      create: {
        username: trimmed,
        invitedBy: 'SYSTEM_GENERIC',
      },
    });

    return NextResponse.json({
      message: 'Username added to whitelist',
      user: allowedUser,
    });
  } catch (error: unknown) {
    console.error('Invite Error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
