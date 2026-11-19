import { Platform } from 'react-native';

/** Identidade visual do Boletim Plus: roxo (confiança) com destaque âmbar (o "+"). */
export const Colors = {
  light: {
    text: '#1B1A3A',
    background: '#F6F6FB',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#ECEBFF',
    textSecondary: '#5E5D7A',
    border: '#DCDBEA',
    primary: '#4B3FE0',
    onPrimary: '#FFFFFF',
    accent: '#B87400',
    success: '#16803C',
    warning: '#9A6200',
    danger: '#C8202E',
  },
  dark: {
    text: '#F2F1FF',
    background: '#0F0E1F',
    backgroundElement: '#1B1A33',
    backgroundSelected: '#2A2850',
    textSecondary: '#A9A7C7',
    border: '#34325A',
    primary: '#8F87FF',
    onPrimary: '#0F0E1F',
    accent: '#FFC25A',
    success: '#4ADE80',
    warning: '#F5B83D',
    danger: '#FF6B6B',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Nomes registrados pelo `useFonts` em `src/app/_layout.tsx`. */
export const Fonts = {
  regular: 'Nunito_400Regular',
  semiBold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extraBold: 'Nunito_800ExtraBold',
  mono: Platform.select({ ios: 'Menlo', default: 'monospace' }),
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  pequeno: 8,
  medio: 14,
  grande: 24,
} as const;

export const MaxContentWidth = 800;
