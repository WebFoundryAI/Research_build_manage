/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * DESIGN SYSTEM - Research Build Manager
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * A unified design language for a modern, premium, and futuristic interface.
 * All components should reference these tokens for consistency.
 *
 * Design Philosophy:
 * - Dark-first with elegant light mode support
 * - Violet/Indigo primary accent (futuristic, premium)
 * - Cyan secondary accent (energy, tech)
 * - Deep layered backgrounds for depth
 * - Subtle glows and gradients for polish
 * - 4px base unit spacing system
 * - Clean typography hierarchy
 */

// ─── Color Palette ───────────────────────────────────────────────────────────

export const colors = {
  // Neutrals - Deep navy-tinted grays
  neutral: {
    0: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    850: '#172033',
    900: '#0f172a',
    925: '#0b1120',
    950: '#070b14',
    1000: '#030507',
  },

  // Primary - Violet/Indigo (futuristic, premium)
  primary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065',
  },

  // Secondary - Cyan (energy, tech-forward)
  secondary: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344',
  },

  // Semantic colors
  success: {
    light: '#10b981',
    DEFAULT: '#059669',
    dark: '#047857',
    muted: 'rgba(16, 185, 129, 0.15)',
    glow: 'rgba(16, 185, 129, 0.4)',
  },
  warning: {
    light: '#fbbf24',
    DEFAULT: '#f59e0b',
    dark: '#d97706',
    muted: 'rgba(245, 158, 11, 0.15)',
    glow: 'rgba(245, 158, 11, 0.4)',
  },
  danger: {
    light: '#f87171',
    DEFAULT: '#ef4444',
    dark: '#dc2626',
    muted: 'rgba(239, 68, 68, 0.15)',
    glow: 'rgba(239, 68, 68, 0.4)',
  },
  info: {
    light: '#60a5fa',
    DEFAULT: '#3b82f6',
    dark: '#2563eb',
    muted: 'rgba(59, 130, 246, 0.15)',
    glow: 'rgba(59, 130, 246, 0.4)',
  },
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────

export const typography = {
  fontFamily: {
    sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'SFMono-Regular', 'monospace'],
  },

  // Font sizes with line heights
  fontSize: {
    'xs': ['0.75rem', { lineHeight: '1rem' }],        // 12px
    'sm': ['0.8125rem', { lineHeight: '1.25rem' }],   // 13px
    'base': ['0.875rem', { lineHeight: '1.5rem' }],   // 14px (default body)
    'md': ['0.9375rem', { lineHeight: '1.5rem' }],    // 15px
    'lg': ['1rem', { lineHeight: '1.5rem' }],         // 16px
    'xl': ['1.125rem', { lineHeight: '1.75rem' }],    // 18px
    '2xl': ['1.25rem', { lineHeight: '1.75rem' }],    // 20px
    '3xl': ['1.5rem', { lineHeight: '2rem' }],        // 24px
    '4xl': ['1.875rem', { lineHeight: '2.25rem' }],   // 30px
    '5xl': ['2.25rem', { lineHeight: '2.5rem' }],     // 36px
    '6xl': ['3rem', { lineHeight: '1' }],             // 48px
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// ─── Spacing (4px base unit) ─────────────────────────────────────────────────

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',      // 4px
  1.5: '0.375rem',   // 6px
  2: '0.5rem',       // 8px
  2.5: '0.625rem',   // 10px
  3: '0.75rem',      // 12px
  3.5: '0.875rem',   // 14px
  4: '1rem',         // 16px
  5: '1.25rem',      // 20px
  6: '1.5rem',       // 24px
  7: '1.75rem',      // 28px
  8: '2rem',         // 32px
  9: '2.25rem',      // 36px
  10: '2.5rem',      // 40px
  11: '2.75rem',     // 44px
  12: '3rem',        // 48px
  14: '3.5rem',      // 56px
  16: '4rem',        // 64px
  20: '5rem',        // 80px
  24: '6rem',        // 96px
  28: '7rem',        // 112px
  32: '8rem',        // 128px
} as const;

// ─── Border Radius ───────────────────────────────────────────────────────────

export const borderRadius = {
  none: '0',
  sm: '0.25rem',     // 4px
  DEFAULT: '0.375rem', // 6px
  md: '0.5rem',      // 8px
  lg: '0.75rem',     // 12px
  xl: '1rem',        // 16px
  '2xl': '1.25rem',  // 20px
  '3xl': '1.5rem',   // 24px
  full: '9999px',
} as const;

