import type { PropsWithChildren, ReactNode } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Button } from './button';

type ScreenProps = PropsWithChildren<{
  carregando?: boolean;
  erro?: string | null;
  aoRecarregar?: () => void;
  rodape?: ReactNode;
}>;

/**
 * Corpo padrão de tela: rolagem, puxar para recarregar, estados de carga e erro.
 * O header nativo do Stack já cuida da área segura do topo.
 */
export function Screen({ children, carregando, erro, aoRecarregar, rodape }: ScreenProps) {
  const theme = useTheme();
  const semConteudo = carregando && !children;

  return (
    <ThemedView style={styles.fill}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        refreshControl={
          aoRecarregar ? (
            <RefreshControl refreshing={!!carregando && !semConteudo} onRefresh={aoRecarregar} />
          ) : undefined
        }>
        <View style={styles.inner}>
          {erro ? (
            <View style={styles.centro}>
              <ThemedText themeColor="danger">{erro}</ThemedText>
              {aoRecarregar && (
                <Button titulo="Tentar de novo" variante="secundario" onPress={aoRecarregar} />
              )}
            </View>
          ) : semConteudo ? (
            <View style={styles.centro}>
              <ActivityIndicator color={theme.primary} />
            </View>
          ) : (
            children
          )}
        </View>
      </ScrollView>
      {rodape && !erro && (
        <View style={[styles.rodape, { borderColor: theme.border }]}>{rodape}</View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: Spacing.three, paddingBottom: Spacing.six, alignItems: 'center' },
  inner: { width: '100%', maxWidth: MaxContentWidth, gap: Spacing.three },
  centro: { paddingVertical: Spacing.six, alignItems: 'center', gap: Spacing.three },
  rodape: {
    padding: Spacing.three,
    paddingBottom: Spacing.five,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
