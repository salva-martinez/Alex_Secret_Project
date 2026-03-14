"use client";

import MediaFeed from "@/components/MediaFeed";
import React, { ReactElement, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

type FilterType = 'ALL' | 'IMAGE' | 'VIDEO' | 'AUDIO';

function MediaPageContent(): ReactElement {
  const searchParams = useSearchParams();
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const searchQuery = searchParams?.get('q') || undefined;

  const handleFilterChange = (filter: FilterType): void => {
    setActiveFilter(filter);
  };

  return (
    <div className="media-page-wrapper">
      <header className="page-header text-center">
        <h1 className="font-display text-neon-cyan page-title">The Gallery</h1>
        <p className="subtitle">MOMENTS PRESERVED IN TIME</p>
        {searchQuery && (
          <p className="search-result-info text-neon-pink">
            RESULTS FOR: "{searchQuery.toUpperCase()}"
          </p>
        )}
      </header>

      <div className="filter-bar container">
        <div className="filter-options glass-panel">
          <button 
            onClick={() => handleFilterChange('ALL')} 
            className={`filter-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
          >
            ALL
          </button>
          <button 
            onClick={() => handleFilterChange('IMAGE')} 
            className={`filter-btn ${activeFilter === 'IMAGE' ? 'active' : ''}`}
          >
            PHOTOS
          </button>
          <button 
            onClick={() => handleFilterChange('VIDEO')} 
            className={`filter-btn ${activeFilter === 'VIDEO' ? 'active' : ''}`}
          >
            VIDEOS
          </button>
          <button 
            onClick={() => handleFilterChange('AUDIO')} 
            className={`filter-btn ${activeFilter === 'AUDIO' ? 'active' : ''}`}
          >
            AUDIO
          </button>
        </div>
      </div>
      
      <MediaFeed 
        filter={activeFilter === 'ALL' ? undefined : activeFilter} 
        searchQuery={searchQuery}
      />
    </div>
  );
}

export default function MediaPage(): ReactElement {
  return (
    <Suspense fallback={<div className="text-center p-20 font-display text-neon-cyan">LOADING_VAULT...</div>}>
      <MediaPageContent />
      <style dangerouslySetInnerHTML={{__html: `
        .media-page-wrapper {
          padding-bottom: 5rem;
        }
        .page-header {
          margin: 3rem 0;
        }
        .page-header h1 {
          font-size: clamp(1.75rem, 6vw, 3.5rem);
        }
        .subtitle {
          letter-spacing: 4px;
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }
        .search-result-info {
          margin-top: 1rem;
          font-family: 'Righteous', cursive;
          letter-spacing: 2px;
        }
        .filter-bar {
          margin-bottom: 2rem;
          display: flex;
          justify-content: center;
        }
        .filter-options {
          display: flex;
          gap: 1rem;
          padding: 0.5rem 1rem;
          border-radius: 30px;
        }
        .filter-btn {
          background: none;
          border: none;
          color: white;
          font-family: 'Righteous', cursive;
          padding: 0.5rem 1.5rem;
          cursor: pointer;
          border-radius: 20px;
          transition: all 0.3s ease;
        }
        .filter-btn:hover {
          color: var(--accent-pink);
        }
        .filter-btn.active {
          background: var(--accent-pink);
          color: white;
          box-shadow: var(--neon-pink-glow);
        }
      `}} />
    </Suspense>
  );
}
