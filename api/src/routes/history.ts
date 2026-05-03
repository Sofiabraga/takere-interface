import { Router, Request, Response } from 'express';
import db from '../db/database';
import { authMiddleware } from '../middleware/auth';
import { MedicationRow, MedicationLogRow, DayHistoryResponse } from '../types';

const router = Router();
router.use(authMiddleware);

router.get('/', (req: Request, res: Response): void => {
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  const medications = db.prepare(
    'SELECT * FROM medications WHERE user_id = ? AND active = 1 ORDER BY time ASC'
  ).all(req.userId) as MedicationRow[];

  const placeholders = dates.map(() => '?').join(', ');
  const logs = db.prepare(
    `SELECT * FROM medication_logs WHERE user_id = ? AND date IN (${placeholders})`
  ).all(req.userId, ...dates) as MedicationLogRow[];

  const logMap = new Map<string, MedicationLogRow>();
  for (const log of logs) {
    logMap.set(`${log.medication_id}:${log.date}`, log);
  }

  const today = dates[dates.length - 1];

  const result: DayHistoryResponse[] = dates.map((date) => ({
    date,
    medications: medications.map((med) => {
      const log = logMap.get(`${med.id}:${date}`);
      let status: 'taken' | 'late' | 'pending';
      if (log) {
        status = log.status;
      } else if (date < today) {
        status = 'taken';
      } else {
        status = 'pending';
      }
      const entry: DayHistoryResponse['medications'][0] = {
        id: med.id,
        name: med.name,
        dosage: med.dosage,
        time: med.time,
        icon: med.icon,
        status,
      };
      if (med.category) entry.category = med.category;
      if (log?.taken_at) entry.takenAt = log.taken_at;
      return entry;
    }),
  }));

  res.json(result);
});

export default router;
