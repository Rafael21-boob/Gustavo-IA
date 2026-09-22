# Documentação Técnica da API — Sistema de Garagem & Estacionamento

Esta documentação detalha os endpoints da API REST Serverless desenvolvida para o gerenciamento de entrada, permanência e cobrança de veículos em pátio/garagem.

- **Base URL (Local):** `http://localhost:3000/api`
- **Base URL (Vercel):** `https://<seu-projeto>.vercel.app/api`
- **Headers Padrão:** `Content-Type: application/json`
- **Tarifa Base do Estacionamento:** **R$ 5,00 por hora** ($\text{Valor Total} = \text{horas} \times 5$).

---

## 1. Modelo de Dados (`Carro` / Estacionamento)

| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `marca` | String | Sim | Montadora do veículo (ex: "Toyota", "Ford") |
| `modelo` | String | Sim | Modelo do veículo (ex: "Corolla Altis", "Mustang Mach 1") |
| `horas` | Number | Sim | Tempo de permanência na garagem em horas (ex: `3`) |
| `valorTotal` | Number | Automático | Valor total cobrado em R$ calculado via $\text{horas} \times 5$ (ex: `15.0`) |
| `preco` | Number | Compatibilidade | Alias sincronizado com `valorTotal` |
| `foto` | String | Sim | URL pública da imagem do veículo |
| `createdAt` | Date | Automático | Data/hora de entrada na garagem |
| `updatedAt` | Date | Automático | Data/hora da última alteração de permanência |

---

## 2. Endpoints da API

### 2.1 Healthcheck & Status
- **Rota:** `GET /health` (ou `GET /api/health`)
- **Descrição:** Verifica se a API está online e se a conexão com o banco de dados está operante.
- **Resposta de Sucesso (`200 OK`):**
  ```json
  {
    "status": "ok",
    "uptime": 25.12,
    "timestamp": "2026-09-22T15:20:00.000Z",
    "database": "connected"
  }
  ```
- **Exemplo com `curl`:**
  ```bash
  curl -X GET http://localhost:3000/api/health
  ```

---

### 2.2 Listar Veículos no Pátio
- **Rota:** `GET /cars` (ou `GET /api/cars`)
- **Descrição:** Retorna a listagem de todos os veículos estacionados, com tempo acumulado em horas e valor total do estacionamento.
- **Resposta de Sucesso (`200 OK`):**
  ```json
  [
    {
      "_id": "6741ef0a5d4e123456789abc",
      "marca": "Porsche",
      "modelo": "911 Carrera S",
      "horas": 3,
      "valorTotal": 15,
      "preco": 15,
      "foto": "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80",
      "createdAt": "2026-09-22T10:00:00.000Z",
      "updatedAt": "2026-09-22T10:00:00.000Z"
    }
  ]
  ```
- **Exemplo com `curl`:**
  ```bash
  curl -X GET http://localhost:3000/api/cars
  ```

---

### 2.3 Registrar Entrada de Veículo (Cadastro)
- **Rota:** `POST /cars` (ou `POST /api/cars`)
- **Descrição:** Registra a entrada de um veículo informando o tempo previsto de permanência. A API calcula automaticamente o `valorTotal = horas * 5`.
- **Headers:** `Content-Type: application/json`
- **Corpo da Requisição (`JSON`):**
  ```json
  {
    "marca": "Honda",
    "modelo": "Civic Touring",
    "horas": 4,
    "foto": "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80"
  }
  ```
- **Resposta de Sucesso (`201 Created`):**
  ```json
  {
    "_id": "6741ef0a5d4e123456789abd",
    "marca": "Honda",
    "modelo": "Civic Touring",
    "horas": 4,
    "valorTotal": 20,
    "preco": 20,
    "foto": "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80",
    "createdAt": "2026-09-22T10:05:00.000Z",
    "updatedAt": "2026-09-22T10:05:00.000Z"
  }
  ```
