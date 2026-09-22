# Contexto do Projeto — Sistema de Gerenciamento de Garagem & Estacionamento

## 1. Resumo Executivo
O projeto é um sistema web escalável de controle de pátio e garagem de veículos construído em arquitetura moderna e desacoplada:
- **Backend:** API REST desenvolvida em Node.js com Express e MongoDB (Mongoose), arquitetada especificamente para execução Serverless na plataforma Vercel (`/api`).
- **Frontend:** Single Page Application (SPA) construída em React utilizando Vite em `/frontend`, com cálculo automático em tempo real da tarifa do estacionamento.
- **Regra de Cobrança da Garagem:** Tarifa fixa de **R$ 5,00 por hora de permanência** ($\text{Valor Total} = \text{horas} \times 5$).
- **Controle & Governança:** Rastreabilidade contínua por meio de `Roadmap.md`, `Contexto.md` e `api.md`.

---

## 2. Decisões Técnicas e Arquitetura

### 2.1 Backend Serverless & Banco de Dados
- **Plataforma:** Vercel Serverless Functions (`/api/index.js` e `vercel.json`).
- **Schema Mongoose Atualizado (`Car.js`):**
  - `marca`: String (obrigatório, trim)
  - `modelo`: String (obrigatório, trim)
  - `horas`: Number (obrigatório, tempo de permanência em horas, min: 0)
  - `valorTotal`: Number (calculado automaticamente como $\text{horas} \times 5$)
  - `preco`: Number (mantido sincronizado com `valorTotal` para garantia de retrocompatibilidade)
  - `foto`: String / URL (obrigatório)
  - Timestamps automáticos (`createdAt`, `updatedAt`).
- **Gerenciador de Conexão com MongoDB:** Padrão singleton/cached promise (`global.mongoose`) em `api/config/db.js` para reaproveitamento em warm starts na Vercel, com fallback inteligente para mock memory store com dados de permanência realistas.
- **Validações HTTP:** `400 Bad Request` para horas negativas ou campos ausentes, `404 Not Found` para veículos liberados/inexistentes, `201 Created` para entradas registradas e `200 OK` para consultas, saídas e alterações.

### 2.2 Frontend React (Vite)
- **Tooling:** Vite com React e pacote de ícones `lucide-react`.
- **Formulário de Entrada (`CarFormModal.jsx`):**
  - Substituição do campo "Preço" pelo campo **"Tempo de Permanência (em horas)"** (input numérico).
  - **Cálculo Automático em Tempo Real:** Painel visual dinâmico com a fórmula $\text{Horas} \times \text{R\$\ 5,00} = \text{Total Estimado}$ (ex: 3 horas = R$ 15,00).
  - Presets rápidos de teste configurados com horas de permanência (2h, 4h, 6h).
- **Cards do Pátio (`CarCard.jsx`):**
  - Badge no topo da foto indicando o tempo de permanência em horas (`Clock`).
  - Painel de estatísticas com permanência e tarifa horária fixa (`R$ 5,00/h`).
  - Exibição destacada do **Valor Total do Estacionamento** formatado em Real brasileiro (`R$ 00,00`).
  - Botão de saída do veículo com diálogo de confirmação.
- **Gestão de Estados:** Skeletons animados no carregamento, aviso amigável de pátio vazio e tratamento de erros com retry.
- **Busca e Ordenação:** Filtros em tempo real por marca/modelo e ordenação por valor total ou mais horas no pátio.

---

## 3. Bibliotecas e Dependências

### Backend (`/package.json`)
- `express`: Framework HTTP Serverless.
- `mongoose`: ODM e validação no MongoDB.
- `cors`: Middleware CORS para requisições cross-origin.
- `dotenv`: Suporte a variáveis de ambiente.

### Frontend (`/frontend/package.json`)
- `react`, `react-dom`: Biblioteca de UI.
- `lucide-react`: Ícones de relógio, carro, cálculo e status.
- `vite`: Compilador e dev server ultrarrápido.

### 3.1 Variáveis de Ambiente & Arquitetura de Configuração
- **Arquivo Único `.env` na Raiz:** Toda a configuração da aplicação (Backend e Frontend) está centralizada em apenas 1 arquivo `.env` na raiz do projeto.
- **Integração Vite (`envDir`):** O frontend lê as variáveis de ambiente diretamente da raiz através de `envDir: path.resolve(__dirname, '..')` em `frontend/vite.config.js` (variáveis com prefixo `VITE_`, como `VITE_API_URL`).
- **Backend Resiliente:** `api/index.js` e `api/config/db.js` carregam o `.env` da raiz via `dotenv.config({ path: ... })` independentemente do diretório de execução.
- **Segurança & Versionamento:** `.gitignore` protege o `.env` local e `.env.example` serve como template versionado.

---

## 4. Estado Atual do Sistema
- **Status do Projeto:** 100% Concluído com todas as 5 fases do Roadmap finalizadas.
- **Validação de Testes:**
  - **API (`scripts/test-api.js`):** 9 testes executados com 100% de sucesso, validando criação com `horas: 3` -> `valorTotal: 15.0`, atualização para `horas: 5` -> `valorTotal: 25.0` e recusa de horas negativas com `400 Bad Request`.
  - **Frontend:** Build de produção gerado com sucesso via `npm run build` em 407ms.
  - **Documentação:** `api.md`, `Roadmap.md` e `Contexto.md` totalmente sincronizados e refletindo a regra de negócio de garagem.
