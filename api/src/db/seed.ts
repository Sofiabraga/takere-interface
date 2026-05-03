import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import db from './database';

const TODAY = new Date().toISOString().slice(0, 10);

function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

// ─── User 1: Paciente Teste — many chronic conditions, mixed adherence ───────

const USER1_ID = 'user-test-1';

const user1Medications = [
  { id: 'u1-1', name: 'Losartana',     dosage: '50mg — 1 comprimido',   time: '07:00', fasting: 1, with_food: 0, instructions: 'Tomar em jejum',                        notes: 'Evitar alimentos ricos em potássio', category: 'Pressão',    icon: '💊' },
  { id: 'u1-2', name: 'Metformina',    dosage: '500mg — 1 comprimido',  time: '08:00', fasting: 0, with_food: 1, instructions: 'Tomar com o café da manhã',               notes: null,                                 category: 'Diabetes',   icon: '💊' },
  { id: 'u1-3', name: 'Omeprazol',     dosage: '20mg — 1 cápsula',      time: '10:00', fasting: 1, with_food: 0, instructions: '30 minutos antes da refeição',            notes: 'Engolir inteiro, não mastigar',      category: 'Gástrico',   icon: '💊' },
  { id: 'u1-4', name: 'Atorvastatina', dosage: '10mg — 1 comprimido',   time: '12:00', fasting: 0, with_food: 1, instructions: 'Tomar com o almoço',                      notes: null,                                 category: 'Colesterol', icon: '💊' },
  { id: 'u1-5', name: 'Vitamina D',    dosage: '2000 UI — 1 cápsula',   time: '14:00', fasting: 0, with_food: 1, instructions: 'Tomar com a refeição para melhor absorção',notes: null,                                 category: 'Suplemento', icon: '🌟' },
  { id: 'u1-6', name: 'Aspirina',      dosage: '100mg — 1 comprimido',  time: '19:00', fasting: 0, with_food: 1, instructions: 'Tomar após jantar',                       notes: 'Não tomar com estômago vazio',       category: 'Cardíaco',   icon: '💊' },
  { id: 'u1-7', name: 'Clonazepam',    dosage: '0,5mg — 1 comprimido',  time: '22:00', fasting: 0, with_food: 0, instructions: 'Antes de dormir',                         notes: 'Não ingerir álcool',                 category: 'Neurológico',icon: '🌙' },
];

// Today: 2 taken, 2 late, 3 pending
const user1TodayLogs: Record<string, { status: string; taken_at: string | null }> = {
  'u1-1': { status: 'taken',   taken_at: '07:03' },
  'u1-2': { status: 'taken',   taken_at: '08:15' },
  'u1-3': { status: 'late',    taken_at: null },
  'u1-4': { status: 'late',    taken_at: null },
  'u1-5': { status: 'pending', taken_at: null },
  'u1-6': { status: 'pending', taken_at: null },
  'u1-7': { status: 'pending', taken_at: null },
};

// Past 6 days — varied adherence pattern (leaves gaps so history route fills with 'taken' default)
const user1PastLogs: { daysAgo: number; medId: string; status: string; taken_at: string | null }[] = [
  // day -6: missed Omeprazol and Vitamina D
  { daysAgo: 6, medId: 'u1-3', status: 'late',    taken_at: null },
  { daysAgo: 6, medId: 'u1-5', status: 'pending', taken_at: null },
  // day -5: missed Atorvastatina and Clonazepam
  { daysAgo: 5, medId: 'u1-4', status: 'late',    taken_at: null },
  { daysAgo: 5, medId: 'u1-7', status: 'pending', taken_at: null },
  // day -4: missed Omeprazol and Atorvastatina
  { daysAgo: 4, medId: 'u1-3', status: 'late',    taken_at: null },
  { daysAgo: 4, medId: 'u1-4', status: 'late',    taken_at: null },
  // day -3: perfect day — no overrides (all default to 'taken' in history route)
  // day -2: missed Aspirina and Clonazepam
  { daysAgo: 2, medId: 'u1-6', status: 'pending', taken_at: null },
  { daysAgo: 2, medId: 'u1-7', status: 'pending', taken_at: null },
  // day -1: missed Omeprazol
  { daysAgo: 1, medId: 'u1-3', status: 'late',    taken_at: null },
];

