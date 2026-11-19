import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

import type { CampoDataProps } from './campo-data';

/**
 * Versão web do campo de data: o `<input type="date">` do navegador, que já traz o calendário.
 * O datetimepicker nativo não roda na web. Clicar em qualquer ponto do campo abre o calendário.
 */
export function CampoData({
  rotulo,
  valor,
  aoMudar,
  minimo,
  maximo,
  opcional,
  detalhe,
  estilo,
}: CampoDataProps) {
  const theme = useTheme();
  const esquema = useColorScheme() === 'dark' ? 'dark' : 'light';

  return (
    <View style={[styles.wrapper, estilo]}>
      {rotulo && (
        <ThemedText type="smallBold" themeColor="textSecondary">
          {rotulo}
        </ThemedText>
      )}
      <View style={styles.linha}>
        <input
          type="date"
          aria-label={rotulo ?? 'Data'}
          value={valor ?? ''}
          min={minimo}
          max={maximo}
          onChange={(e) => aoMudar(e.currentTarget.value || null)}
          onClick={(e) => e.currentTarget.showPicker?.()}
          style={{
            flex: 1,
            minHeight: 48,
            boxSizing: 'border-box',
            border: `1px solid ${theme.border}`,
            borderRadius: Radius.medio,
            padding: `0 ${Spacing.three}px`,
            backgroundColor: theme.backgroundElement,
            color: theme.text,
            fontFamily: Fonts.semiBold,
            fontSize: 16,
            colorScheme: esquema,
            cursor: 'pointer',
          }}
        />
        {detalhe && (
          <ThemedText type="small" themeColor="textSecondary">
            {detalhe}
          </ThemedText>
        )}
      </View>

      {opcional && valor && (
        <Pressable accessibilityRole="button" onPress={() => aoMudar(null)} hitSlop={Spacing.two}>
          <ThemedText type="small" themeColor="primary">
            Limpar data
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.one },
  linha: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
