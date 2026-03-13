'use client';

import { useEffect, useState } from 'react';

interface UserInfo {
  name: string | null;
  image: string | null;
}

interface MediaItem {
  id: string;
  title: string | null;
  url: string;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'ARCHIVE';
  createdAt: string;
  user: UserInfo;
}

interface MediaFeedProps {
  filter?: 'IMAGE' | 'VIDEO' | 'AUDIO';
  searchQuery?: string;
}

export default function MediaFeed({ filter, searchQuery }: MediaFeedProps): React.ReactElement {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMedia(): Promise<void> {
      try {
        const response = await fetch('/api/media');
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        
        const data: unknown = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from API');
        }

        let processedData = data as MediaItem[];
        
        // Apply Type Filter
        if (filter) {
          processedData = processedData.filter((item: MediaItem) => item.type === filter);
        }

        // Apply Search Filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          processedData = processedData.filter((item: MediaItem) => 
            (item.title && item.title.toLowerCase().includes(query)) ||
            (item.user.name && item.user.name.toLowerCase().includes(query))
          );
        }

        setMedia(processedData);
      } catch (err) {
        console.error('MediaFeed error:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchMedia();
  }, [filter, searchQuery]);

  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const handleDelete = async (id: string): Promise<void> => {
    try {
      const res = await fetch(`/api/media?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMedia((prev) => prev.filter(item => item.id !== id));
        setConfirmingId(null);
      } else {
        const errData = await res.json();
        alert(`Failed to delete: ${errData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('An error occurred while deleting');
    }
  };

  if (loading) {
    return <div className="text-center p-10 font-display text-neon-cyan">Loading Feed...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-10 glass-panel">
        <h2 className="font-display text-neon-pink">Error Loading Vault</h2>
        <p className="text-muted">{error}</p>
        <p className="text-muted mt-2">Check your server configuration and database connection.</p>
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="text-center p-10 glass-panel">
        <h2 className="font-display">The vault is empty.</h2>
        <p className="text-muted">Be the first to upload something!</p>
      </div>
    );
  }

  return (
    <div className="feed-container">
      {media.map((item: MediaItem) => (
        <article key={item.id} className="media-card glass-panel">
          <header className="card-header">
            <div className="user-info">
              <div className="avatar">
                {item.user.image ? (
                  <img src={item.user.image} alt="" />
                ) : (
                  item.user.name?.[0] || 'U'
                )}
              </div>
              <div>
                <h3 className="username font-display">{item.user.name || 'Anonymous User'}</h3>
                <span className="timestamp text-muted">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <button onClick={() => handleDelete(item.id)} className="delete-btn" title="Eliminar publicación">✕</button>
          </header>

          <div className="card-content">
            {item.title && <p>{item.title}</p>}
          </div>

          <div className="media-container">
            {item.type === 'IMAGE' ? (
              <img src={item.url} alt={item.title || ''} className="media-img" />
            ) : item.type === 'VIDEO' ? (
              <video src={item.url} controls className="media-video" />
            ) : item.type === 'AUDIO' ? (
              <div className="audio-player-container">
                <audio src={item.url} controls className="media-audio" />
              </div>
            ) : (
              <div className="file-download-container">
                <div className="file-icon">
                  {item.type === 'ARCHIVE' ? '📦' : '📄'}
                </div>
                <div className="file-details">
                  <span className="file-type-label font-display">{item.type}</span>
                  <a href={item.url} download className="btn-primary mini-btn">DOWNLOAD</a>
                </div>
              </div>
            )}
          </div>

          <footer className="card-actions">
            {/* Social buttons removed as requested */}
          </footer>
        </article>
      ))}
      
      <style dangerouslySetInnerHTML={{__html: `
        .media-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .media-video {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #000;
        }
        .feed-container {
          max-width: 650px;
          margin: 2rem auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .media-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .delete-actions {
          position: relative;
          z-index: 20;
        }
        .confirm-group {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .cancel-mini-btn {
          background: none; border: 1px solid var(--glass-border);
          color: var(--text-muted); cursor: pointer; padding: 4px 10px;
          border-radius: 4px; font-size: 0.7rem; font-family: 'Righteous', cursive;
        }
        .confirm-mini-btn {
          background: var(--accent-pink); border: none;
          color: white; cursor: pointer; padding: 4px 10px;
          border-radius: 4px; font-size: 0.7rem; font-family: 'Righteous', cursive;
          box-shadow: 0 0 10px rgba(255, 42, 109, 0.3);
        }
        .delete-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 1.2rem;
          cursor: pointer;
          transition: color 0.3s;
          padding: 10px;
        }
        .delete-btn:hover {
          color: var(--accent-pink);
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--accent-purple);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          border: 2px solid var(--accent-pink);
          overflow: hidden;
        }
        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .media-container {
          border-radius: 8px;
          overflow: hidden;
          background: #000;
          position: relative;
          aspect-ratio: 16/9;
          border: 1px solid var(--glass-border);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .audio-player-container {
          width: 100%;
          padding: 2rem;
          background: linear-gradient(45deg, #1a1a2e, #16213e);
          display: flex;
          justify-content: center;
        }
        .media-audio {
            width: 80%;
        }
        .file-download-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
          background: rgba(255,255,255,0.05);
          width: 100%;
        }
        .file-icon {
          font-size: 4rem;
          filter: drop-shadow(0 0 10px var(--accent-cyan));
        }
        .file-details {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .file-type-label {
          font-size: 0.8rem;
          color: var(--accent-pink);
          letter-spacing: 2px;
        }
        .mini-btn {
          padding: 5px 15px;
          font-size: 0.7rem;
        }
        .card-actions {
          display: flex;
          gap: 1.5rem;
        }
        .action-btn {
          background: none;
          border: none;
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
        }
        .bookmark-btn {
          margin-left: auto;
        }
      `}} />
    </div>
  );
}
