import React, { ReactElement } from 'react';

interface NewsItem {
  id: string;
  date: string;
  author: string;
  title: string;
  content: string;
  tag: string;
}

const mockNews: NewsItem[] = [
  {
    id: '1',
    date: '2026-03-13',
    author: 'dg',
    tag: 'SYSTEM',
    title: 'THE VAULT IS ONLINE',
    content: 'Our private multimedia library is now operational. Invite-only access has been enforced. Welcome to the restricted area.'
  },
  {
    id: '2',
    date: '2026-03-12',
    author: 'Admin',
    tag: 'UPDATE',
    title: 'S3 STORAGE INTEGRATED',
    content: 'We have successfully linked the backend to our encrypted S3 storage. You can now push high-resolution photos and videos safely.'
  },
  {
    id: '3',
    date: '2026-03-10',
    author: 'dg',
    tag: 'ANNOUNCEMENT',
    title: 'RETRO VIBES ONLY',
    content: 'The UI has been overhauled with a custom Synthwave aesthetic. Neon glows, glass panels, and retro typography are now standard.'
  }
];

export default function NewsPage(): ReactElement {
  return (
    <div className="news-page-wrapper">
      <header className="page-header text-center">
        <h1 className="font-display text-neon-pink">News & Logs</h1>
        <p className="subtitle">BULLETIN FROM THE UNDERGROUND</p>
      </header>

      <div className="news-feed container">
        {mockNews.map((item: NewsItem) => (
          <article key={item.id} className="news-card glass-panel">
            <header className="card-header">
              <span className="tag font-display">{item.tag}</span>
              <span className="date text-muted">{item.date}</span>
            </header>
            <h2 className="card-title font-display text-neon-cyan">{item.title}</h2>
            <p className="card-content">{item.content}</p>
            <footer className="card-footer">
              <span className="author text-muted">LOGGED_BY: {item.author.toUpperCase()}</span>
            </footer>
          </article>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .news-page-wrapper {
          padding-bottom: 5rem;
        }
        .page-header {
          margin: 4rem 0;
        }
        .page-header h1 {
          font-size: 4rem;
        }
        .subtitle {
          letter-spacing: 5px;
          color: var(--text-muted);
          font-size: 0.8rem;
        }
        .news-feed {
          max-width: 800px;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .news-card {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          border-left: 4px solid var(--accent-pink);
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
        }
        .tag {
          color: var(--accent-pink);
          background: rgba(255, 42, 109, 0.1);
          padding: 2px 8px;
          border-radius: 4px;
        }
        .card-title {
          font-size: 1.8rem;
          margin: 0.5rem 0;
        }
        .card-content {
          line-height: 1.6;
          color: #d1d5db;
        }
        .card-footer {
          margin-top: 1rem;
          font-size: 0.7rem;
          font-family: monospace;
          letter-spacing: 1px;
        }
      `}} />
    </div>
  );
}
