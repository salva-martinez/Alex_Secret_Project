import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

const MIN_PASSWORD_LENGTH = 8;
const BCRYPT_ROUNDS = 10;

interface RegisterBody {
  username: string;
  password: string;
}

/**
 * POST /api/auth/register
 * Registers a new user (username must be in AllowedUser whitelist).
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await req.json();
    const { username, password } = body as RegisterBody;

    const trimmedUsername = username?.trim();

    if (!trimmedUsername || trimmedUsername.length < 2) {
      return NextResponse.json(
        { error: 'Usuario inválido' },
        { status: 400 }
      );
    }

    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres` },
        { status: 400 }
      );
    }

    const allowedUser = await prisma.allowedUser.findUnique({
      where: { username: trimmedUsername },
    });

    if (!allowedUser) {
      return NextResponse.json({ error: 'Usuario no autorizado' }, { status: 403 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username: trimmedUsername },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya está registrado. Inicia sesión con tu contraseña.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await prisma.user.create({
      data: {
        username: trimmedUsername,
        passwordHash,
      },
    });

    return NextResponse.json({ message: 'Usuario registrado correctamente' });
  } catch (error: unknown) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Error al registrar' },
      { status: 500 }
    );
  }
}
