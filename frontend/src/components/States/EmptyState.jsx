import React from 'react';
import { CarFront, PlusCircle } from 'lucide-react';

export default function EmptyState({ onOpenNewModal }) {
  return (
    <div className="state-container empty-state">
      <div className="state-icon-wrapper empty-icon">
        <CarFront size={52} />
      </div>
      <h3 className="state-title">Nenhum veículo no inventário</h3>
      <p className="state-message">
        Seu catálogo de carros está vazio no momento. Cadastre o primeiro veículo para começar a gerenciar o estoque.
      </p>
      {onOpenNewModal && (
        <button type="button" className="btn btn-primary" onClick={onOpenNewModal}>
          <PlusCircle size={18} />
          <span>Cadastrar Primeiro Carro</span>
        </button>
      )}
    </div>
  );
}
