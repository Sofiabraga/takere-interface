import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { WeekCalendar } from '../components/WeekCalendar';
import { getAdherence, getWeekAdherence, HistoryMedication, DayHistory } from '../data/history';
import { spacing, typography, radius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

interface ApiDayHistory {
  date: string;
  medications: HistoryMedication[];
}

const STATUS_LABEL: Record<string, string> = {
  taken: 'Tomado',
  late: 'Atrasado',
  pending: 'Não tomado',
};

export function HistoryScreen() {
  const { colors, isDark } = useTheme();
  const [history, setHistory] = useState<DayHistory[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  async function fetchHistory() {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.get<ApiDayHistory[]>('/history');
      const converted: DayHistory[] = data.map((d) => ({
        date: new Date(d.date + 'T00:00:00'),
        medications: d.medications,
      }));
      setHistory(converted);
      setSelectedIndex(converted.length - 1);
    } catch {
      setError('Não foi possível carregar o histórico');
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshHistory() {
    try {
      setIsRefreshing(true);
      const data = await api.get<ApiDayHistory[]>('/history');
      const converted: DayHistory[] = data.map((d) => ({
        date: new Date(d.date + 'T00:00:00'),
        medications: d.medications,
      }));
      setHistory(converted);
      setSelectedIndex(converted.length - 1);
    } catch {
      // silent on refresh failure
    } finally {
      setIsRefreshing(false);
    }
  }

  const styles = useMemo(() => makeStyles(colors), [colors]);

  const statusColor: Record<string, string> = {
    taken: colors.taken,
    late: colors.late,
    pending: colors.textSecondary,
  };

  const statusBg: Record<string, string> = {
    taken: colors.takenLight,
    late: colors.lateLight,
    pending: colors.border,
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || history.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error ?? 'Sem dados disponíveis'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchHistory}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const selectedDay = history[selectedIndex];
  const weekRate = getWeekAdherence(history);
  const dayRate = getAdherence(selectedDay);
  const isToday = selectedIndex === history.length - 1;

  const formattedDate = selectedDay.date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshHistory}
            tintColor={colors.primary}
          />
        }
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
            <RingProgress value={weekRate} colors={colors} />
          </View>
        </View>

        {/* Week calendar */}
        <Text style={styles.sectionLabel}>Selecione o dia</Text>
        <WeekCalendar
          days={history}
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
            <HistoryMedCard
              key={med.id}
              med={med}
              styles={styles}
              statusColor={statusColor}
              statusBg={statusBg}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HistoryMedCard({
  med,
  styles,
  statusColor,
  statusBg,
}: {
  med: HistoryMedication;
  styles: ReturnType<typeof makeStyles>;
  statusColor: Record<string, string>;
  statusBg: Record<string, string>;
}) {
  const color = statusColor[med.status];
  const bg = statusBg[med.status];
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

function RingProgress({ value, colors }: { value: number; colors: ReturnType<typeof import('../context/ThemeContext').useTheme>['colors'] }) {
  const pct = Math.round(value * 100);
  const filledSegments = Math.round((pct / 100) * 10);
  const styles = useMemo(() => StyleSheet.create({
    ring: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center', gap: 4 },
    ringPct: { fontSize: 14, fontWeight: '700', color: colors.taken },
    ringDots: { flexDirection: 'row', flexWrap: 'wrap', width: 52, gap: 4, justifyContent: 'center' },
    ringDot: { width: 8, height: 8, borderRadius: 4 },
  }), [colors]);

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

function makeStyles(colors: ReturnType<typeof import('../context/ThemeContext').useTheme>['colors']) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: { flex: 1 },
    content: {
      padding: spacing.lg,
      paddingBottom: spacing.xl * 2,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.xl,
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
    header: {
      marginBottom: spacing.lg,
    },
    title: {
      ...typography.title,
      color: colors.text,
      marginBottom: 2,
    },
    subtitle: {
      ...typography.caption,
      color: colors.textSecondary,
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
    sectionLabel: {
      ...typography.caption,
      color: colors.textSecondary,
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
      color: colors.text,
      textTransform: 'capitalize',
    },
    daySubtitle: {
      ...typography.caption,
      color: colors.textSecondary,
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
}
