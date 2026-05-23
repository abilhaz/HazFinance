// src/utils/theme.ts
// Vibrant Neo-Finance Design System — HAZ FINANCE

export const COLORS = {
  // Backgrounds / Surfaces
  surface:             '#040054',
  surfaceDim:          '#040054',
  surfaceBright:       '#2c2e82',
  surfaceContainerLowest: '#020045',
  surfaceContainerLow: '#0a0565',
  surfaceContainer:    '#0f0d69',
  surfaceContainerHigh:'#1c1c72',
  surfaceContainerHighest: '#28297d',
  background:          '#040054',

  // Text
  onSurface:           '#e1e0ff',
  onSurfaceVariant:    '#dcbed4',
  onBackground:        '#e1e0ff',

  // Accents
  primary:             '#ffabf3',   // magenta-soft
  primaryContainer:    '#ff00ff',   // magenta full
  onPrimary:           '#5b005b',
  onPrimaryContainer:  '#510051',

  secondary:           '#ffffff',
  secondaryContainer:  '#00fbfb',   // cyan full
  onSecondary:         '#003737',
  secondaryFixed:      '#00fbfb',   // cyan

  tertiary:            '#abd600',   // lime
  tertiaryFixed:       '#c3f400',   // lime bright
  onTertiary:          '#283500',

  // Semantic
  error:               '#ffb4ab',
  errorContainer:      '#93000a',
  outline:             '#a4899d',
  outlineVariant:      '#564052',

  // Shorthand aliases used in code
  magenta:   '#ff00ff',
  magentaSoft:'#ffabf3',
  cyan:      '#00ffff',
  cyanSoft:  '#00fbfb',
  lime:      '#abd600',
  limeBright:'#c3f400',
  navy:      '#040054',
  navy2:     '#0a0565',
  navy3:     '#0f0d69',
  navy4:     '#1c1c72',
  navy5:     '#28297d',
  white:     '#e1e0ff',
  muted:     '#dcbed4',
  cardBorder:'rgba(255,255,255,0.08)',
  danger:    '#ff6b6b',
};

export const TYPOGRAPHY = {
  displayLg:  { fontSize: 57, fontWeight: '700' as const, lineHeight: 64 },
  headlineLg: { fontSize: 32, fontWeight: '600' as const, lineHeight: 40 },
  headlineMobile: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  titleLg:    { fontSize: 18, fontWeight: '500' as const, lineHeight: 24 },
  bodyLg:     { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMd:     { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  labelLg:    { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
  labelMd:    { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
  labelSm:    { fontSize: 10, fontWeight: '600' as const, lineHeight: 14 },
};

export const RADIUS = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  full: 999,
};

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
};

export const FONT_FAMILY = 'Inter';

// Transaction & Item Categories
export const TX_CATEGORIES = [
  { id: 'shopping',   label: 'Shopping',   icon: '🛍️', color: '#ff00ff' },
  { id: 'food',       label: 'Makan',      icon: '🍔', color: '#00fbfb' },
  { id: 'transport',  label: 'Transport',  icon: '🚗', color: '#abd600' },
  { id: 'housing',    label: 'Rumah',      icon: '🏠', color: '#ffabf3' },
  { id: 'bills',      label: 'Tagihan',    icon: '💳', color: '#ff6b6b' },
  { id: 'health',     label: 'Kesehatan',  icon: '🏥', color: '#00dddd' },
  { id: 'fun',        label: 'Hiburan',    icon: '🎭', color: '#c3f400' },
  { id: 'salary',     label: 'Gaji',       icon: '💼', color: '#abd600' },
  { id: 'transfer',   label: 'Transfer',   icon: '↔️', color: '#ffabf3' },
  { id: 'other',      label: 'Lainnya',    icon: '➕', color: '#a4899d' },
];

export const ITEM_CATEGORIES = [
  'Makanan', 'Minuman', 'Elektronik', 'Pakaian',
  'Kesehatan', 'Rumah Tangga', 'Kecantikan', 'Olahraga', 'Lainnya',
];

export const ITEM_CAT_ICONS: Record<string, string> = {
  'Makanan':      '🍔',
  'Minuman':      '🥤',
  'Elektronik':   '💻',
  'Pakaian':      '👕',
  'Kesehatan':    '💊',
  'Rumah Tangga': '🏠',
  'Kecantikan':   '💄',
  'Olahraga':     '⚽',
  'Lainnya':      '📦',
};
