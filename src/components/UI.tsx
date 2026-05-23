// src/components/UI.tsx
import React from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator,
  ViewStyle, TextStyle, TextInputProps,
} from 'react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../utils/theme';

// ─── Card ────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  accent?: 'cyan' | 'lime' | 'magenta' | 'none';
}
export function Card({ children, style, accent = 'none' }: CardProps) {
  const borderTopColor =
    accent === 'cyan'    ? COLORS.cyanSoft   :
    accent === 'lime'    ? COLORS.lime        :
    accent === 'magenta' ? COLORS.magentaSoft : 'transparent';

  return (
    <View style={[styles.card, { borderTopColor, borderTopWidth: accent !== 'none' ? 2 : 0 }, style]}>
      {children}
    </View>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────
export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.seeAll}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Button ──────────────────────────────────────────────────────────────────
interface BtnProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  style?: ViewStyle;
  loading?: boolean;
  disabled?: boolean;
}
export function Button({ label, onPress, variant = 'primary', style, loading, disabled }: BtnProps) {
  const isPrimary  = variant === 'primary';
  const isOutline  = variant === 'outline';
  const isDanger   = variant === 'danger';

  const bgColor =
    isPrimary ? COLORS.magenta :
    isDanger  ? 'transparent' : 'transparent';

  const borderColor =
    isOutline ? COLORS.cyanSoft :
    isDanger  ? COLORS.danger   : 'transparent';

  const textColor =
    isPrimary ? '#000'           :
    isOutline ? COLORS.cyanSoft  :
    isDanger  ? COLORS.danger    : COLORS.onSurface;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
      style={[
        styles.btn,
        { backgroundColor: bgColor, borderColor, borderWidth: isOutline || isDanger ? 1.5 : 0, opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator size="small" color={textColor} />
        : <Text style={[styles.btnText, { color: textColor }]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

// ─── FormInput ───────────────────────────────────────────────────────────────
interface FormInputProps extends TextInputProps {
  label?: string;
  containerStyle?: ViewStyle;
  error?: string;
}
export function FormInput({ label, containerStyle, error, style, ...props }: FormInputProps) {
  const [focused, setFocused] = React.useState(false);
  return (
    <View style={[{ marginBottom: SPACING.md }, containerStyle]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          focused && { borderColor: COLORS.cyanSoft },
          error  && { borderColor: COLORS.danger },
          style as TextStyle,
        ]}
        placeholderTextColor="rgba(225,224,255,0.3)"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
export function Badge({ label, color = 'cyan' }: { label: string; color?: 'cyan' | 'lime' | 'magenta' }) {
  const bg =
    color === 'lime'    ? 'rgba(171,214,0,0.15)'  :
    color === 'magenta' ? 'rgba(255,0,255,0.15)'  :
                          'rgba(0,251,251,0.15)';
  const tc =
    color === 'lime'    ? COLORS.lime        :
    color === 'magenta' ? COLORS.magentaSoft :
                          COLORS.cyanSoft;

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: tc }]}>{label}</Text>
    </View>
  );
}

// ─── Chip ────────────────────────────────────────────────────────────────────
export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── EmptyState ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  seeAll: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.cyanSoft,
  },
  btn: {
    height: 52,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  btnText: {
    ...TYPOGRAPHY.labelLg,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  inputLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: RADIUS.sm + 2,
    padding: SPACING.md,
    color: COLORS.white,
    ...TYPOGRAPHY.bodyMd,
  },
  errorText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.danger,
    marginTop: 4,
  },
  badge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  badgeText: {
    ...TYPOGRAPHY.labelSm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  chipActive: {
    backgroundColor: COLORS.cyanSoft,
    borderColor: COLORS.cyanSoft,
  },
  chipText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.muted,
  },
  chipTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    ...TYPOGRAPHY.titleLg,
    color: COLORS.white,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.muted,
    textAlign: 'center',
  },
});