// ─── User 2: Carlos Mendes — post-surgery recovery, high adherence ────────────

const USER2_ID = 'user-test-2';

const user2Medications = [
  { id: 'u2-1', name: 'Amoxicilina',   dosage: '500mg — 1 cápsula',     time: '07:00', fasting: 0, with_food: 1, instructions: 'Tomar com o desjejum',                    notes: 'Completar o ciclo de 7 dias',        category: 'Antibiótico',icon: '💊' },
  { id: 'u2-2', name: 'Ibuprofeno',    dosage: '600mg — 1 comprimido',  time: '08:00', fasting: 0, with_food: 1, instructions: 'Tomar com água e comida',                  notes: 'Não exceder 3x ao dia',             category: 'Dor',        icon: '💊' },
  { id: 'u2-3', name: 'Dipirona',      dosage: '500mg — 1 comprimido',  time: '12:00', fasting: 0, with_food: 0, instructions: 'Somente se houver febre ou dor intensa',   notes: null,                                 category: 'Dor',        icon: '🌡️' },
  { id: 'u2-4', name: 'Vitamina C',    dosage: '1g — 1 comprimido ef.', time: '09:00', fasting: 0, with_food: 0, instructions: 'Dissolver em copo de água',                notes: null,                                 category: 'Suplemento', icon: '🍊' },
  { id: 'u2-5', name: 'Omeprazol',     dosage: '20mg — 1 cápsula',      time: '07:30', fasting: 1, with_food: 0, instructions: '30 min antes do café',                     notes: 'Protetor gástrico do antibiótico',   category: 'Gástrico',   icon: '💊' },
];

// Today: all taken so far except evening med
const user2TodayLogs: Record<string, { status: string; taken_at: string | null }> = {
  'u2-1': { status: 'taken',   taken_at: '07:05' },
  'u2-2': { status: 'taken',   taken_at: '08:00' },
  'u2-3': { status: 'taken',   taken_at: '12:10' },
  'u2-4': { status: 'taken',   taken_at: '09:15' },
  'u2-5': { status: 'taken',   taken_at: '07:25' },
};

// Past 6 days — very high adherence (only 1 miss on day -3)
const user2PastLogs: { daysAgo: number; medId: string; status: string; taken_at: string | null }[] = [
  { daysAgo: 3, medId: 'u2-3', status: 'pending', taken_at: null },
];

// ─── User 3: Ana Lima — young adult, supplements + contraceptive, low adherence ─

const USER3_ID = 'user-test-3';

const user3Medications = [
  { id: 'u3-1', name: 'Anticoncepcional', dosage: '1 comprimido',           time: '21:00', fasting: 0, with_food: 0, instructions: 'Tomar no mesmo horário todos os dias',    notes: 'Não atrasar mais de 12h',            category: 'Hormonal',   icon: '💊' },
  { id: 'u3-2', name: 'Vitamina D',       dosage: '2000 UI — 1 cápsula',    time: '08:00', fasting: 0, with_food: 1, instructions: 'Tomar com o café da manhã',                notes: null,                                 category: 'Suplemento', icon: '🌟' },
  { id: 'u3-3', name: 'Ferro',            dosage: '40mg — 1 comprimido',    time: '09:00', fasting: 1, with_food: 0, instructions: 'Tomar em jejum com suco de laranja',        notes: 'Evitar laticínios 2h antes e depois',category: 'Suplemento', icon: '⚙️' },
  { id: 'u3-4', name: 'Ômega 3',          dosage: '1g — 1 cápsula',         time: '13:00', fasting: 0, with_food: 1, instructions: 'Tomar com o almoço',                        notes: null,                                 category: 'Suplemento', icon: '🐟' },
  { id: 'u3-5', name: 'Melatonina',       dosage: '0,21mg — 1 comprimido',  time: '22:00', fasting: 0, with_food: 0, instructions: '30 min antes de dormir',                    notes: null,                                 category: 'Sono',       icon: '🌙' },
];

