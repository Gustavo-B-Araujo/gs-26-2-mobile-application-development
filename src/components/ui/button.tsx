import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonProps = {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario' | 'perigo';
  carregando?: boolean;
  desabilitado?: boolean;
};

export function Button({
  titulo,
  onPress,
  variante = 'primario',
  carregando,
  desabilitado,
}: ButtonProps) {
  const theme = useTheme();
  const inativo = desabilitado || carregando;
  const fundo = variante === 'primario' ? theme.primary : theme.backgroundSelected;
  const texto =
    variante === 'primario'
      ? theme.onPrimary
      : variante === 'perigo'
        ? theme.danger
        : theme.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      aria-disabled={!!inativo}
      aria-busy={!!carregando}
      disabled={inativo}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: fundo, opacity: inativo ? 0.5 : pressed ? 0.8 : 1 },
      ]}>
      {carregando ? (
        <ActivityIndicator color={texto} />
      ) : (
        <ThemedText type="smallBold" style={{ color: texto }}>
          {titulo}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: Radius.grande,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
