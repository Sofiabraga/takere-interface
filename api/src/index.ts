import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { runMigrations } from './db/migrate';
import authRouter from './routes/auth';
import medicationsRouter from './routes/medications';
import historyRouter from './routes/history';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.path} → ${res.statusCode} (${ms}ms)`);
  });
  next();
});

runMigrations();

app.use('/auth', authRouter);
app.use('/medications', medicationsRouter);
app.use('/history', historyRouter);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Takere API running on http://localhost:${PORT}`);
});
