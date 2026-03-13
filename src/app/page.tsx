import MediaFeed from '@/components/MediaFeed';
import React, { ReactElement } from 'react';

export default function Home(): ReactElement {
  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header text-center p-10">
        <h1 className="font-display text-neon-pink" style={{ fontSize: '3.5rem' }}>Welcome to the Vault</h1>
        <p className="subtitle text-muted" style={{ letterSpacing: '4px' }}>EXCLUSIVE MEDIA LIBRARY</p>
      </header>
      
      <MediaFeed />

      <style dangerouslySetInnerHTML={{__html: `
        .dashboard-wrapper {
          min-height: 100vh;
          padding-bottom: 5rem;
        }
        .subtitle {
          text-transform: uppercase;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }
        .text-center {
          text-align: center;
        }
      `}} />
    </div>
  );
}
