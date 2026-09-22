import express from 'express';
import cors from 'cors';
import carRoutes from './routes/carRoutes.js';
import { isConnected } from './config/db.js';

const app = express();

// Configuração de CORS para permitir requisições de qualquer origem (incluindo Frontend React)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middlewares para parsing de requisições
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de Healthcheck / Status
const healthHandler = (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: process.env.MONGODB_URI ? (isConnected() ? 'connected' : 'connecting/ready') : 'mock-mode',
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Mapeamento das rotas de Carros
app.use('/api/cars', carRoutes);
app.use('/cars', carRoutes);

// Rota raiz amigável
app.get('/', (req, res) => {
  res.json({
    message: 'API do Gerenciador de Carros Serverless',
    docs: '/api.md',
    endpoints: {
      health: '/api/health',
      cars: '/api/cars',
    },
  });
});

// Middleware para rotas não encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({ error: `Rota ${req.method} ${req.originalUrl} não encontrada.` });
});

// Middleware global de tratamento de erros (500)
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Erro interno do servidor.',
  });
});

export default app;
