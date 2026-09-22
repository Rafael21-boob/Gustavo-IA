# Roadmap de Execução — Gerenciador de Carros (Full-Stack Serverless)

Controle de execução e progresso das etapas de desenvolvimento do projeto.

---

## 📌 Fase 1: Setup e Documentação Inicial
- [x] Criar arquivo `Roadmap.md` para checklist e controle de progresso.
- [x] Criar arquivo `Contexto.md` com status inicial, arquitetura e stack técnica.
- [x] Criar arquivo `api.md` com documentação técnica dos endpoints, schemas e exemplos com `curl`.

---

## 📌 Fase 2: Backend & Banco de Dados (Node.js + MongoDB + Vercel)
- [x] Configurar `package.json` raiz/api com dependências essenciais (`express`, `mongoose`, `cors`, `dotenv`).
- [x] Configurar conexão resiliente com MongoDB em `api/config/db.js` com cache de conexão para ambiente Serverless.
- [x] Criar Schema e Model Mongoose `Car` (`marca`, `modelo`, `preco`, `foto`, timestamps).
- [x] Implementar Controller de Carros (`carController.js`) com tratamento de exceções e validação de dados.
- [x] Implementar Rotas CRUD REST (`carRoutes.js`):
  - [x] `GET /api/cars` — Listar todos os carros.
  - [x] `POST /api/cars` — Cadastrar novo carro.
  - [x] `GET /api/cars/:id` — Buscar carro por ID.
  - [x] `PUT /api/cars/:id` — Atualizar carro por ID.
  - [x] `DELETE /api/cars/:id` — Remover carro por ID.
- [x] Habilitar middleware CORS para integração com o frontend.
- [x] Configurar `vercel.json` para roteamento serverless da API na Vercel.

---

## 📌 Fase 3: Frontend (React com Vite)
- [x] Inicializar projeto React com Vite no diretório `/frontend`.
- [x] Configurar variáveis de ambiente unificadas em 1 único `.env` na raiz (`.env.example` e `.env` com suporte a Backend e Frontend via Vite `envDir`).
- [x] Criar módulo de integração HTTP/API (`src/services/api.js`).
- [x] Criar componente de Card de Carro (`CarCard.jsx`) exibindo foto, marca, modelo e preço formatado (`R$`).
- [x] Criar componente de Formulário de Cadastro (`CarFormModal.jsx`) com validações e feedback de sucesso/erro.
- [x] Implementar tratamento completo de estados:
  - [x] Estado de **Carregando** (Skeleton / Spinner).
  - [x] Estado de **Erro** (Mensagem de falha + botão de retry).
  - [x] Estado de **Lista Vazia** (Mensagem amigável com CTA).
- [x] Estilização visual moderna, responsiva e agradável (CSS responsivo).

---

## 📌 Fase 4: Testes, Validação e Refinamento
- [x] Criar script de teste automatizado para os endpoints da API (`scripts/test-api.js`).
- [x] Executar e validar todos os fluxos CRUD da API com respostas HTTP corretas (200, 201, 400, 404).
- [x] Testar build do frontend com `npm run build`.
- [x] Validar compatibilidade entre documentação `api.md` e implementação real.
- [x] Revisão final de `Roadmap.md` e atualização conclusiva de `Contexto.md`.

---

## 📌 Fase 5: Regra de Negócio de Garagem / Estacionamento
- [x] Atualizar Schema e Model Mongoose (`Car.js`) com `horas`, `valorTotal` e cálculo de R$ 5,00/h.
- [x] Atualizar Controller (`carController.js`) com validação de horas e cálculo do valor total.
- [x] Atualizar formulário no frontend (`CarFormModal.jsx`) com input de horas e cálculo em tempo real.
- [x] Atualizar exibição nos cards (`CarCard.jsx`) exibindo tempo acumulado em horas e valor total do estacionamento.
- [x] Atualizar documentação técnica (`api.md`), `Contexto.md` e suíte de testes (`scripts/test-api.js`).
- [x] Executar testes automatizados e validar build do frontend.
