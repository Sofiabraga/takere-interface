import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Medication, MedicationStatus } from '../data/medications';
import { MedicationCard } from '../components/MedicationCard';
import { DaySummary } from '../components/DaySummary';
import { SectionHeader } from '../components/SectionHeader';
import { UndoSnackbar } from '../components/UndoSnackbar';
import { colors, spacing, typography, radius } from '../theme';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const FILTERS: { label: string; value: MedicationStatus | 'all' }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Tomados', value: 'taken' },
  { label: 'Atrasados', value: 'late' },
  { label: 'Pendentes', value: 'pending' },
];

const PERIODS = [
  { key: 'manha', label: 'Manhã', icon: '🌅', start: 6, end: 11 },
  { key: 'tarde', label: 'Tarde', icon: '☀️', start: 12, end: 17 },
  { key: 'noite', label: 'Noite', icon: '🌙', start: 18, end: 23 },
];

function getHour(time: string) {
  return parseInt(time.split(':')[0], 10);
}

function getNextMedication(meds: Medication[]): Medication | null {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const upcoming = meds
    .filter((m) => m.status !== 'taken')
    .sort((a, b) => {
      const [ah, am] = a.time.split(':').map(Number);
      const [bh, bm] = b.time.split(':').map(Number);
      return ah * 60 + am - (bh * 60 + bm);
    });
  if (!upcoming.length) return null;
  return upcoming.find((m) => {
    const [h, min] = m.time.split(':').map(Number);
    return h * 60 + min >= currentMinutes;
  }) ?? upcoming[0];
}

function getMinutesUntil(time: string): string {
  const now = new Date();
  const [h, m] = time.split(':').map(Number);
  const diff = h * 60 + m - (now.getHours() * 60 + now.getMinutes());
  if (diff < 0) return 'atrasado';
  if (diff === 0) return 'agora';
  if (diff < 60) return `em ${diff} min`;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  return mins > 0 ? `em ${hours}h ${mins}min` : `em ${hours}h`;
}

