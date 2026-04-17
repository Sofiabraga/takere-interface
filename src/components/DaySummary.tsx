import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

interface Props {
  total: number;
  taken: number;
  late: number;
  pending: number;
}

export function DaySummary({ total, taken, late, pending }: Props) {
  const progress = total > 0 ? taken / total : 0;
  const progressWidth = `${Math.round(progress * 100)}%` as any;

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <StatBadge count={taken} label="Tomados" color={colors.taken} bg={colors.takenLight} />
        <StatBadge count={late} label="Atrasados" color={colors.late} bg={colors.lateLight} />
        <StatBadge count={pending} label="Pendentes" color={colors.pending} bg={colors.pendingLight} />
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: progressWidth }]} />
      </View>
      <Text style={styles.progressLabel}>
        {taken} de {total} medicamentos tomados hoje
      </Text>
    </View>
  );
}

function StatBadge({ count, label, color, bg }: { count: number; label: string; color: string; bg: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeCount, { color }]}>{count}</Text>
      <Text style={[styles.badgeLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  badge: {
    flex: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  badgeCount: {
    fontSize: 22,
    fontWeight: '700',
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.taken,
    borderRadius: 4,
  },
  progressLabel: {
    ...typography.caption,
    textAlign: 'center',
  },
});
