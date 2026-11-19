import { DarkTheme, DefaultTheme } from 'expo-router';

import { Colors, Fonts } from './theme';

type Esquema = 'light' | 'dark';

/** Tema do React Navigation (header, fundo das telas) com as cores e a fonte do app. */
export function criarNavigationTheme(esquema: Esquema) {
  const base = esquema === 'dark' ? DarkTheme : DefaultTheme;
  const cores = Colors[esquema];
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: cores.primary,
      background: cores.background,
      card: cores.backgroundElement,
      text: cores.text,
      border: cores.border,
    },
    fonts: {
      regular: { fontFamily: Fonts.regular, fontWeight: 'normal' as const },
      medium: { fontFamily: Fonts.semiBold, fontWeight: 'normal' as const },
      bold: { fontFamily: Fonts.bold, fontWeight: 'normal' as const },
      heavy: { fontFamily: Fonts.extraBold, fontWeight: 'normal' as const },
    },
  };
}
