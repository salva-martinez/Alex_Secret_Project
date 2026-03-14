'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import UploadModal from './UploadModal';

function HamburgerIcon({ open }: { open: boolean }): React.ReactElement {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  );
}

export default function Navbar(): React.ReactElement {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>(searchParams?.get('q') || '');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleLogout = async (): Promise<void> => {
    // Usar window.location.origin para redirigir al dominio actual (evita localhost en producción)
    const callbackUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : '/';
    await signOut({ callbackUrl, redirect: true });
  };

  const openUpload = (): void => {
    setIsUploadOpen(true);
  };

  const closeUpload = (): void => {
    setIsUploadOpen(false);
  };

  const onUploadSuccess = (): void => {
    window.location.reload();
  };

  const handleSearch = (e: FormEvent): void => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams?.toString());
    if (searchQuery) {
      params.set('q', searchQuery);
    } else {
      params.delete('q');
    }
    router.push(`/media?${params.toString()}`);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  const closeMobileMenu = (): void => setMobileMenuOpen(false);
  const toggleMobileMenu = (): void => setMobileMenuOpen((prev) => !prev);

  const navLinksContent = (
    <div className="nav-links font-display">
      <Link href="/" className="nav-item" onClick={closeMobileMenu}>HOME</Link>
      <Link href="/media" className="nav-item" onClick={closeMobileMenu}>MEDIA</Link>
      <button
        onClick={() => { openUpload(); closeMobileMenu(); }}
        className="nav-item btn-link text-neon-cyan"
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
        title={session ? 'Upload to Vault' : 'Login to Upload'}
      >
        UPLOAD
      </button>
      {session && (
        <button
          onClick={() => { handleLogout(); closeMobileMenu(); }}
          className="nav-item btn-link"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
        >
          LOGOUT
        </button>
      )}
    </div>
  );

  const searchForm = (
    <form onSubmit={handleSearch} className="search-container">
      <input
        type="text"
        placeholder="Search the vault..."
        className="search-input"
        value={searchQuery}
        onChange={handleSearchChange}
      />
      <button type="submit" className="search-btn">🔍</button>
    </form>
  );

  return (
    <nav className="navbar">
      <div className="navbar-container container">
        <div className="logo-container">
          <Link href="/" className="logo-link" onClick={closeMobileMenu}>
            <div className="logo-text font-display">dg</div>
            <div className="logo-subtext font-display text-neon-pink">Stories</div>
          </Link>
        </div>

        <div className="nav-desktop">{navLinksContent}</div>
        <div className="search-desktop">{searchForm}</div>

        <button
          type="button"
          className="hamburger-btn"
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          <HamburgerIcon open={mobileMenuOpen} />
        </button>
      </div>

      <div className={`nav-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        {navLinksContent}
        {searchForm}
      </div>

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={closeUpload} 
        onUploadSuccess={onUploadSuccess} 
      />
    </nav>
  );
}
