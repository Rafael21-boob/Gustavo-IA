import React, { useState, useMemo } from 'react';
import { X, Check, Car, Clock, Image as ImageIcon, Sparkles, AlertCircle, Calculator } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const TARIFA_POR_HORA = 5.0; // Tarifa fixa de R$ 5,00 por hora

const PRESET_CARS = [
  {
    marca: 'Ford',
    modelo: 'Mustang Mach 1 V8',
    horas: 2,
    foto: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=800&q=80',
  },
  {
    marca: 'Audi',
    modelo: 'RS6 Avant Quattro',
    horas: 4,
    foto: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80',
  },
  {
    marca: 'Volvo',
    modelo: 'XC90 Recharge Hybrid',
    horas: 6,
    foto: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',
  },
];

export default function CarFormModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    horas: '',
    foto: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Cálculo automático em tempo real: Horas * R$ 5,00
  const valorTotalCalculado = useMemo(() => {
    const horasNum = Number(formData.horas);
    if (isNaN(horasNum) || horasNum < 0) return 0;
    return horasNum * TARIFA_POR_HORA;
  }, [formData.horas]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleApplyPreset = (preset) => {
    setFormData({
      marca: preset.marca,
      modelo: preset.modelo,
      horas: preset.horas.toString(),
      foto: preset.foto,
    });
    setFormErrors({});
  };

  const validate = () => {
    const errors = {};
    if (!formData.marca.trim()) errors.marca = 'A marca é obrigatória.';
    if (!formData.modelo.trim()) errors.modelo = 'O modelo é obrigatório.';
    if (!formData.horas || isNaN(Number(formData.horas)) || Number(formData.horas) <= 0) {
      errors.horas = 'Informe um tempo em horas válido (mínimo 1 hora).';
    }
    if (!formData.foto.trim()) {
      errors.foto = 'A URL da foto é obrigatória.';
    } else if (!formData.foto.startsWith('http://') && !formData.foto.startsWith('https://')) {
      errors.foto = 'A URL da foto deve iniciar com http:// ou https://';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      const horasNum = Number(formData.horas);
      await onSubmit({
        marca: formData.marca.trim(),
        modelo: formData.modelo.trim(),
        horas: horasNum,
        valorTotal: horasNum * TARIFA_POR_HORA,
        preco: horasNum * TARIFA_POR_HORA,
        foto: formData.foto.trim(),
      });
      // Limpa formulário e fecha o modal
      setFormData({ marca: '', modelo: '', horas: '', foto: '' });
      setFormErrors({});
      onClose();
    } catch (err) {
      setServerError(err.message || 'Erro ao cadastrar veículo na garagem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <div>
            <h2 id="modal-title" className="modal-title">Entrada de Veículo na Garagem</h2>
            <p className="modal-subtitle">Registre o veículo e o tempo previsto de permanência</p>
          </div>
          <button 
            type="button" 
            className="btn-icon-close" 
            onClick={onClose}
            aria-label="Fechar janela"
          >
            <X size={20} />
          </button>
        </div>

        {/* Presets Rápidos */}
        <div className="presets-container">
          <span className="presets-label">
            <Sparkles size={14} /> Exemplos rápidos de entrada:
          </span>
          <div className="presets-buttons">
            {PRESET_CARS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                className="btn-preset"
                onClick={() => handleApplyPreset(preset)}
              >
                {preset.marca} {preset.modelo} ({preset.horas}h)
              </button>
            ))}
          </div>
        </div>

        {serverError && (
          <div className="alert-error">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="car-form" noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="marca" className="form-label">
                Marca <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <Car size={16} className="input-icon" />
                <input
                  id="marca"
                  name="marca"
                  type="text"
                  placeholder="Ex: Toyota, BMW, Ford"
                  value={formData.marca}
                  onChange={handleChange}
                  className={`form-input ${formErrors.marca ? 'input-error' : ''}`}
                  disabled={isSubmitting}
                />
              </div>
              {formErrors.marca && <span className="field-error">{formErrors.marca}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="modelo" className="form-label">
                Modelo <span className="required">*</span>
              </label>
              <input
                id="modelo"
                name="modelo"
                type="text"
                placeholder="Ex: Corolla Altis, Mustang"
                value={formData.modelo}
                onChange={handleChange}
                className={`form-input ${formErrors.modelo ? 'input-error' : ''}`}
                disabled={isSubmitting}
              />
              {formErrors.modelo && <span className="field-error">{formErrors.modelo}</span>}
            </div>
          </div>

          {/* Campo: Tempo de Permanência (em horas) */}
          <div className="form-group">
            <label htmlFor="horas" className="form-label">
              Tempo de Permanência (em horas) <span className="required">*</span>
            </label>
            <div className="input-with-icon">
              <Clock size={16} className="input-icon" />
              <input
                id="horas"
                name="horas"
                type="number"
                min="1"
                step="1"
                placeholder="Ex: 3"
                value={formData.horas}
                onChange={handleChange}
                className={`form-input ${formErrors.horas ? 'input-error' : ''}`}
                disabled={isSubmitting}
              />
            </div>
            {formErrors.horas && <span className="field-error">{formErrors.horas}</span>}
          </div>

          {/* Cálculo Automático em Tempo Real da Tarifa */}
          <div className="pricing-calculator-box">
            <div className="pricing-calc-header">
              <Calculator size={16} className="pricing-calc-icon" />
              <span className="pricing-calc-title">Cálculo de Tarifa do Estacionamento</span>
              <span className="pricing-rate-badge">R$ 5,00 / hora</span>
            </div>
            <div className="pricing-calc-body">
              <div className="pricing-formula">
                <span className="calc-hours">
                  {formData.horas ? `${formData.horas} hora${Number(formData.horas) > 1 ? 's' : ''}` : '0 horas'}
                </span>
                <span className="calc-operator">&times;</span>
                <span className="calc-rate">R$ 5,00</span>
                <span className="calc-equals">=</span>
                <span className="calc-result">
                  {formatCurrency(valorTotalCalculado)}
                </span>
              </div>
              <p className="pricing-note">
                O valor total é recalculado automaticamente com base na tarifa fixa da garagem.
              </p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="foto" className="form-label">
              URL da Foto do Veículo <span className="required">*</span>
            </label>
            <div className="input-with-icon">
              <ImageIcon size={16} className="input-icon" />
              <input
                id="foto"
                name="foto"
                type="url"
                placeholder="https://exemplo.com/foto-do-carro.jpg"
                value={formData.foto}
                onChange={handleChange}
                className={`form-input ${formErrors.foto ? 'input-error' : ''}`}
                disabled={isSubmitting}
              />
            </div>
            {formErrors.foto && <span className="field-error">{formErrors.foto}</span>}
          </div>

          {/* Pré-visualização da Imagem */}
          {formData.foto && (
            <div className="image-preview-container">
              <span className="preview-label">Pré-visualização:</span>
              <img
                src={formData.foto}
                alt="Prévia do veículo"
                className="image-preview"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
                onLoad={(e) => {
                  e.target.style.display = 'block';
                }}
              />
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              id="btn-submit-car"
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-small"></span>
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <Check size={18} />
                  <span>Registrar Entrada ({formatCurrency(valorTotalCalculado)})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
