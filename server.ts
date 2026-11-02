import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractProfile, generateSparkSession, matchProfiles } from './src/server/geminiApi';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: '10mb' }));

app.post('/api/profile/extract', async (req, res) => {
  const result = await extractProfile(req.body);
  res.status(result.statusCode).json(result.body);
});

app.post('/api/match', async (req, res) => {
  const result = await matchProfiles(req.body);
  res.status(result.statusCode).json(result.body);
});

app.post('/api/spark-session', async (req, res) => {
  const result = await generateSparkSession(req.body);
  res.status(result.statusCode).json(result.body);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      try {
        const rawIndexHtml = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        const template = await vite.transformIndexHtml(req.originalUrl, rawIndexHtml);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (error) {
        vite.ssrFixStacktrace(error as Error);
        next(error);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

void startServer();
