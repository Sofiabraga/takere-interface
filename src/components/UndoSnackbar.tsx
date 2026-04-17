import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';

interface Props {
  visible: boolean;
  medicationName: string;
  onUndo: () => void;
  onDismiss: () => void;
}

export function UndoSnackbar({ visible, medicationName, onUndo, onDismiss }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        hide();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  function hide() {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 20, duration: 200, useNativeDriver: true }),
    ]).start(() => onDismiss());
  }

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      <Ionicons name="checkmark-circle" size={20} color={colors.taken} />
      <Text style={styles.text} numberOfLines={1}>
        <Text style={styles.bold}>{medicationName}</Text> marcado como tomado
      </Text>
      <TouchableOpacity onPress={() => { hide(); onUndo(); }} activeOpacity={0.8}>
        <Text style={styles.undoText}>Desfazer</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.text,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 100,
  },
  text: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
  },
  bold: {
    fontWeight: '700',
  },
  undoText: {
    color: colors.pending,
    fontWeight: '700',
    fontSize: 13,
  },
});
