import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import CarCard from './components/CarCard';
import CarFormModal from './components/CarFormModal';
import LoadingState from './components/States/LoadingState';
import ErrorState from './components/States/ErrorState';
import EmptyState from './components/States/EmptyState';
import { getCars, createCar, deleteCar, checkHealth } from './services/api';
import { Search, SlidersHorizontal, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import './App.css';

export default function App() {
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState({ status: 'checking' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'price-asc', 'price-desc', 'hours-desc'
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [carsData, healthData] = await Promise.all([
        getCars(),
        checkHealth(),
      ]);
      setCars(Array.isArray(carsData) ? carsData : []);
      setApiStatus(healthData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err.message || 'Falha ao conectar com o servidor da API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCar = async (carData) => {
    const created = await createCar(carData);
    setCars((prev) => [created, ...prev]);
    showToast('success', `Veículo "${created.marca} ${created.modelo}" registrado no pátio com sucesso!`);
  };

  const handleDeleteCar = async (id) => {
    try {
      await deleteCar(id);
      setCars((prev) => prev.filter((car) => car._id !== id));
      showToast('success', 'Saída do veículo confirmada com sucesso!');
    } catch (err) {
      showToast('error', `Erro ao dar saída no veículo: ${err.message}`);
    }
  };

  // Filtragem e ordenação dos veículos
  const filteredAndSortedCars = useMemo(() => {
    let result = cars.filter((car) => {
      if (!searchQuery.trim()) return true;
      const term = searchQuery.toLowerCase();
      const matchMarca = car.marca?.toLowerCase().includes(term);
      const matchModelo = car.modelo?.toLowerCase().includes(term);
      return matchMarca || matchModelo;
    });

    if (sortBy === 'price-asc') {
      result.sort((a, b) => {
        const valA = a.valorTotal !== undefined ? a.valorTotal : (a.horas ? a.horas * 5 : a.preco);
        const valB = b.valorTotal !== undefined ? b.valorTotal : (b.horas ? b.horas * 5 : b.preco);
        return Number(valA) - Number(valB);
      });
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => {
        const valA = a.valorTotal !== undefined ? a.valorTotal : (a.horas ? a.horas * 5 : a.preco);
        const valB = b.valorTotal !== undefined ? b.valorTotal : (b.horas ? b.horas * 5 : b.preco);
        return Number(valB) - Number(valA);
      });
    } else if (sortBy === 'hours-desc') {
      result.sort((a, b) => Number(b.horas || 0) - Number(a.horas || 0));
    } else {
      // Recentes primeiro
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return result;
  }, [cars, searchQuery, sortBy]);

  return (
    <div className="app-layout">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification toast-${toast.type}`} role="status">
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Principal */}
      <Navbar
        onOpenNewModal={() => setIsModalOpen(true)}
        totalCars={cars.length}
        apiStatus={apiStatus}
      />

      {/* Conteúdo Principal */}
      <main className="main-content">
        <div className="content-container">
          {/* Barra de Filtros e Busca */}
          <div className="toolbar-section">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Pesquisar veículo por marca ou modelo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="btn-clear-search"
                  onClick={() => setSearchQuery('')}
                  title="Limpar pesquisa"
                >
                  &times;
                </button>
              )}
            </div>

            <div className="toolbar-controls">
              <div className="select-wrapper">
                <SlidersHorizontal size={15} className="select-icon" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="recent">Entradas Recentes</option>
                  <option value="price-asc">Menor Valor Total</option>
                  <option value="price-desc">Maior Valor Total</option>
                  <option value="hours-desc">Mais Horas no Pátio</option>
                </select>
              </div>

              <button
                type="button"
                className="btn-refresh"
                onClick={loadData}
                disabled={isLoading}
                title="Atualizar lista"
                aria-label="Atualizar lista"
              >
                <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
              </button>
            </div>
          </div>

          {/* Área de Visualização dos Estados */}
          {isLoading && <LoadingState />}

          {!isLoading && error && (
            <ErrorState message={error} onRetry={loadData} />
          )}

          {!isLoading && !error && cars.length === 0 && (
            <EmptyState onOpenNewModal={() => setIsModalOpen(true)} />
          )}

          {!isLoading && !error && cars.length > 0 && filteredAndSortedCars.length === 0 && (
            <div className="no-search-results">
              <p>Nenhum veículo encontrado para a busca "<strong>{searchQuery}</strong>".</p>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setSearchQuery('')}
              >
                Limpar Busca
              </button>
            </div>
          )}

          {!isLoading && !error && filteredAndSortedCars.length > 0 && (
            <section className="cars-grid" aria-label="Veículos estacionados no pátio">
              {filteredAndSortedCars.map((car) => (
                <CarCard
                  key={car._id}
                  car={car}
                  onDelete={handleDeleteCar}
                />
              ))}
            </section>
          )}
        </div>
      </main>

      {/* Modal de Cadastro de Entrada na Garagem */}
      <CarFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCar}
      />

      {/* Footer */}
      <footer className="app-footer">
        <p>Gusta Motors &copy; 2026 — Gestão Inteligente de Garagem & Estacionamento (Tarifa R$ 5,00/h)</p>
      </footer>
    </div>
  );
}
