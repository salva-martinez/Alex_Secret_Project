import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import AuthProvider from '@/components/AuthProvider';
import React, { ReactElement, ReactNode, Suspense } from 'react';

export const metadata: Metadata = {
  title: 'FriendVault',
  description: 'Private retro multimedia library',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps): ReactElement {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Righteous&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          <Suspense fallback={<nav className="navbar"><div className="navbar-container container" /></nav>}>
            <Navbar />
          </Suspense>
          <main className="container">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
