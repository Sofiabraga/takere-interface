export const colors = {
  background: '#F8F9FC',
  surface: '#FFFFFF',
  primary: '#4A6CF7',
  primaryLight: '#EEF1FE',
  taken: '#22C55E',
  takenLight: '#DCFCE7',
  late: '#EF4444',
  lateLight: '#FEE2E2',
  pending: '#F59E0B',
  pendingLight: '#FEF3C7',
  text: '#1A1D2E',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const typography = {
  title: { fontSize: 22, fontWeight: '700' as const, color: colors.text },
  subtitle: { fontSize: 16, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 14, fontWeight: '400' as const, color: colors.text },
  caption: { fontSize: 12, fontWeight: '400' as const, color: colors.textSecondary },
};
