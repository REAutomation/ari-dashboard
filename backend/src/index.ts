/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Main application entry point
 */

import dotenv from 'dotenv';
import express, { Express } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import * as fs from 'fs';
import * as path from 'path';
import healthRouter from './api/health';
import widgetsRouter from './api/widgets';
import filesRouter from './api/files';
import statusRouter from './api/status';
import feedRouter from './api/feed';
import presetsRouter from './api/presets';
import { socketService } from './services/socketService';
import { PersistenceService } from './services/persistenceService';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:8080'];

const corsOptions = {
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Ensure data directory exists for JSON persistence
PersistenceService.ensureDataDir();

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`[Server] Created uploads directory: ${uploadsDir}`);
}

app.use('/health', healthRouter);
app.use('/api/widgets', widgetsRouter);
app.use('/api/files', filesRouter);
app.use('/api/status', statusRouter);
app.use('/api/feed', feedRouter);
app.use('/api/presets', presetsRouter);

const httpServer = createServer(app);

socketService.init(httpServer, CORS_ORIGIN);

httpServer.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`Ari Dashboard Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS Origins: ${CORS_ORIGIN.join(', ')}`);
  console.log('='.repeat(60));
});
