const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

/**
 * Trata as respostas da API e extrai erros padronizados
 */
async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage = (typeof data === 'object' && data?.error) 
      ? data.error 
      : (typeof data === 'string' && data ? data : `Erro HTTP ${response.status}`);
    throw new Error(errorMessage);
  }

  return data;
}

/**
 * Lista todos os carros
 */
export async function getCars() {
  const response = await fetch(`${BASE_URL}/cars`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  return handleResponse(response);
}

/**
 * Busca um carro por ID
 */
export async function getCarById(id) {
  const response = await fetch(`${BASE_URL}/cars/${id}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  return handleResponse(response);
}

/**
 * Cadastra um novo carro
 */
export async function createCar(carData) {
  const response = await fetch(`${BASE_URL}/cars`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(carData),
  });
  return handleResponse(response);
}

/**
 * Atualiza um carro existente
 */
export async function updateCar(id, carData) {
  const response = await fetch(`${BASE_URL}/cars/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(carData),
  });
  return handleResponse(response);
}

/**
 * Remove um carro por ID
 */
export async function deleteCar(id) {
  const response = await fetch(`${BASE_URL}/cars/${id}`, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json' },
  });
  return handleResponse(response);
}

/**
 * Checa a saúde da API
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    return handleResponse(response);
  } catch (error) {
    return { status: 'offline', error: error.message };
  }
}
