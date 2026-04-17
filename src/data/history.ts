import { mockMedications, Medication, MedicationStatus } from './medications';

export interface DayHistory {
  date: Date;
  medications: HistoryMedication[];
}

export interface HistoryMedication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  icon: string;
  category?: string;
  status: MedicationStatus;
  takenAt?: string;
}

function buildDay(daysAgo: number, overrides: Partial<Record<string, MedicationStatus>>): DayHistory {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(0, 0, 0, 0);

  const medications: HistoryMedication[] = mockMedications.map((m) => ({
    id: m.id,
    name: m.name,
    dosage: m.dosage,
    time: m.time,
    icon: m.icon,
    category: m.category,
    status: overrides[m.id] ?? 'taken',
    takenAt: overrides[m.id] === 'late' || overrides[m.id] === 'pending' ? undefined : m.takenAt ?? m.time,
  }));

  return { date, medications };
}

export const weekHistory: DayHistory[] = [
  buildDay(6, { '3': 'late', '5': 'pending' }),
  buildDay(5, { '4': 'late', '7': 'pending' }),
  buildDay(4, { '3': 'late', '4': 'late' }),
  buildDay(3, {}),
  buildDay(2, { '6': 'pending', '7': 'pending' }),
  buildDay(1, { '3': 'late' }),
  buildDay(0, { '3': 'late', '4': 'late', '5': 'pending', '6': 'pending', '7': 'pending' }),
];

export function getAdherence(day: DayHistory): number {
  const taken = day.medications.filter((m) => m.status === 'taken').length;
  return day.medications.length > 0 ? taken / day.medications.length : 0;
}

export function getWeekAdherence(): number {
  const all = weekHistory.flatMap((d) => d.medications);
  const taken = all.filter((m) => m.status === 'taken').length;
  return all.length > 0 ? taken / all.length : 0;
}
