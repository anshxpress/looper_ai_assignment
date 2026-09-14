/**
 * Seed script — loads transactions (1).json into MongoDB.
 * Run with: npm run seed
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { Transaction } from '../models/Transaction';
import { User } from '../models/User';

dotenv.config();

async function seed() {
  const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/looper_admin';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  // ── Seed transactions ──────────────────────────────────────────────────────
  const jsonPath = path.resolve(__dirname, '../../../transactions (1).json');
  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as unknown[];
  await Transaction.deleteMany({});
  await Transaction.insertMany(raw);
  console.log(`✅ Inserted ${raw.length} transactions`);

  // ── Seed users ─────────────────────────────────────────────────────────────
  await User.deleteMany({});
  await User.insertMany([
    {
      email: 'admin@looper.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      name: 'John Doe',
      role: 'admin',
    },
    {
      email: 'viewer@looper.com',
      passwordHash: await bcrypt.hash('viewer123', 10),
      name: 'Jane Smith',
      role: 'viewer',
    },
  ]);
  console.log('✅ Seeded 2 users');

  await mongoose.disconnect();
  console.log('🌱 Seed complete!');
}

seed().catch((err) => { console.error(err); process.exit(1); });
