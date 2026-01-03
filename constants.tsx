
export const COLORS = {
  bgMain: '#1b1d21',
  bgCard: '#24272d',
  borderMain: '#3a4a63',
  accent: '#4aa3ff',
  accentSoft: '#2f6fa3',
  textMain: '#e6e9ef',
  textMuted: '#9aa4b2',
  danger: '#dc3545',
  success: '#28a745'
};

export const INITIAL_CHARACTER: any = {
  name: '',
  concept: '',
  trouble: '',
  fatePoints: 3,
  image: '',
  extras: '',
  aspects: ['', '', ''],
  tempAspects: [],
  stunts: ['', '', ''],
  consequences: [
    { label: 'Лёгкое', value: -2, text: '' },
    { label: 'Среднее', value: -4, text: '' },
    { label: 'Тяжёлое', value: -6, text: '' }
  ],
  skills: [
    { bonus: 5, list: [''] },
    { bonus: 4, list: [''] },
    { bonus: 3, list: [''] },
    { bonus: 2, list: [''] },
    { bonus: 1, list: [''] },
    { bonus: 0, list: [''] }
  ],
  stress: [
    { id: '1', name: 'Физический', count: 2, values: [false, false], canDelete: false },
    { id: '2', name: 'Ментальный', count: 2, values: [false, false], canDelete: false }
  ],
  isNPC: false
};
