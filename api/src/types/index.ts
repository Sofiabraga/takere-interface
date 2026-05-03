export interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface MedicationRow {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  time: string;
  fasting: number;
  with_food: number;
  instructions: string | null;
  notes: string | null;
  category: string | null;
  icon: string;
  active: number;
}

export interface MedicationLogRow {
  id: string;
  medication_id: string;
  user_id: string;
  date: string;
  status: 'taken' | 'late' | 'pending';
  taken_at: string | null;
}

export interface MedicationResponse {
  id: string;
  name: string;
  dosage: string;
  time: string;
  status: 'taken' | 'late' | 'pending';
  fasting: boolean;
  withFood: boolean;
  instructions?: string;
  notes?: string;
  category?: string;
  icon: string;
  takenAt?: string;
}

export interface DayHistoryResponse {
  date: string;
  medications: {
    id: string;
    name: string;
    dosage: string;
    time: string;
    icon: string;
    category?: string;
    status: 'taken' | 'late' | 'pending';
    takenAt?: string;
  }[];
}
