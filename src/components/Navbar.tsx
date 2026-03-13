'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import UploadModal from './UploadModal';

export default function Navbar(): React.ReactElement {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>(searchParams?.get('q') || '');

  const handleLogout = async (): Promise<void> => {
    await signOut();
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

  return (
    <nav className="navbar">
      <div className="navbar-container container">
        <div className="logo-container">
          <Link href="/" className="logo-link">
            <div className="logo-text font-display">dg</div>
            <div className="logo-subtext font-display text-neon-pink">Stories</div>
          </Link>
        </div>

        <div className="nav-links font-display">
          <Link href="/" className="nav-item">HOME</Link>
          <Link href="/news" className="nav-item">NEWS</Link>
          <Link href="/media" className="nav-item">MEDIA</Link>
          
          <button 
            onClick={openUpload} 
            className="nav-item btn-link text-neon-cyan"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            title={session ? 'Upload to Vault' : 'Login to Upload'}
          >
            UPLOAD
          </button>

          {session && (
            <button 
              onClick={handleLogout} 
              className="nav-item btn-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              LOGOUT
            </button>
          )}
        </div>

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
      </div>

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={closeUpload} 
        onUploadSuccess={onUploadSuccess} 
      />
    </nav>
  );
}
