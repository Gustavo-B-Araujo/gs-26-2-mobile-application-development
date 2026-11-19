import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Opcao<T> = { valor: T; rotulo: string };

type ChipGroupProps<T> = {
  opcoes: Opcao<T>[];
  selecionado: T | null;
  aoSelecionar: (valor: T) => void;
};

/** Escolha única entre poucas opções (matéria, tipo de presença, tipo de nota). */
export function ChipGroup<T extends string | number>({
  opcoes,
  selecionado,
  aoSelecionar,
}: ChipGroupProps<T>) {
  const theme = useTheme();
  return (
    <View style={styles.grupo} accessibilityRole="radiogroup">
      {opcoes.map((o) => {
        const ativo = o.valor === selecionado;
        return (
          <Pressable
            key={String(o.valor)}
            accessibilityRole="radio"
            accessibilityLabel={o.rotulo}
            aria-checked={ativo}
            onPress={() => aoSelecionar(o.valor)}
            style={[
              styles.chip,
              {
                backgroundColor: ativo ? theme.primary : theme.background,
                borderColor: ativo ? theme.primary : theme.border,
              },
            ]}>
            <ThemedText type="small" style={{ color: ativo ? theme.onPrimary : theme.text }}>
              {o.rotulo}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    minHeight: 36,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radius.grande,
    paddingHorizontal: Spacing.three,
  },
});