// Today: inconsistent — took anticoncepcional late, forgot supplements
const user3TodayLogs: Record<string, { status: string; taken_at: string | null }> = {
  'u3-1': { status: 'pending', taken_at: null },
  'u3-2': { status: 'late',    taken_at: null },
  'u3-3': { status: 'late',    taken_at: null },
  'u3-4': { status: 'pending', taken_at: null },
  'u3-5': { status: 'pending', taken_at: null },
};

// Past 6 days — low adherence pattern
const user3PastLogs: { daysAgo: number; medId: string; status: string; taken_at: string | null }[] = [
  { daysAgo: 6, medId: 'u3-2', status: 'pending', taken_at: null },
  { daysAgo: 6, medId: 'u3-3', status: 'pending', taken_at: null },
  { daysAgo: 6, medId: 'u3-4', status: 'pending', taken_at: null },
  { daysAgo: 5, medId: 'u3-2', status: 'late',    taken_at: null },
  { daysAgo: 5, medId: 'u3-3', status: 'pending', taken_at: null },
  { daysAgo: 4, medId: 'u3-2', status: 'pending', taken_at: null },
  { daysAgo: 4, medId: 'u3-4', status: 'pending', taken_at: null },
  { daysAgo: 4, medId: 'u3-5', status: 'pending', taken_at: null },
  { daysAgo: 3, medId: 'u3-2', status: 'late',    taken_at: null },
  { daysAgo: 3, medId: 'u3-3', status: 'pending', taken_at: null },
  { daysAgo: 3, medId: 'u3-4', status: 'pending', taken_at: null },
  { daysAgo: 2, medId: 'u3-3', status: 'pending', taken_at: null },
  { daysAgo: 2, medId: 'u3-4', status: 'pending', taken_at: null },
  { daysAgo: 1, medId: 'u3-2', status: 'late',    taken_at: null },
  { daysAgo: 1, medId: 'u3-3', status: 'pending', taken_at: null },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function seedUser(
  userId: string,
  name: string,
  email: string,
  password: string,
  medications: typeof user1Medications,
  todayLogs: Record<string, { status: string; taken_at: string | null }>,
  pastLogs: { daysAgo: number; medId: string; status: string; taken_at: string | null }[]
): void {
  const passwordHash = bcrypt.hashSync(password, 10);

  const insertUser = db.prepare(
    'INSERT OR IGNORE INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)'
  );
  const insertMed = db.prepare(`
    INSERT OR IGNORE INTO medications (id, user_id, name, dosage, time, fasting, with_food, instructions, notes, category, icon)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertLog = db.prepare(`
    INSERT OR IGNORE INTO medication_logs (id, medication_id, user_id, date, status, taken_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const seedAll = db.transaction(() => {
    const result = insertUser.run(userId, name, email, passwordHash);
    if (result.changes === 0) return; // user already existed, skip

    for (const med of medications) {
      insertMed.run(
        med.id, userId, med.name, med.dosage, med.time,
        med.fasting, med.with_food, med.instructions, med.notes, med.category, med.icon
      );
      const log = todayLogs[med.id];
      insertLog.run(randomUUID(), med.id, userId, TODAY, log.status, log.taken_at);
    }
    for (const entry of pastLogs) {
      insertLog.run(randomUUID(), entry.medId, userId, dateStr(entry.daysAgo), entry.status, entry.taken_at);
    }
    console.log(`Seed data inserted (${email} / ${password})`);
  });

  seedAll();
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export function runSeed(): void {
  seedUser(USER1_ID, 'Paciente Teste',  'test@test.com',   'test123',  user1Medications, user1TodayLogs, user1PastLogs);
  seedUser(USER2_ID, 'Carlos Mendes',   'carlos@test.com', 'carlos123',user2Medications, user2TodayLogs, user2PastLogs);
  seedUser(USER3_ID, 'Ana Lima',        'ana@test.com',    'ana123',   user3Medications, user3TodayLogs, user3PastLogs);
}
