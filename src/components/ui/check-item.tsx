import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Card } from './card';

type CheckItemProps = {
  titulo: string;
  subtitulo?: string;
  marcado: boolean;
  aoAlternar: () => void;
};

/** Linha com caixa de seleção, para escolher vários itens de uma lista. */
export function CheckItem({ titulo, subtitulo, marcado, aoAlternar }: CheckItemProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={subtitulo ? `${titulo}, ${subtitulo}` : titulo}
      aria-checked={marcado}
      onPress={aoAlternar}
      style={({ pressed }) => pressed && styles.pressed}>
      <Card style={marcado && { borderColor: theme.primary }}>
        <View style={styles.item}>
          <View
            style={[
              styles.caixa,
              {
                borderColor: marcado ? theme.primary : theme.border,
                backgroundColor: marcado ? theme.primary : 'transparent',
              },
            ]}>
            {marcado && (
              <ThemedText type="smallBold" style={{ color: theme.onPrimary }}>
                ✓
              </ThemedText>
            )}
          </View>
          <View style={styles.textos}>
            <ThemedText>{titulo}</ThemedText>
            {subtitulo && (
              <ThemedText type="small" themeColor="textSecondary">
                {subtitulo}
              </ThemedText>
            )}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  textos: { flex: 1, gap: Spacing.half },
  caixa: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: Radius.pequeno,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
});