// ─── Shadows ─────────────────────────────────────────────────────────────────

export const shadows = {
  // Elevation shadows (dark mode optimized)
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',

  // Glow effects (for dark mode)
  'glow-primary': '0 0 20px rgba(139, 92, 246, 0.3)',
  'glow-primary-lg': '0 0 40px rgba(139, 92, 246, 0.4)',
  'glow-secondary': '0 0 20px rgba(6, 182, 212, 0.3)',
  'glow-secondary-lg': '0 0 40px rgba(6, 182, 212, 0.4)',
  'glow-success': '0 0 12px rgba(16, 185, 129, 0.4)',
  'glow-warning': '0 0 12px rgba(245, 158, 11, 0.4)',
  'glow-danger': '0 0 12px rgba(239, 68, 68, 0.4)',

  // Card shadows
  'card': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)',
  'card-hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
  'card-dark': '0 0 0 1px rgba(255, 255, 255, 0.05)',
  'card-dark-hover': '0 0 30px rgba(139, 92, 246, 0.1), 0 0 0 1px rgba(139, 92, 246, 0.2)',
} as const;

// ─── Gradients ───────────────────────────────────────────────────────────────

export const gradients = {
  // Primary gradients
  'primary': 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
  'primary-vivid': 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%)',
  'primary-subtle': 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',

  // Secondary gradients
  'secondary': 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
  'secondary-vivid': 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 50%, #0891b2 100%)',

  // Mixed accent gradient (hero/feature elements)
  'accent': 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
  'accent-vivid': 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 30%, #06b6d4 70%, #22d3ee 100%)',

  // Background gradients
  'dark-radial': 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #070b14 100%)',
  'dark-subtle': 'linear-gradient(180deg, #0f172a 0%, #070b14 100%)',
  'mesh-dark': 'radial-gradient(at 40% 20%, rgba(139, 92, 246, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(6, 182, 212, 0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(139, 92, 246, 0.1) 0px, transparent 50%)',

  // Status gradients
  'success': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  'warning': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
  'danger': 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
} as const;

// ─── Animation / Transitions ─────────────────────────────────────────────────

