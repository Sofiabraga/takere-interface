import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Medication } from '../data/medications';
import { colors, radius, spacing, typography } from '../theme';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface Props {
  medication: Medication;
  onMarkTaken: (id: string) => void;
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

export function MedicationCard({ medication, onMarkTaken }: Props) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[medication.status];

  function handleToggle() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }

  function handleMarkTaken() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onMarkTaken(medication.id);
    setExpanded(false);
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handleToggle}
      style={[styles.card, { backgroundColor: config.bg, borderColor: config.border }]}
    >
      {/* Collapsed row */}
      <View style={styles.timeColumn}>
        <Text style={[styles.time, config.timeFade && styles.timeFaded]}>
          {medication.time}
        </Text>
        <View style={[styles.dot, { backgroundColor: config.border }]}>
          {medication.status === 'taken' && (
            <Ionicons name="checkmark" size={6} color="#fff" />
          )}
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.icon}>{medication.icon}</Text>
          <Text style={[styles.name, medication.status === 'taken' && styles.nameStrike]} numberOfLines={1}>
            {medication.name}
          </Text>
          {medication.fasting && (
            <View style={styles.fastingBadge}>
              <Text style={styles.fastingText}>☕ Jejum</Text>
            </View>
          )}
          <View style={[styles.badge, { backgroundColor: config.badge }]}>
            <Text style={[styles.badgeText, { color: config.badgeText }]}>
              {config.label}
            </Text>
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.textSecondary}
          />
        </View>

        <Text style={styles.dosage}>{medication.dosage}</Text>

        {/* Expanded details */}
        {expanded && (
          <View style={styles.expandedContent}>
            <View style={styles.divider} />

            {/* Context icons */}
            <View style={styles.contextRow}>
              {medication.fasting && (
                <ContextChip icon="☕" label="Em jejum" color={colors.pending} bg={colors.pendingLight} />
              )}
              {medication.withFood && (
                <ContextChip icon="🍽️" label="Com comida" color={colors.primary} bg={colors.primaryLight} />
              )}
              {!medication.fasting && !medication.withFood && (
                <ContextChip icon="💧" label="Com água" color={colors.textSecondary} bg={colors.border} />
              )}
              {medication.category && (
                <ContextChip icon="🏷️" label={medication.category} color={colors.textSecondary} bg={colors.border} />
              )}
            </View>

            {medication.instructions ? (
              <Text style={styles.detailText}>📋 {medication.instructions}</Text>
            ) : null}

            {medication.notes ? (
              <Text style={styles.notesText}>⚠️ {medication.notes}</Text>
            ) : null}

            {medication.status === 'taken' && medication.takenAt ? (
              <Text style={styles.takenAtText}>✓ Tomado às {medication.takenAt}</Text>
            ) : null}

            {medication.status !== 'taken' && (
              <TouchableOpacity
                style={styles.markTakenBtn}
                onPress={handleMarkTaken}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                <Text style={styles.markTakenText}>Marcar como tomado</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function ContextChip({ icon, label, color, bg }: { icon: string; label: string; color: string; bg: string }) {
  return (
    <View style={[styles.contextChip, { backgroundColor: bg }]}>
      <Text style={styles.contextChipIcon}>{icon}</Text>
      <Text style={[styles.contextChipLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
    padding: spacing.md,
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
    paddingTop: 2,
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
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 3,
  },
  icon: {
    fontSize: 16,
  },
  name: {
    ...typography.subtitle,
    flex: 1,
    fontSize: 15,
  },
  nameStrike: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  fastingBadge: {
    backgroundColor: colors.pendingLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.xl,
  },
  fastingText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.pending,
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
  expandedContent: {
    marginTop: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  contextRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  contextChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.xl,
    gap: 3,
  },
  contextChipIcon: {
    fontSize: 12,
  },
  contextChipLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  detailText: {
    ...typography.body,
    fontSize: 13,
    color: colors.text,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: colors.late,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  takenAtText: {
    fontSize: 12,
    color: colors.taken,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  markTakenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.taken,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  markTakenText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
