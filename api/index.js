import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega o único .env localizado na raiz do projeto
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import app from './app.js';

const PORT = process.env.PORT || 3000;

// Se for executado diretamente no terminal (Node local), inicia o servidor HTTP
// Na Vercel, o Express `app` é exportado como Serverless Function
if (process.env.NODE_ENV !== 'test') {
  const isDirectRun = !process.env.VERCEL;
  if (isDirectRun) {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend rodando em http://localhost:${PORT}`);
      console.log(`📄 Healthcheck disponível em http://localhost:${PORT}/api/health`);
      console.log(`🚗 CRUD de carros disponível em http://localhost:${PORT}/api/cars`);
    });
  }
}

export default app;
