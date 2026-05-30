// Minimal HUD-oriented design tokens for the POC. High-contrast, large type —
// the HUD must be legible on a head-mounted phone at a glance (spec §9).

export const colors = {
  bg: '#0B0E12',
  surface: '#161B22',
  surfaceElevated: '#21262D',
  textPrimary: '#F0F3F6',
  textSecondary: '#8B949E',
  textTertiary: '#56606A',
  // Per-metric confidence (spec §9): green = high, amber = uncertain.
  confHigh: '#56D364',
  confLow: '#E3B341',
  danger: '#F85149',
  accent: '#58A6FF',
  rec: '#F85149',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
};
