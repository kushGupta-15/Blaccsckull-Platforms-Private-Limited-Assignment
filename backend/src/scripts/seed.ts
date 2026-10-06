/**
 * Standalone seed script.
 * Run with: npx ts-node-dev --transpile-only src/scripts/seed.ts
 */
import 'dotenv/config';
import connectDB from '../config/database';
import { seedCompetitions, getOrCreateSeedHost } from '../services/competitionService';
import mongoose from 'mongoose';

(async () => {
  await connectDB();
  const hostId = await getOrCreateSeedHost();
  await seedCompetitions(hostId);
  await mongoose.disconnect();
  console.info('Seed complete.');
  process.exit(0);
})().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
