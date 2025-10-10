// ReliefSync Design System Tokens

export const colors = {
  rsBg: '#0F1115',
  rsSurface: '#151923',
  rsPrimary: '#7DD3FC',
  rsPrimary600: '#38BDF8',
  rsSecondary: '#A3E635',
  rsAlert: '#F43F5E',
  rsWarn: '#F59E0B',
  rsText: '#E5E7EB',
  rsTextDim: '#9CA3AF',
  rsBorder: '#253042',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const textStyles = {
  H1: {
    size: 28,
    lineHeight: 34,
    weight: '600' as const,
  },
  H2: {
    size: 20,
    lineHeight: 26,
    weight: '600' as const,
  },
  Title: {
    size: 18,
    lineHeight: 24,
    weight: '500' as const,
  },
  Body: {
    size: 15,
    lineHeight: 22,
    weight: '400' as const,
  },
  Caption: {
    size: 12,
    lineHeight: 16,
    weight: '400' as const,
  },
} as const;
