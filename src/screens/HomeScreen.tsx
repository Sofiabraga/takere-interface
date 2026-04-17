import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mockMedications, MedicationStatus } from '../data/medications';
import { MedicationCard } from '../components/MedicationCard';
import { DaySummary } from '../components/DaySummary';
import { colors, spacing, typography, radius } from '../theme';

const FILTERS: { label: string; value: MedicationStatus | 'all' }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Tomados', value: 'taken' },
  { label: 'Atrasados', value: 'late' },
  { label: 'Pendentes', value: 'pending' },
];

export function HomeScreen() {
  const [activeFilter, setActiveFilter] = useState<MedicationStatus | 'all'>('all');

  const taken = mockMedications.filter((m) => m.status === 'taken').length;
  const late = mockMedications.filter((m) => m.status === 'late').length;
  const pending = mockMedications.filter((m) => m.status === 'pending').length;

  const filtered =
    activeFilter === 'all'
      ? mockMedications
      : mockMedications.filter((m) => m.status === activeFilter);

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
            <Text style={styles.greeting}>Olá, Paciente 👋</Text>
            <Text style={styles.date}>{today}</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.8}>
            <Ionicons name="notifications-outline" size={22} color={colors.primary} />
            {late > 0 && <View style={styles.notificationDot} />}
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <DaySummary
          total={mockMedications.length}
          taken={taken}
          late={late}
          pending={pending}
        />

        {/* Section title */}
        <Text style={styles.sectionTitle}>Medicamentos de hoje</Text>

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
              style={[
                styles.filterChip,
                activeFilter === f.value && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(f.value)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === f.value && styles.filterTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Medication list */}
        <View style={styles.list}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎉</Text>
              <Text style={styles.emptyText}>Nenhum medicamento nesta categoria</Text>
            </View>
          ) : (
            filtered.map((med) => <MedicationCard key={med.id} medication={med} />)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
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
  notificationBtn: {
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
  sectionTitle: {
    ...typography.subtitle,
    marginBottom: spacing.sm,
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
  list: {
    flex: 1,
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
