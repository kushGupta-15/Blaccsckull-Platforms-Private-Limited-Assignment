import 'dotenv/config';
import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import connectDB from './config/database';
import indexRouter from './routes/index';
import authRouter from './routes/auth';
import competitionsRouter from './routes/competitions';
import submissionsRouter from './routes/submissions';
import usersRouter from './routes/users';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { seedCompetitions, getOrCreateSeedHost } from './services/competitionService';

const app: Application = express();
const PORT = process.env.PORT ?? 5000;

// ── Security & Parsing Middleware ──────────────────────────────────────────────
app.use(helmet());

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      // Allow if wildcard configured or no restricted origins set
      if (allowedOrigins.length === 0 || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Root Endpoint ──────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Feedants Backend API is live!',
    version: '1.0.0',
    endpoints: {
      health: '/api/v1/health',
      competitions: '/api/v1/competitions',
      submissions: '/api/v1/submissions',
      auth: '/api/v1/auth',
    },
  });
});

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/v1', indexRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/competitions', competitionsRouter);
app.use('/api/v1/submissions', submissionsRouter);
app.use('/api/v1/users', usersRouter);

// ── 404 & Error Handlers ───────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Start Server ───────────────────────────────────────────────────────────────
const startServer = async (): Promise<void> => {
  await connectDB();

  // Auto-seed on first boot (skips if data already exists)
  const hostId = await getOrCreateSeedHost();
  await seedCompetitions(hostId);

  const server = app.listen(PORT, () => {
    console.info(`Server running on port ${PORT} [${process.env.NODE_ENV ?? 'development'}]`);
  });

  const handleShutdown = async (signal: string) => {
    console.info(`${signal} signal received: closing HTTP server`);
    server.close(async () => {
      console.info('HTTP server closed.');
      try {
        const mongoose = await import('mongoose');
        await mongoose.default.connection.close();
        console.info('MongoDB connection closed.');
        process.exit(0);
      } catch (err) {
        console.error('Error during database disconnection:', err);
        process.exit(1);
      }
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
