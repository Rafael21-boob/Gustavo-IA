import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="state-container error-state">
      <div className="state-icon-wrapper error-icon">
        <AlertTriangle size={48} />
      </div>
      <h3 className="state-title">Erro ao carregar veículos</h3>
      <p className="state-message">
        {message || 'Não foi possível estabelecer comunicação com o servidor da API.'}
      </p>
      {onRetry && (
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          <RefreshCw size={16} />
          <span>Tentar Novamente</span>
        </button>
      )}
    </div>
  );
}
