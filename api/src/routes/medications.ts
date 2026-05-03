import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import db from '../db/database';
import { authMiddleware } from '../middleware/auth';
import { MedicationRow, MedicationResponse } from '../types';

const router = Router();
router.use(authMiddleware);

function getAutoStatus(scheduledTime: string): 'late' | 'pending' {
  const [h, m] = scheduledTime.split(':').map(Number);
  const now = new Date();
  const scheduledMinutes = h * 60 + m;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return nowMinutes - scheduledMinutes > 30 ? 'late' : 'pending';
}

function toMedicationResponse(
  row: MedicationRow & { status?: string; taken_at?: string | null }
): MedicationResponse {
  const status = (row.status as MedicationResponse['status']) ?? getAutoStatus(row.time);
  const resp: MedicationResponse = {
    id: row.id,
    name: row.name,
    dosage: row.dosage,
    time: row.time,
    status,
    fasting: row.fasting === 1,
    withFood: row.with_food === 1,
    icon: row.icon,
  };
  if (row.instructions) resp.instructions = row.instructions;
  if (row.notes) resp.notes = row.notes;
  if (row.category) resp.category = row.category;
  if (row.taken_at) resp.takenAt = row.taken_at;
  return resp;
}

router.get('/', (req: Request, res: Response): void => {
  const today = new Date().toISOString().slice(0, 10);

  const rows = db.prepare(`
    SELECT m.*, l.status, l.taken_at
    FROM medications m
    LEFT JOIN medication_logs l
      ON l.medication_id = m.id AND l.date = ?
    WHERE m.user_id = ? AND m.active = 1
    ORDER BY m.time ASC
  `).all(today, req.userId) as (MedicationRow & { status?: string; taken_at?: string | null })[];

  res.json(rows.map(toMedicationResponse));
});

router.patch('/:id/status', (req: Request, res: Response): void => {
  const { id } = req.params;
  const { status } = req.body as { status?: string };

  if (!status || !['taken', 'late', 'pending'].includes(status)) {
    res.status(400).json({ error: 'Status inválido' });
    return;
  }

  const med = db.prepare('SELECT id FROM medications WHERE id = ? AND user_id = ?').get(id, req.userId);
  if (!med) {
    res.status(404).json({ error: 'Medicamento não encontrado' });
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const takenAt = status === 'taken'
    ? `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    : null;

  db.prepare(`
    INSERT INTO medication_logs (id, medication_id, user_id, date, status, taken_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(medication_id, date) DO UPDATE SET status = excluded.status, taken_at = excluded.taken_at
  `).run(randomUUID(), id, req.userId, today, status, takenAt);

  res.json({ id, status, takenAt });
});

export default router;
