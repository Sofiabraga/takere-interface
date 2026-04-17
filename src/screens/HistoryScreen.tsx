import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WeekCalendar } from '../components/WeekCalendar';
import { weekHistory, getAdherence, getWeekAdherence, HistoryMedication } from '../data/history';
import { colors, spacing, typography, radius } from '../theme';

const STATUS_LABEL: Record<string, string> = {
  taken: 'Tomado',
  late: 'Atrasado',
  pending: 'Não tomado',
};

const STATUS_COLOR: Record<string, string> = {
  taken: colors.taken,
  late: colors.late,
  pending: colors.textSecondary,
};

const STATUS_BG: Record<string, string> = {
  taken: colors.takenLight,
  late: colors.lateLight,
  pending: colors.border,
};

export function HistoryScreen() {
  const [selectedIndex, setSelectedIndex] = useState(weekHistory.length - 1);
  const selectedDay = weekHistory[selectedIndex];
  const weekRate = getWeekAdherence();
  const dayRate = getAdherence(selectedDay);
  const isToday = selectedIndex === weekHistory.length - 1;

  const formattedDate = selectedDay.date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Histórico</Text>
          <Text style={styles.subtitle}>Últimos 7 dias</Text>
        </View>

        {/* Week adherence card */}
        <View style={styles.weekCard}>
          <View style={styles.weekCardLeft}>
            <Text style={styles.weekLabel}>Aderência semanal</Text>
            <Text style={styles.weekPct}>{Math.round(weekRate * 100)}%</Text>
            <Text style={styles.weekSub}>
              {weekRate >= 0.9
                ? 'Excelente! Continue assim 🎉'
                : weekRate >= 0.7
                ? 'Bom progresso! 💪'
                : 'Precisa de atenção ⚠️'}
            </Text>
          </View>
          <View style={styles.weekRing}>
            <RingProgress value={weekRate} />
          </View>
        </View>

        {/* Week calendar */}
        <Text style={styles.sectionLabel}>Selecione o dia</Text>
        <WeekCalendar
          days={weekHistory}
          selectedIndex={selectedIndex}
          onSelectDay={setSelectedIndex}
        />

        {/* Selected day header */}
        <View style={styles.dayHeader}>
          <View>
            <Text style={styles.dayTitle} numberOfLines={1}>
              {isToday ? 'Hoje' : formattedDate}
            </Text>
            {!isToday && (
              <Text style={styles.daySubtitle}>{formattedDate}</Text>
            )}
          </View>
          <View style={[
            styles.dayRateBadge,
            { backgroundColor: dayRate >= 0.9 ? colors.takenLight : dayRate >= 0.6 ? colors.pendingLight : colors.lateLight },
          ]}>
            <Text style={[
              styles.dayRateText,
              { color: dayRate >= 0.9 ? colors.taken : dayRate >= 0.6 ? colors.pending : colors.late },
            ]}>
              {Math.round(dayRate * 100)}%
            </Text>
          </View>
        </View>

        {/* Medication list for selected day */}
        <View style={styles.medList}>
          {selectedDay.medications.map((med) => (
            <HistoryMedCard key={med.id} med={med} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HistoryMedCard({ med }: { med: HistoryMedication }) {
  const color = STATUS_COLOR[med.status];
  const bg = STATUS_BG[med.status];
  const label = STATUS_LABEL[med.status];

  return (
    <View style={[styles.medCard, { borderLeftColor: color }]}>
      <View style={styles.medCardLeft}>
        <Text style={styles.medIcon}>{med.icon}</Text>
        <View>
          <Text style={[styles.medName, med.status !== 'taken' && styles.medNameFaded]}>
            {med.name}
          </Text>
          <Text style={styles.medDosage}>{med.dosage}</Text>
        </View>
      </View>
      <View style={styles.medCardRight}>
        <Text style={styles.medTime}>{med.time}</Text>
        <View style={[styles.medBadge, { backgroundColor: bg }]}>
          <Text style={[styles.medBadgeText, { color }]}>{label}</Text>
        </View>
        {med.takenAt && med.status === 'taken' && (
          <Text style={styles.takenAt}>às {med.takenAt}</Text>
        )}
      </View>
    </View>
  );
}

function RingProgress({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const filledSegments = Math.round((pct / 100) * 10);

  return (
    <View style={styles.ring}>
      <Text style={styles.ringPct}>{pct}%</Text>
      <View style={styles.ringDots}>
        {Array.from({ length: 10 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.ringDot,
              { backgroundColor: i < filledSegments ? colors.taken : colors.border },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: { flex: 1 },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    marginBottom: 2,
  },
  subtitle: {
    ...typography.caption,
  },
  weekCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  weekCardLeft: { flex: 1 },
  weekLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  weekPct: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.taken,
    lineHeight: 40,
  },
  weekSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  weekRing: {
    marginLeft: spacing.md,
  },
  ring: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  ringPct: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.taken,
  },
  ringDots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 52,
    gap: 4,
    justifyContent: 'center',
  },
  ringDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionLabel: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  dayTitle: {
    ...typography.subtitle,
    textTransform: 'capitalize',
  },
  daySubtitle: {
    ...typography.caption,
    textTransform: 'capitalize',
  },
  dayRateBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.xl,
  },
  dayRateText: {
    fontSize: 14,
    fontWeight: '700',
  },
  medList: {
    gap: spacing.sm,
  },
  medCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
  },
  medCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  medIcon: { fontSize: 20 },
  medName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  medNameFaded: {
    color: colors.textSecondary,
  },
  medDosage: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  medCardRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  medTime: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  medBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xl,
  },
  medBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  takenAt: {
    fontSize: 10,
    color: colors.taken,
    fontWeight: '500',
  },
});
