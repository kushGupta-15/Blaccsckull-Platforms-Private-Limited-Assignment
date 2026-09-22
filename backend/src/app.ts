import 'dotenv/config';
import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import connectDB from './config/database';
import indexRouter from './routes/index';
import authRouter from './routes/auth';
import competitionsRouter from './routes/competitions';
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
      if (allowedOrigins.includes(origin)) return callback(null, true);
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

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/v1', indexRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/competitions', competitionsRouter);
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

  app.listen(PORT, () => {
    console.info(`Server running on port ${PORT} [${process.env.NODE_ENV ?? 'development'}]`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
