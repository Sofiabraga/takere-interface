import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, typography, radius } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface Props {
  icon: string;
  label: string;
  count: number;
  takenCount: number;
}

export function SectionHeader({ icon, label, count, takenCount }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.pill}>
        <Text style={styles.pillText}>{takenCount}/{count}</Text>
      </View>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof import('../context/ThemeContext').useTheme>['colors']) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    icon: {
      fontSize: 16,
    },
    label: {
      ...typography.subtitle,
      color: colors.textSecondary,
      fontSize: 14,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    pill: {
      backgroundColor: colors.primaryLight,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.xl,
    },
    pillText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
    },
  });
}
