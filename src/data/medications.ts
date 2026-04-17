export type MedicationStatus = 'taken' | 'late' | 'pending';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  status: MedicationStatus;
  fasting: boolean;
  withFood: boolean;
  instructions?: string;
  notes?: string;
  category?: string;
  icon: string;
  takenAt?: string;
}

export const mockMedications: Medication[] = [
  {
    id: '1',
    name: 'Losartana',
    dosage: '50mg — 1 comprimido',
    time: '07:00',
    status: 'taken',
    fasting: true,
    withFood: false,
    instructions: 'Tomar em jejum',
    notes: 'Evitar alimentos ricos em potássio',
    category: 'Pressão',
    icon: '💊',
    takenAt: '07:03',
  },
  {
    id: '2',
    name: 'Metformina',
    dosage: '500mg — 1 comprimido',
    time: '08:00',
    status: 'taken',
    fasting: false,
    withFood: true,
    instructions: 'Tomar com o café da manhã',
    category: 'Diabetes',
    icon: '💊',
    takenAt: '08:15',
  },
  {
    id: '3',
    name: 'Omeprazol',
    dosage: '20mg — 1 cápsula',
    time: '10:00',
    status: 'late',
    fasting: true,
    withFood: false,
    instructions: '30 minutos antes da refeição',
    notes: 'Engolir inteiro, não mastigar',
    category: 'Gástrico',
    icon: '💊',
  },
  {
    id: '4',
    name: 'Atorvastatina',
    dosage: '10mg — 1 comprimido',
    time: '12:00',
    status: 'late',
    fasting: false,
    withFood: true,
    instructions: 'Tomar com o almoço',
    category: 'Colesterol',
    icon: '💊',
  },
  {
    id: '5',
    name: 'Vitamina D',
    dosage: '2000 UI — 1 cápsula',
    time: '14:00',
    status: 'pending',
    fasting: false,
    withFood: true,
    instructions: 'Tomar com a refeição para melhor absorção',
    category: 'Suplemento',
    icon: '🌟',
  },
  {
    id: '6',
    name: 'Aspirina',
    dosage: '100mg — 1 comprimido',
    time: '19:00',
    status: 'pending',
    fasting: false,
    withFood: true,
    instructions: 'Tomar após jantar',
    notes: 'Não tomar com estômago vazio',
    category: 'Cardíaco',
    icon: '💊',
  },
  {
    id: '7',
    name: 'Clonazepam',
    dosage: '0,5mg — 1 comprimido',
    time: '22:00',
    status: 'pending',
    fasting: false,
    withFood: false,
    instructions: 'Antes de dormir',
    notes: 'Não ingerir álcool',
    category: 'Neurológico',
    icon: '🌙',
  },
];
