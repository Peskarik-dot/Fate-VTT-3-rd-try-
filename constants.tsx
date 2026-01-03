
export const COLORS = {
  bgMain: '#15171b',
  bgCard: '#1e2128',
  bgInput: '#0f1115',
  borderMain: '#3a4a63',
  accent: '#4aa3ff',
  accentDark: '#2f6fa3',
  textMain: '#e6e9ef',
  textMuted: '#9aa4b2',
  danger: '#ff4d4d',
  success: '#00e676'
};

export const createDefaultCharacter = (id: string, name: string = '', isNPC: boolean = false): any => ({
  id,
  name,
  concept: '',
  trouble: '',
  fatePoints: 3,
  image: '',
  extras: '',
  aspects: ['', '', '', '', ''],
  stunts: ['', '', ''],
  consequences: [
    { label: 'Лёгкое', value: -2, text: '' },
    { label: 'Среднее', value: -4, text: '' },
    { label: 'Тяжёлое', value: -6, text: '' }
  ],
  skills: {
    '+4': [''],
    '+3': ['', ''],
    '+2': ['', '', ''],
    '+1': ['', '', '', '']
  },
  stress: [
    { id: 'phys', name: 'Физический стресс', count: 2, values: [false, false] },
    { id: 'ment', name: 'Ментальный стресс', count: 2, values: [false, false] }
  ],
  isNPC
});
