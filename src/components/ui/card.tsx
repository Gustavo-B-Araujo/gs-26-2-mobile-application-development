import { Link, type Href } from 'expo-router';
import type { PropsWithChildren, ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Card({ children, style, ...rest }: PropsWithChildren<ViewProps>) {
  const theme = useTheme();
  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.card, { borderColor: theme.border }, style]}
      {...rest}>
      {children}
    </ThemedView>
  );
}

type ListItemProps = {
  titulo: string;
  subtitulo?: string;
  direita?: ReactNode;
  href?: Href;
};

/** Linha de lista. Com `href`, vira link com seta. */
export function ListItem({ titulo, subtitulo, direita, href }: ListItemProps) {
  const theme = useTheme();
  const conteudo = (
    <View style={styles.item}>
      <View style={styles.textos}>
        <ThemedText>{titulo}</ThemedText>
        {subtitulo && (
          <ThemedText type="small" themeColor="textSecondary">
            {subtitulo}
          </ThemedText>
        )}
      </View>
      {direita}
      {href && <ThemedText style={{ color: theme.primary }}>›</ThemedText>}
    </View>
  );

  if (!href) return <Card>{conteudo}</Card>;
  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={subtitulo ? `${titulo}, ${subtitulo}` : titulo}
        style={({ pressed }) => pressed && styles.pressed}>
        <Card>{conteudo}</Card>
      </Pressable>
    </Link>
  );
}

export function SectionTitle({ children }: PropsWithChildren) {
  return (
    <ThemedText
      type="smallBold"
      themeColor="textSecondary"
      accessibilityRole="header"
      style={styles.secao}>
      {children}
    </ThemedText>
  );
}

export function EmptyState({ texto }: { texto: string }) {
  return (
    <Card>
      <ThemedText type="small" themeColor="textSecondary">
        {texto}
      </ThemedText>
    </Card>
  );
}

type BadgeProps = { texto: string; cor?: 'success' | 'warning' | 'danger' | 'textSecondary' };

export function Badge({ texto, cor = 'textSecondary' }: BadgeProps) {
  const theme = useTheme();
  return (
    <View style={[styles.badge, { borderColor: theme[cor] }]}>
      <ThemedText type="small" style={{ color: theme[cor] }}>
        {texto}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.medio,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  textos: { flex: 1, gap: Spacing.half },
  pressed: { opacity: 0.7 },
  secao: { textTransform: 'uppercase', letterSpacing: 0.6, marginTop: Spacing.two },
  badge: {
    borderWidth: 1,
    borderRadius: Radius.pequeno,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
});
