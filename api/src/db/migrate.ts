import db from './database';
import { runSeed } from './seed';

export function runMigrations(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS medications (
      id           TEXT PRIMARY KEY,
      user_id      TEXT NOT NULL REFERENCES users(id),
      name         TEXT NOT NULL,
      dosage       TEXT NOT NULL,
      time         TEXT NOT NULL,
      fasting      INTEGER NOT NULL DEFAULT 0,
      with_food    INTEGER NOT NULL DEFAULT 0,
      instructions TEXT,
      notes        TEXT,
      category     TEXT,
      icon         TEXT NOT NULL DEFAULT '💊',
      active       INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS medication_logs (
      id            TEXT PRIMARY KEY,
      medication_id TEXT NOT NULL REFERENCES medications(id),
      user_id       TEXT NOT NULL REFERENCES users(id),
      date          TEXT NOT NULL,
      status        TEXT NOT NULL DEFAULT 'pending',
      taken_at      TEXT
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_medication_logs_med_date
      ON medication_logs(medication_id, date);
  `);

  runSeed();
}
