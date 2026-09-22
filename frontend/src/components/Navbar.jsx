import React from 'react';
import { CarFront, Plus, Sparkles, Activity } from 'lucide-react';

export default function Navbar({ onOpenNewModal, totalCars, apiStatus }) {
  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <div className="brand-group">
          <div className="brand-logo">
            <CarFront size={28} className="brand-icon" />
          </div>
          <div>
            <h1 className="brand-title">Gustavin Motors</h1>
            <p className="brand-subtitle">Gestão Inteligente de Veículos</p>
          </div>
        </div>

        <div className="navbar-actions">
          <div className="status-badge" title={`Status da API: ${apiStatus?.status || 'verificando...'}`}>
            <span className={`status-dot ${apiStatus?.status === 'ok' ? 'online' : 'checking'}`}></span>
            <span className="status-text">
              {apiStatus?.status === 'ok' ? 'API Online' : 'Conectando...'}
            </span>
          </div>

          <div className="counter-badge">
            <span className="counter-number">{totalCars}</span>
            <span className="counter-label">{totalCars === 1 ? 'veículo' : 'veículos'}</span>
          </div>

          <button 
            type="button" 
            className="btn btn-primary"
            onClick={onOpenNewModal}
            id="btn-new-car"
          >
            <Plus size={18} />
            <span>Novo Carro</span>
          </button>
        </div>
      </div>
    </header>
  );
}
