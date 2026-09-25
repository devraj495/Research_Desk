import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { runResearchAgent } from './lib/agent/graph.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;
const scrypt = promisify(scryptCallback);

let usersCollection = null;

async function connectToMongo() {
  if (usersCollection) return usersCollection;

  if (!MONGO_URI) {
    return null;
  }

  try {
    const { MongoClient } = await import('mongodb');
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('researchdesk');
    usersCollection = db.collection('users');
    console.log('✅ MongoDB connected');
    return usersCollection;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    return null;
  }
}

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://frontend-one-teal-bsw9cmvet7.vercel.app',
    'https://investementresearch.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body || {};

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !isValidPassword(password)) {
    return res.status(400).json({ error: 'Enter a valid email and a password of at least 8 characters.' });
  }

  try {
    const collection = await connectToMongo();

    if (!collection) {
      return res.status(503).json({ error: 'MongoDB is not configured.' });
    }

    const existing = await collection.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'User already exists.' });
    }

    const user = {
      id: randomUUID(),
      name: name?.trim() || 'User',
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    await collection.insertOne(user);

    return res.status(201).json({
      message: 'User created successfully.',
      user: { id: user.id, name: user.name, email: user.email },
      token: randomUUID(),
    });
  } catch (err) {
    console.error('Signup failed:', err);
    return res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const collection = await connectToMongo();

    if (!collection) {
      return res.status(503).json({ error: 'MongoDB is not configured.' });
    }

    const user = await collection.findOne({ email: normalizedEmail });
    if (!user || !(await verifyPassword(password, user.passwordHash || user.password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Upgrade legacy demonstration accounts on their first successful login.
    if (!user.passwordHash) {
      await collection.updateOne(
        { _id: user._id },
        { $set: { passwordHash: await hashPassword(password) }, $unset: { password: '' } }
      );
    }

    return res.status(200).json({
      message: 'Login successful.',
      user: { id: user.id, name: user.name, email: user.email },
      token: randomUUID(),
    });
  } catch (err) {
    console.error('Login failed:', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

app.post('/api/research', async (req, res) => {
  const { companyName } = req.body || {};

  const normalizedCompanyName = normalizeCompanyName(companyName);
  if (!normalizedCompanyName) {
    return res.status(400).json({ error: "Enter a company name or ticker (up to 120 characters)." });
  }

  try {
    const result = await runResearchAgent(normalizedCompanyName);
    return res.status(200).json({
      companyName: result.companyName,
      decision: result.decision,
      analysis: result.analysis,
      steps: result.steps,
      generatedAt: new Date().toISOString(),
      structuredFinancials: result.structuredFinancials,
      sources: {
        news: result.newsResults?.map((r) => ({ title: r.title, url: r.url })) || [],
        financials: result.financialResults?.map((r) => ({ title: r.title, url: r.url })) || [],
      },
    });
  } catch (err) {
    console.error("Agent run failed:", err);
    return res.status(500).json({ error: "Research could not be completed right now. Please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});

function normalizeEmail(value) {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function isValidPassword(value) {
  return typeof value === 'string' && value.length >= 8 && value.length <= 200;
}

function normalizeCompanyName(value) {
  if (typeof value !== 'string') return null;
  const name = value.trim().replace(/\s+/g, ' ');
  return name && name.length <= 120 ? name : null;
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${Buffer.from(derivedKey).toString('hex')}`;
}

async function verifyPassword(password, storedValue) {
  if (typeof storedValue !== 'string' || typeof password !== 'string') return false;
  const [algorithm, salt, hash] = storedValue.split('$');

  if (algorithm !== 'scrypt' || !salt || !hash) {
    // Supports existing local demo accounts while allowing a safe migration.
    const candidate = Buffer.from(password);
    const expected = Buffer.from(storedValue);
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  }

  const derivedKey = await scrypt(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return expected.length === derivedKey.length && timingSafeEqual(expected, derivedKey);
}
