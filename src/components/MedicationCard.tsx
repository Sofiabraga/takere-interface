import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Medication } from '../data/medications';
import { colors, radius, spacing, typography } from '../theme';

interface Props {
  medication: Medication;
}

const statusConfig = {
  taken: {
    bg: colors.takenLight,
    border: colors.taken,
    badge: colors.taken,
    badgeText: '#FFFFFF',
    label: 'Tomado',
    timeFade: true,
  },
  late: {
    bg: colors.lateLight,
    border: colors.late,
    badge: colors.late,
    badgeText: '#FFFFFF',
    label: 'Atrasado',
    timeFade: false,
  },
  pending: {
    bg: colors.surface,
    border: colors.border,
    badge: colors.pendingLight,
    badgeText: colors.pending,
    label: 'Pendente',
    timeFade: false,
  },
};

export function MedicationCard({ medication }: Props) {
  const config = statusConfig[medication.status];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: config.bg, borderColor: config.border }]}
    >
      <View style={styles.timeColumn}>
        <Text style={[styles.time, config.timeFade && styles.timeFaded]}>
          {medication.time}
        </Text>
        <View style={[styles.dot, { backgroundColor: config.border }]} />
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.icon}>{medication.icon}</Text>
          <Text style={styles.name} numberOfLines={1}>{medication.name}</Text>
          <View style={[styles.badge, { backgroundColor: config.badge }]}>
            <Text style={[styles.badgeText, { color: config.badgeText }]}>
              {config.label}
            </Text>
          </View>
        </View>

        <Text style={styles.dosage}>{medication.dosage}</Text>

        {medication.instructions ? (
          <Text style={styles.instructions} numberOfLines={1}>
            {medication.instructions}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeColumn: {
    alignItems: 'center',
    marginRight: spacing.md,
    minWidth: 44,
  },
  time: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  timeFaded: {
    color: colors.textSecondary,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  icon: {
    fontSize: 16,
  },
  name: {
    ...typography.subtitle,
    flex: 1,
    fontSize: 15,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xl,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dosage: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 13,
  },
  instructions: {
    ...typography.caption,
    fontStyle: 'italic',
    marginTop: 2,
  },
});
