import React, { useState } from 'react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Trash2, Calendar, Tag, ImageOff, Clock, CircleDollarSign } from 'lucide-react';

export default function CarCard({ car, onDelete }) {
  const [imageError, setImageError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja dar saída no veículo "${car.marca} ${car.modelo}"?`)) {
      try {
        setIsDeleting(true);
        await onDelete(car._id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Garante exibição correta das horas e do valor total
  const horasPermanencia = car.horas !== undefined ? car.horas : (car.preco ? Number(car.preco) / 5 : 0);
  const valorTotalEstacionamento = car.valorTotal !== undefined ? car.valorTotal : (car.preco !== undefined ? car.preco : horasPermanencia * 5);

  return (
    <article className="car-card">
      <div className="car-image-container">
        {imageError ? (
          <div className="car-image-fallback">
            <ImageOff size={40} />
            <span>Imagem indisponível</span>
          </div>
        ) : (
          <img
            src={car.foto}
            alt={`${car.marca} ${car.modelo}`}
            className="car-image"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        )}
        <div className="car-badge-brand">
          <Tag size={12} />
          <span>{car.marca}</span>
        </div>

        {/* Badge destacando o tempo em horas */}
        <div className="car-badge-hours" title="Tempo de permanência">
          <Clock size={12} />
          <span>{horasPermanencia} {horasPermanencia === 1 ? 'hora' : 'horas'}</span>
        </div>
      </div>

      <div className="car-content">
        <div className="car-header-info">
          <h3 className="car-model-title" title={`${car.marca} ${car.modelo}`}>
            {car.modelo}
          </h3>
        </div>

        {/* Seção com Tempo e Valor Total da Garagem */}
        <div className="car-parking-stats">
          <div className="parking-stat-item">
            <span className="parking-stat-label">Permanência</span>
            <span className="parking-stat-value">
              <Clock size={13} className="inline-icon" />
              {horasPermanencia} {horasPermanencia === 1 ? 'hora' : 'horas'}
            </span>
          </div>
          <div className="parking-stat-item">
            <span className="parking-stat-label">Tarifa Fixa</span>
            <span className="parking-stat-rate">R$ 5,00/h</span>
          </div>
        </div>

        <div className="car-price-row">
          <span className="car-price-label">
            <CircleDollarSign size={13} className="inline-icon" />
            Valor Total do Estacionamento
          </span>
          <span className="car-price-value">{formatCurrency(valorTotalEstacionamento)}</span>
        </div>

        <div className="car-footer">
          <div className="car-date" title="Horário de entrada">
            <Calendar size={13} />
            <span>{formatDate(car.createdAt) || 'Hoje'}</span>
          </div>

          <button
            type="button"
            className="btn-delete"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Dar saída no veículo"
            aria-label="Dar saída no veículo"
          >
            <Trash2 size={16} />
            <span>{isDeleting ? 'Liberando...' : 'Dar Saída'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
