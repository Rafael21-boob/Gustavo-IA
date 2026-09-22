import React from 'react';

export default function LoadingState() {
  const skeletons = Array.from({ length: 6 });

  return (
    <div className="skeleton-grid" aria-busy="true" aria-label="Carregando veículos...">
      {skeletons.map((_, index) => (
        <div key={index} className="skeleton-card">
          <div className="skeleton-image pulse"></div>
          <div className="skeleton-content">
            <div className="skeleton-tag pulse"></div>
            <div className="skeleton-title pulse"></div>
            <div className="skeleton-price pulse"></div>
            <div className="skeleton-footer pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
