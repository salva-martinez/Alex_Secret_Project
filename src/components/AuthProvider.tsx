'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactElement, ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps): ReactElement {
  return <SessionProvider>{children}</SessionProvider>;
}
