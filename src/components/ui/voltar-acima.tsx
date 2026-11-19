import Ionicons from '@expo/vector-icons/Ionicons';
import { router, usePathname, type Href } from 'expo-router';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Tela de cima na hierarquia da URL: `/escola/1/professores` → `/escola/1`.
 * Telas de primeiro nível (`/escola/1`, `/professor/novo`, `/sobre`) voltam ao Início.
 */
function rotaDeCima(caminho: string): Href {
  const partes = caminho.split('/').filter(Boolean);
  return (partes.length >= 3 ? `/${partes.slice(0, 2).join('/')}` : '/') as Href;
}

/**
 * Seta de voltar para quando a pilha está vazia: na web, depois de recarregar a página
 * ou de abrir a URL direto, não existe tela anterior e a seta padrão some.
 * Na web, o modal também aparece sem a seta: aí existe histórico, e o botão volta por ele
 * (Início › Cadastrar turma volta ao Início, não à escola).
 */
export function VoltarAcima() {
  const theme = useTheme();
  const caminho = usePathname();
  function voltar() {
    if (router.canGoBack()) router.back();
    else router.replace(rotaDeCima(caminho));
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Voltar"
      hitSlop={Spacing.three}
      onPress={voltar}
      style={({ pressed }) => [styles.base, pressed && styles.pressed]}>
      <Ionicons name={ICONE} size={24} color={theme.text} />
    </Pressable>
  );
}

/** Mesmo ícone da seta nativa do header: chevron no iOS, seta no Android e na web. */
const ICONE = Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back';

const styles = StyleSheet.create({
  base: { paddingHorizontal: Spacing.two },
  pressed: { opacity: 0.6 },
});