- **Resposta de Erro — Validação (`400 Bad Request`):**
  ```json
  {
    "error": "Erro de validação: os campos marca, modelo, horas e foto são obrigatórios."
  }
  ```
- **Exemplo com `curl`:**
  ```bash
  curl -X POST http://localhost:3000/api/cars \
    -H "Content-Type: application/json" \
    -d '{
      "marca": "Honda",
      "modelo": "Civic Touring",
      "horas": 4,
      "foto": "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80"
    }'
  ```

---

### 2.4 Buscar Veículo por ID
- **Rota:** `GET /cars/:id` (ou `GET /api/cars/:id`)
- **Descrição:** Retorna os detalhes de permanência e cobrança do veículo.
- **Parâmetros de Rota:** `id` (ObjectId do MongoDB)
- **Resposta de Sucesso (`200 OK`):**
  ```json
  {
    "_id": "6741ef0a5d4e123456789abc",
    "marca": "Porsche",
    "modelo": "911 Carrera S",
    "horas": 3,
    "valorTotal": 15,
    "preco": 15,
    "foto": "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80",
    "createdAt": "2026-09-22T10:00:00.000Z",
    "updatedAt": "2026-09-22T10:00:00.000Z"
  }
  ```
- **Exemplo com `curl`:**
  ```bash
  curl -X GET http://localhost:3000/api/cars/6741ef0a5d4e123456789abc
  ```

---

### 2.5 Atualizar Tempo de Permanência por ID
- **Rota:** `PUT /cars/:id` (ou `PUT /api/cars/:id`)
- **Descrição:** Atualiza as horas de permanência ou dados do veículo, recalculando o valor total de acordo com a tarifa de R$ 5,00/h.
- **Parâmetros de Rota:** `id` (ObjectId do MongoDB)
- **Corpo da Requisição (`JSON`):**
  ```json
  {
    "horas": 6
  }
  ```
- **Resposta de Sucesso (`200 OK`):**
  ```json
  {
    "_id": "6741ef0a5d4e123456789abc",
    "marca": "Porsche",
    "modelo": "911 Carrera S",
    "horas": 6,
    "valorTotal": 30,
    "preco": 30,
    "foto": "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80",
    "createdAt": "2026-09-22T10:00:00.000Z",
    "updatedAt": "2026-09-22T12:00:00.000Z"
  }
  ```
- **Exemplo com `curl`:**
  ```bash
  curl -X PUT http://localhost:3000/api/cars/6741ef0a5d4e123456789abc \
    -H "Content-Type: application/json" \
    -d '{
      "horas": 6
    }'
  ```

---

### 2.6 Registrar Saída / Deletar Veículo por ID
- **Rota:** `DELETE /cars/:id` (ou `DELETE /api/cars/:id`)
- **Descrição:** Registra a liberação/saída do veículo do pátio e remove do sistema.
- **Parâmetros de Rota:** `id` (ObjectId do MongoDB)
- **Resposta de Sucesso (`200 OK`):**
  ```json
  {
    "message": "Carro removido com sucesso.",
    "id": "6741ef0a5d4e123456789abc"
  }
  ```
- **Exemplo com `curl`:**
  ```bash
  curl -X DELETE http://localhost:3000/api/cars/6741ef0a5d4e123456789abc
  ```

---

## 3. Resumo dos Códigos de Retorno HTTP

| Código | Significado | Aplicação |
| :--- | :--- | :--- |
| `200 OK` | Requisição bem-sucedida | Listagem de veículos no pátio, busca, atualização de horas e saída |
| `201 Created` | Veículo registrado | Entrada com cálculo de tarifa |
| `400 Bad Request` | Dados inválidos | Horas negativas, campos obrigatórios ausentes ou ID inválido |
| `404 Not Found` | Veículo não encontrado | ID inexistente no pátio |
| `500 Internal Server Error` | Erro interno | Falha de servidor ou de banco de dados |
