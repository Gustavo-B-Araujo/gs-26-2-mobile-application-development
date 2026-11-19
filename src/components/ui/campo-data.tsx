import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker, {
    DateTimePickerAndroid,
    type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
    Platform,
    Pressable,
    StyleSheet,
    View,
    type StyleProp,
    type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { dateParaIso, formatarData, isoParaDate } from '@/lib/format';

export type CampoDataProps = {
  rotulo?: string;
  /** 'YYYY-MM-DD', ou null quando não há data. */
  valor: string | null;
  aoMudar: (iso: string | null) => void;
  /** Limites em 'YYYY-MM-DD'. */
  minimo?: string;
  maximo?: string;
  /** Mostra "Limpar" para voltar a "sem data". */
  opcional?: boolean;
  /** Texto pequeno ao lado da data, como "Hoje". */
  detalhe?: string | null;
  estilo?: StyleProp<ViewStyle>;
};

/**
 * Campo de data com calendário. Android: diálogo do sistema. iOS: calendário aberto
 * abaixo do campo. A web usa `campo-data.web.tsx` (o seletor do navegador).
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
  const [abertoIos, setAbertoIos] = useState(false);

  const atual = isoParaDate(valor ?? maximo ?? dateParaIso(new Date()));
  const limites = {
    minimumDate: minimo ? isoParaDate(minimo) : undefined,
    maximumDate: maximo ? isoParaDate(maximo) : undefined,
  };

  function escolher(evento: DateTimePickerEvent, data?: Date) {
    if (Platform.OS === 'ios') setAbertoIos(false);
    if (evento.type === 'set' && data) aoMudar(dateParaIso(data));
  }

  function abrir() {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({ value: atual, mode: 'date', onChange: escolher, ...limites });
    } else {
      setAbertoIos((a) => !a);
    }
  }

  return (
    <View style={[styles.wrapper, estilo]}>
      {rotulo && (
        <ThemedText type="smallBold" themeColor="textSecondary">
          {rotulo}
        </ThemedText>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${rotulo ?? 'Data'}: ${valor ? formatarData(valor) : 'sem data'}`}
        accessibilityHint="Abre o calendário"
        onPress={abrir}
        style={({ pressed }) => [
          styles.campo,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          pressed && styles.pressionado,
        ]}>
        <View style={styles.texto}>
          <ThemedText type="smallBold" themeColor={valor ? 'text' : 'textSecondary'}>
            {valor ? formatarData(valor) : 'Escolher data'}
          </ThemedText>
          {detalhe && (
            <ThemedText type="small" themeColor="textSecondary">
              {detalhe}
            </ThemedText>
          )}
        </View>
        <Ionicons name="calendar-outline" size={20} color={theme.primary} />
      </Pressable>

      {Platform.OS === 'ios' && abertoIos && (
        <DateTimePicker
          value={atual}
          mode="date"
          display="inline"
          locale="pt-BR"
          accentColor={theme.primary}
          themeVariant={esquema}
          onChange={escolher}
          {...limites}
        />
      )}

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
  campo: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.medio,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  texto: { flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two },
  pressionado: { opacity: 0.7 },
});