export function HomeScreen() {
  const { user, logout } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<MedicationStatus | 'all'>('all');
  const [snackbar, setSnackbar] = useState<{ visible: boolean; id: string; name: string }>({
    visible: false,
    id: '',
    name: '',
  });

  useEffect(() => {
    fetchMedications();
  }, []);

  async function fetchMedications() {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.get<Medication[]>('/medications');
      setMedications(data);
    } catch {
      setError('Não foi possível carregar os medicamentos');
    } finally {
      setIsLoading(false);
    }
  }

  const taken = medications.filter((m) => m.status === 'taken').length;
  const late = medications.filter((m) => m.status === 'late').length;
  const pending = medications.filter((m) => m.status === 'pending').length;

  async function handleMarkTaken(id: string) {
    const med = medications.find((m) => m.id === id);
    if (!med) return;
    const now = new Date();
    const takenAt = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'taken' as MedicationStatus, takenAt } : m))
    );
    setSnackbar({ visible: true, id, name: med.name });
    try {
      await api.patch(`/medications/${id}/status`, { status: 'taken' });
    } catch {
      // silent — optimistic update stays; could revert if needed
    }
  }

  async function handleUndo() {
    setMedications((prev) =>
      prev.map((m) => (m.id === snackbar.id ? { ...m, status: 'pending' as MedicationStatus, takenAt: undefined } : m))
    );
    try {
      await api.patch(`/medications/${snackbar.id}/status`, { status: 'pending' });
    } catch {
      // silent
    }
  }

  const filtered =
    activeFilter === 'all'
      ? medications
      : medications.filter((m) => m.status === activeFilter);

  const nextMed = getNextMedication(medications);

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.name ?? 'Paciente'} 👋</Text>
            <Text style={styles.date}>{today}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
              <Ionicons name="notifications-outline" size={22} color={colors.primary} />
              {late > 0 && <View style={styles.notificationDot} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={logout} activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchMedications}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Summary */}
            <DaySummary
              total={medications.length}
              taken={taken}
              late={late}
              pending={pending}
            />

            {/* Next medication banner */}
            {nextMed && (
              <View style={[styles.nextBanner, nextMed.status === 'late' && styles.nextBannerLate]}>
                <View style={styles.nextBannerLeft}>
                  <Text style={[styles.nextBannerLabel, nextMed.status === 'late' && styles.nextBannerLabelLate]}>
                    Próximo medicamento
                  </Text>
                  <Text style={styles.nextBannerName}>{nextMed.icon} {nextMed.name}</Text>
                  {nextMed.fasting && (
                    <Text style={styles.nextBannerFasting}>☕ Lembre-se: em jejum</Text>
                  )}
                  {nextMed.withFood && (
                    <Text style={styles.nextBannerFood}>🍽️ Tomar com comida</Text>
                  )}
                </View>
                <View style={[styles.nextBannerTime, nextMed.status === 'late' && styles.nextBannerTimeLate]}>
                  <Text style={styles.nextBannerTimeText}>{getMinutesUntil(nextMed.time)}</Text>
                </View>
              </View>
            )}

            {/* All done banner */}
            {medications.length > 0 && taken === medications.length && (
              <View style={styles.allDoneBanner}>
                <Text style={styles.allDoneText}>🎉 Todos os medicamentos tomados hoje!</Text>
              </View>
            )}

            {/* Filters */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
              contentContainerStyle={styles.filterContent}
            >
              {FILTERS.map((f) => (
                <TouchableOpacity
                  key={f.value}
                  style={[styles.filterChip, activeFilter === f.value && styles.filterChipActive]}
                  onPress={() => setActiveFilter(f.value)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterText, activeFilter === f.value && styles.filterTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Medication list */}
            {activeFilter === 'all' ? (
              PERIODS.map((period) => {
                const periodMeds = filtered.filter((m) => {
                  const h = getHour(m.time);
                  return h >= period.start && h <= period.end;
                });
                if (!periodMeds.length) return null;
                const periodTaken = periodMeds.filter((m) => m.status === 'taken').length;
                return (
                  <View key={period.key}>
                    <SectionHeader
                      icon={period.icon}
                      label={period.label}
                      count={periodMeds.length}
                      takenCount={periodTaken}
                    />
                    {periodMeds.map((med) => (
                      <MedicationCard key={med.id} medication={med} onMarkTaken={handleMarkTaken} />
                    ))}
                  </View>
                );
              })
            ) : (
              <View>
                {filtered.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>🎉</Text>
                    <Text style={styles.emptyText}>Nenhum medicamento nesta categoria</Text>
                  </View>
                ) : (
                  filtered.map((med) => (
                    <MedicationCard key={med.id} medication={med} onMarkTaken={handleMarkTaken} />
                  ))
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <UndoSnackbar
        visible={snackbar.visible}
        medicationName={snackbar.name}
        onUndo={handleUndo}
        onDismiss={() => setSnackbar((s) => ({ ...s, visible: false }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.title,
    marginBottom: 2,
  },
  date: {
    ...typography.caption,
    textTransform: 'capitalize',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 44,
    height: 44,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.late,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  loadingContainer: {
    paddingVertical: spacing.xl * 2,
    alignItems: 'center',
  },
  errorContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  retryText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  nextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '33',
  },
  nextBannerLate: {
    backgroundColor: colors.lateLight,
    borderColor: colors.late + '33',
  },
  nextBannerLeft: { flex: 1 },
  nextBannerLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  nextBannerLabelLate: {
    color: colors.late,
  },
  nextBannerName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  nextBannerFasting: {
    fontSize: 11,
    color: colors.pending,
    fontWeight: '500',
  },
  nextBannerFood: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '500',
  },
  nextBannerTime: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    marginLeft: spacing.sm,
  },
  nextBannerTimeLate: {
    backgroundColor: colors.late,
  },
  nextBannerTimeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  allDoneBanner: {
    backgroundColor: colors.takenLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.taken + '44',
  },
  allDoneText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.taken,
  },
  filterScroll: {
    marginBottom: spacing.md,
    marginHorizontal: -spacing.lg,
  },
  filterContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.white,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
