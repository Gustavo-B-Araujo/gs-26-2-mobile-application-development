import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'subtitle' | 'small' | 'smallBold' | 'link' | 'code';
  themeColor?: ThemeColor;
};

/**
 * Texto com a fonte e as cores do tema.
 * Com fonte customizada, o peso vem da família (Nunito_700Bold), não do `fontWeight`.
 */
export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const cor = themeColor ?? (type === 'link' ? 'primary' : 'text');

  return <Text style={[{ color: theme[cor] }, styles[type], style]} {...rest} />;
}

const styles = StyleSheet.create({
  default: { fontFamily: Fonts.semiBold, fontSize: 16, lineHeight: 24 },
  title: { fontFamily: Fonts.extraBold, fontSize: 34, lineHeight: 40 },
  subtitle: { fontFamily: Fonts.extraBold, fontSize: 28, lineHeight: 36 },
  small: { fontFamily: Fonts.semiBold, fontSize: 14, lineHeight: 20 },
  smallBold: { fontFamily: Fonts.bold, fontSize: 14, lineHeight: 20 },
  link: { fontFamily: Fonts.bold, fontSize: 14, lineHeight: 30 },
  code: { fontFamily: Fonts.mono, fontSize: 13 },
});