export const animation = {
  // Timing functions
  easing: {
    DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Durations
  duration: {
    fastest: '50ms',
    faster: '100ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '400ms',
    slowest: '500ms',
  },

  // Transitions
  transition: {
    none: 'none',
    all: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'color, background-color, border-color, text-decoration-color, fill, stroke 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    shadow: 'box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ─── Z-Index Scale ───────────────────────────────────────────────────────────

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// ─── Component-Specific Tokens ───────────────────────────────────────────────

export const components = {
  // Sidebar
  sidebar: {
    width: '280px',
    widthCollapsed: '80px',
    bg: {
      light: colors.neutral[0],
      dark: colors.neutral[925],
    },
    border: {
      light: colors.neutral[200],
      dark: `rgba(148, 163, 184, 0.08)`,
    },
  },

  // Cards
  card: {
    padding: spacing[5],
    radius: borderRadius.xl,
    bg: {
      light: colors.neutral[0],
      dark: colors.neutral[900],
    },
    border: {
      light: colors.neutral[200],
      dark: `rgba(148, 163, 184, 0.08)`,
    },
  },

  // Buttons
  button: {
    height: {
      xs: '1.75rem',    // 28px
      sm: '2rem',       // 32px
      md: '2.5rem',     // 40px
      lg: '2.75rem',    // 44px
      xl: '3rem',       // 48px
    },
    padding: {
      xs: `${spacing[1.5]} ${spacing[2.5]}`,
      sm: `${spacing[2]} ${spacing[3]}`,
      md: `${spacing[2.5]} ${spacing[4]}`,
      lg: `${spacing[3]} ${spacing[5]}`,
      xl: `${spacing[3.5]} ${spacing[6]}`,
    },
    radius: borderRadius.lg,
  },

  // Inputs
  input: {
    height: {
      sm: '2rem',       // 32px
      md: '2.5rem',     // 40px
      lg: '2.75rem',    // 44px
    },
    padding: `${spacing[2.5]} ${spacing[3]}`,
    radius: borderRadius.lg,
    bg: {
      light: colors.neutral[50],
      dark: colors.neutral[850],
    },
    border: {
      light: colors.neutral[300],
      dark: `rgba(148, 163, 184, 0.15)`,
    },
    borderFocus: {
      light: colors.primary[500],
      dark: colors.primary[400],
    },
  },

  // Badges
  badge: {
    padding: `${spacing[1]} ${spacing[2.5]}`,
    radius: borderRadius.full,
    fontSize: typography.fontSize.xs,
  },

  // Modal
  modal: {
    maxWidth: {
      sm: '24rem',      // 384px
      md: '28rem',      // 448px
      lg: '32rem',      // 512px
      xl: '36rem',      // 576px
      '2xl': '42rem',   // 672px
      full: '100%',
    },
    radius: borderRadius['2xl'],
    padding: spacing[6],
  },

  // Table
  table: {
    headerBg: {
      light: colors.neutral[50],
      dark: colors.neutral[850],
    },
    rowHover: {
      light: colors.neutral[50],
      dark: `rgba(139, 92, 246, 0.04)`,
    },
    border: {
      light: colors.neutral[200],
      dark: `rgba(148, 163, 184, 0.08)`,
    },
  },
} as const;

// ─── Semantic Theme Tokens ───────────────────────────────────────────────────
// These are the tokens that should be used throughout the app via CSS variables

export const themeTokens = {
  light: {
    // Backgrounds
    '--bg-app': colors.neutral[50],
    '--bg-surface': colors.neutral[0],
    '--bg-surface-secondary': colors.neutral[100],
    '--bg-surface-tertiary': colors.neutral[200],
    '--bg-elevated': colors.neutral[0],
    '--bg-overlay': 'rgba(15, 23, 42, 0.4)',
    '--bg-input': colors.neutral[0],
    '--bg-input-hover': colors.neutral[50],

    // Text
    '--text-primary': colors.neutral[900],
    '--text-secondary': colors.neutral[600],
    '--text-tertiary': colors.neutral[500],
    '--text-muted': colors.neutral[400],
    '--text-inverted': colors.neutral[0],

    // Borders
    '--border-subtle': colors.neutral[200],
    '--border-default': colors.neutral[300],
    '--border-strong': colors.neutral[400],
    '--border-focus': colors.primary[500],

    // Accent colors
    '--accent-primary': colors.primary[600],
    '--accent-primary-hover': colors.primary[700],
    '--accent-secondary': colors.secondary[600],
    '--accent-secondary-hover': colors.secondary[700],

    // Status colors
    '--status-success': colors.success.DEFAULT,
    '--status-success-bg': colors.success.muted,
    '--status-warning': colors.warning.DEFAULT,
    '--status-warning-bg': colors.warning.muted,
    '--status-danger': colors.danger.DEFAULT,
    '--status-danger-bg': colors.danger.muted,
    '--status-info': colors.info.DEFAULT,
    '--status-info-bg': colors.info.muted,
  },
  dark: {
    // Backgrounds
    '--bg-app': colors.neutral[950],
    '--bg-surface': colors.neutral[900],
    '--bg-surface-secondary': colors.neutral[850],
    '--bg-surface-tertiary': colors.neutral[800],
    '--bg-elevated': colors.neutral[850],
    '--bg-overlay': 'rgba(0, 0, 0, 0.7)',
    '--bg-input': colors.neutral[850],
    '--bg-input-hover': colors.neutral[800],

    // Text
    '--text-primary': colors.neutral[50],
    '--text-secondary': colors.neutral[400],
    '--text-tertiary': colors.neutral[500],
    '--text-muted': colors.neutral[600],
    '--text-inverted': colors.neutral[950],

    // Borders
    '--border-subtle': 'rgba(148, 163, 184, 0.08)',
    '--border-default': 'rgba(148, 163, 184, 0.12)',
    '--border-strong': 'rgba(148, 163, 184, 0.2)',
    '--border-focus': colors.primary[400],

    // Accent colors
    '--accent-primary': colors.primary[400],
    '--accent-primary-hover': colors.primary[300],
    '--accent-secondary': colors.secondary[400],
    '--accent-secondary-hover': colors.secondary[300],

    // Status colors
    '--status-success': colors.success.light,
    '--status-success-bg': colors.success.muted,
    '--status-warning': colors.warning.light,
    '--status-warning-bg': colors.warning.muted,
    '--status-danger': colors.danger.light,
    '--status-danger-bg': colors.danger.muted,
    '--status-info': colors.info.light,
    '--status-info-bg': colors.info.muted,
  },
} as const;

// ─── Tailwind Class Helpers ──────────────────────────────────────────────────
// Common class combinations for consistency

export const classes = {
  // Page containers
  pageContainer: 'min-h-screen bg-neutral-50 dark:bg-neutral-950',
  pageContent: 'p-6 lg:p-8',

  // Cards
  card: 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/[0.08] rounded-xl shadow-card dark:shadow-card-dark',
  cardHover: 'hover:shadow-card-hover dark:hover:shadow-card-dark-hover hover:border-neutral-300 dark:hover:border-primary-500/30 transition-all duration-200',
  cardInteractive: 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/[0.08] rounded-xl shadow-card dark:shadow-card-dark hover:shadow-card-hover dark:hover:shadow-card-dark-hover hover:border-neutral-300 dark:hover:border-primary-500/30 transition-all duration-200 cursor-pointer',

  // Typography
  heading1: 'text-3xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight',
  heading2: 'text-2xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight',
  heading3: 'text-xl font-semibold text-neutral-900 dark:text-neutral-50',
  heading4: 'text-lg font-semibold text-neutral-900 dark:text-neutral-50',
  bodyLarge: 'text-base text-neutral-700 dark:text-neutral-300',
  body: 'text-sm text-neutral-600 dark:text-neutral-400',
  bodySmall: 'text-xs text-neutral-500 dark:text-neutral-500',
  label: 'text-sm font-medium text-neutral-700 dark:text-neutral-300',

  // Buttons
  btnBase: 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed',
  btnPrimary: 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-md hover:shadow-lg hover:shadow-primary-500/25 focus:ring-primary-500',
  btnSecondary: 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 focus:ring-neutral-500',
  btnGhost: 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 focus:ring-neutral-500',
  btnDanger: 'bg-danger-DEFAULT hover:bg-danger-dark text-white shadow-md hover:shadow-lg hover:shadow-danger-DEFAULT/25 focus:ring-danger-DEFAULT',

  // Inputs
  input: 'w-full px-3 py-2.5 bg-white dark:bg-neutral-850 border border-neutral-300 dark:border-white/[0.12] rounded-lg text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 dark:focus:border-primary-400 transition-all duration-200',
  inputLabel: 'block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5',

  // Badges
  badgeBase: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  badgeSuccess: 'bg-success-muted text-success-DEFAULT dark:text-success-light',
  badgeWarning: 'bg-warning-muted text-warning-dark dark:text-warning-light',
  badgeDanger: 'bg-danger-muted text-danger-DEFAULT dark:text-danger-light',
  badgeInfo: 'bg-info-muted text-info-DEFAULT dark:text-info-light',
  badgeNeutral: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400',
  badgePrimary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',

  // Tables
  tableWrapper: 'overflow-hidden rounded-xl border border-neutral-200 dark:border-white/[0.08]',
  tableHead: 'bg-neutral-50 dark:bg-neutral-850',
  tableHeadCell: 'px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider',
  tableBody: 'bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-white/[0.08]',
  tableRow: 'hover:bg-neutral-50 dark:hover:bg-primary-500/[0.04] transition-colors duration-150',
  tableCell: 'px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300',

  // Modal
  modalOverlay: 'fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-modal',
  modalContainer: 'fixed inset-0 flex items-center justify-center p-4 z-modal',
  modalContent: 'bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-white/[0.08] w-full max-w-lg',
  modalHeader: 'px-6 py-4 border-b border-neutral-200 dark:border-white/[0.08]',
  modalBody: 'px-6 py-4',
  modalFooter: 'px-6 py-4 border-t border-neutral-200 dark:border-white/[0.08] flex justify-end gap-3',

  // Sidebar
  sidebarItem: 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/[0.06] hover:text-neutral-900 dark:hover:text-neutral-100 transition-all duration-200',
  sidebarItemActive: 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 font-medium',

  // Utilities
  glassMorphism: 'backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80',
  glow: 'shadow-glow-primary',
  gradientText: 'bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent',
} as const;

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  gradients,
  animation,
  zIndex,
  components,
  themeTokens,
  classes,
};
