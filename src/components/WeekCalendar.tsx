import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { DayHistory, getAdherence } from '../data/history';
import { radius, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface Props {
  days: DayHistory[];
  selectedIndex: number;
  onSelectDay: (index: number) => void;
}

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function WeekCalendar({ days, selectedIndex, onSelectDay }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  function adherenceColor(rate: number): string {
    if (rate >= 0.9) return colors.taken;
    if (rate >= 0.6) return colors.pending;
    return colors.late;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {days.map((day, index) => {
        const rate = getAdherence(day);
        const isSelected = index === selectedIndex;
        const isToday = index === days.length - 1;
        const color = adherenceColor(rate);
        const pct = Math.round(rate * 100);

        return (
          <TouchableOpacity
            key={index}
            style={[styles.dayCell, isSelected && styles.dayCellSelected]}
            onPress={() => onSelectDay(index)}
            activeOpacity={0.75}
          >
            <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
              {DAY_LABELS[day.date.getDay()]}
            </Text>
            <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
              {day.date.getDate()}
            </Text>

            {/* Adherence bar */}
            <View style={styles.barBg}>
              <View
                style={[
                  styles.barFill,
                  { height: `${pct}%` as any, backgroundColor: isSelected ? '#fff' : color },
                ]}
              />
            </View>

            <Text style={[styles.pct, isSelected && styles.pctSelected]}>
              {pct}%
            </Text>

            {isToday && <View style={[styles.todayDot, isSelected && styles.todayDotSelected]} />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function makeStyles(colors: ReturnType<typeof import('../context/ThemeContext').useTheme>['colors']) {
  return StyleSheet.create({
    container: {
      gap: spacing.xs,
      paddingVertical: spacing.xs,
      paddingHorizontal: 2,
    },
    dayCell: {
      width: 52,
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      gap: 4,
    },
    dayCellSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    dayLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
    },
    dayLabelSelected: {
      color: 'rgba(255,255,255,0.8)',
    },
    dayNumber: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    dayNumberSelected: {
      color: '#fff',
    },
    barBg: {
      width: 6,
      height: 36,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: 'hidden',
      justifyContent: 'flex-end',
    },
    barFill: {
      width: '100%',
      borderRadius: 3,
    },
    pct: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    pctSelected: {
      color: 'rgba(255,255,255,0.9)',
    },
    todayDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: colors.primary,
    },
    todayDotSelected: {
      backgroundColor: '#fff',
    },
  });
}
