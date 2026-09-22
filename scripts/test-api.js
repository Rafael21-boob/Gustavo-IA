import http from 'http';
import app from '../api/app.js';

const PORT = 3099;
const BASE_URL = `http://127.0.0.1:${PORT}/api`;

let server;
let passedCount = 0;
let failedCount = 0;

function logTest(name, passed, detail = '') {
  if (passed) {
    passedCount++;
    console.log(`  ✅ [PASS] ${name}`);
  } else {
    failedCount++;
    console.error(`  ❌ [FAIL] ${name} ${detail ? `(${detail})` : ''}`);
  }
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
  });

  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch (e) {
    body = text;
  }

  return { status: res.status, body };
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 INICIANDO SUÍTE DE TESTES AUTOMATIZADOS DA API');
  console.log('======================================================\n');

  // Inicializa servidor de teste
  await new Promise((resolve) => {
    server = app.listen(PORT, () => {
      console.log(`[TEST SERVER] Rodando na porta ${PORT}`);
      resolve();
    });
  });

  let createdCarId = null;

  try {
    // 1. Healthcheck
    console.log('\n▶ Testando Healthcheck:');
    const health = await request('/health');
    logTest('GET /api/health deve responder 200 com status "ok"', 
      health.status === 200 && health.body.status === 'ok',
      `Status recebido: ${health.status}`
    );

    // 2. Listagem inicial de carros
    console.log('\n▶ Testando Listagem de Carros:');
    const listRes = await request('/cars');
    logTest('GET /api/cars deve retornar 200 e um array de veículos', 
      listRes.status === 200 && Array.isArray(listRes.body),
      `Status: ${listRes.status}`
    );

    // 3. Cadastro com Sucesso (POST /api/cars) e Cálculo de Tarifa (horas * 5)
    console.log('\n▶ Testando Cadastro de Novo Carro na Garagem:');
    const newCarPayload = {
      marca: 'Ferrari',
      modelo: 'SF90 Stradale',
      horas: 3, // 3 horas de permanência
      foto: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80',
    };

    const createRes = await request('/cars', {
      method: 'POST',
      body: JSON.stringify(newCarPayload),
    });

    const isCreated = createRes.status === 201 && 
      createRes.body._id && 
      createRes.body.marca === 'Ferrari' && 
      createRes.body.horas === 3 &&
      createRes.body.valorTotal === 15; // 3h * R$ 5,00 = R$ 15,00

    logTest('POST /api/cars deve criar registro e calcular valorTotal = horas * 5 (3h = R$ 15,00)', 
      isCreated, 
      `Status: ${createRes.status}, valorTotal: ${createRes.body?.valorTotal}`
    );

    if (isCreated) {
      createdCarId = createRes.body._id;
    }

    // 4. Validação de Erro ao Cadastrar com Horas Inválidas (POST /api/cars)
    console.log('\n▶ Testando Validações de Payload (POST /api/cars):');
    const invalidPayload = {
      marca: 'Marca Sem Modelo',
      horas: -5, // Horas negativas não permitidas
    };
    const badPostRes = await request('/cars', {
      method: 'POST',
      body: JSON.stringify(invalidPayload),
    });
    logTest('POST /api/cars com dados inválidos ou horas negativas deve retornar 400 Bad Request', 
      badPostRes.status === 400 && (badPostRes.body.error !== undefined),
      `Status: ${badPostRes.status}`
    );

    // 5. Busca por ID (GET /api/cars/:id)
    console.log('\n▶ Testando Busca por ID:');
    if (createdCarId) {
      const getByIdRes = await request(`/cars/${createdCarId}`);
      logTest('GET /api/cars/:id deve retornar o carro correspondente e status 200',
        getByIdRes.status === 200 && getByIdRes.body._id === createdCarId && getByIdRes.body.horas === 3,
        `Status: ${getByIdRes.status}`
      );
    }

    // 6. Atualização de Carro e Recálculo de Tarifa (PUT /api/cars/:id)
    console.log('\n▶ Testando Atualização de Horas e Recálculo da Tarifa:');
    if (createdCarId) {
      const updatePayload = {
        modelo: 'SF90 Spider Assetto Fiorano',
        horas: 5, // Aumenta para 5 horas -> 5 * 5 = 25
      };
      const putRes = await request(`/cars/${createdCarId}`, {
        method: 'PUT',
        body: JSON.stringify(updatePayload),
      });

      const isUpdated = putRes.status === 200 && 
        putRes.body.horas === 5 && 
        putRes.body.valorTotal === 25; // 5h * 5 = R$ 25,00

      logTest('PUT /api/cars/:id deve recalcular valorTotal ao alterar horas (5h = R$ 25,00)',
        isUpdated,
        `Status: ${putRes.status}, valorTotal: ${putRes.body?.valorTotal}`
      );
    }

    // 7. Remoção de Carro (DELETE /api/cars/:id)
    console.log('\n▶ Testando Remoção de Carro:');
    if (createdCarId) {
      const deleteRes = await request(`/cars/${createdCarId}`, {
        method: 'DELETE',
      });
      logTest('DELETE /api/cars/:id deve remover o carro e retornar 200',
        deleteRes.status === 200 && deleteRes.body.id === createdCarId,
        `Status: ${deleteRes.status}`
      );

      // 8. Verificação de ID Deletado (404)
      const getDeletedRes = await request(`/cars/${createdCarId}`);
      logTest('GET /api/cars/:id para item deletado deve retornar 404 Not Found',
        getDeletedRes.status === 404,
        `Status: ${getDeletedRes.status}`
      );
    }

    // 9. Rota Inexistente (404)
    console.log('\n▶ Testando Rota Inexistente:');
    const notFoundRes = await request('/rota-fantasma-inexistente');
    logTest('GET rota desconhecida deve retornar 404 Not Found',
      notFoundRes.status === 404,
      `Status: ${notFoundRes.status}`
    );

  } catch (error) {
    console.error('❌ Erro inesperado durante execução dos testes:', error);
    failedCount++;
  } finally {
    // Encerra servidor HTTP de teste
    server.close(() => {
      console.log('\n======================================================');
      console.log(`📊 RESULTADO FINAL DOS TESTES:`);
      console.log(`   Sucessos: ${passedCount}`);
      console.log(`   Falhas:   ${failedCount}`);
      console.log('======================================================\n');

      process.exitCode = failedCount > 0 ? 1 : 0;
    });
  }
}

runTests();
