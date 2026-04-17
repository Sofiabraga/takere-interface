export type MedicationStatus = 'taken' | 'late' | 'pending';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  status: MedicationStatus;
  instructions?: string;
  icon: string;
}

export const mockMedications: Medication[] = [
  {
    id: '1',
    name: 'Losartana',
    dosage: '50mg — 1 comprimido',
    time: '07:00',
    status: 'taken',
    instructions: 'Tomar em jejum',
    icon: '💊',
  },
  {
    id: '2',
    name: 'Metformina',
    dosage: '500mg — 1 comprimido',
    time: '08:00',
    status: 'taken',
    instructions: 'Tomar com o café da manhã',
    icon: '💊',
  },
  {
    id: '3',
    name: 'Omeprazol',
    dosage: '20mg — 1 cápsula',
    time: '10:00',
    status: 'late',
    instructions: '30 minutos antes da refeição',
    icon: '💊',
  },
  {
    id: '4',
    name: 'Atorvastatina',
    dosage: '10mg — 1 comprimido',
    time: '12:00',
    status: 'late',
    instructions: 'Tomar com o almoço',
    icon: '💊',
  },
  {
    id: '5',
    name: 'Vitamina D',
    dosage: '2000 UI — 1 cápsula',
    time: '14:00',
    status: 'pending',
    icon: '🌟',
  },
  {
    id: '6',
    name: 'Aspirina',
    dosage: '100mg — 1 comprimido',
    time: '19:00',
    status: 'pending',
    instructions: 'Tomar após jantar',
    icon: '💊',
  },
  {
    id: '7',
    name: 'Clonazepam',
    dosage: '0,5mg — 1 comprimido',
    time: '22:00',
    status: 'pending',
    instructions: 'Antes de dormir',
    icon: '🌙',
  },
];
