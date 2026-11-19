import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card, ListItem, SectionTitle } from '@/components/ui/card';
import { ChipGroup } from '@/components/ui/chip-group';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import type { Papeis } from '@/data';
import {
  definirPreferenciaTema,
  usePreferenciaTema,
  type PreferenciaTema,
} from '@/hooks/use-preferencia-tema';
import { confirmar } from '@/lib/dialogos';
import { formatarCpf } from '@/lib/format';
import { useSessaoAtiva, useSession } from '@/session/session-context';

const NOMES_PAPEIS: [keyof Papeis, string][] = [
  ['diretorCod', 'Diretor'],
  ['professorCod', 'Professor'],
  ['guardiaoCod', 'Responsável'],
  ['alunoCod', 'Aluno'],
];

const OPCOES_TEMA: { valor: PreferenciaTema; rotulo: string }[] = [
  { valor: 'sistema', rotulo: 'Automático' },
  { valor: 'claro', rotulo: 'Claro' },
  { valor: 'escuro', rotulo: 'Escuro' },
];

/** Conta (dados, sair), aparência e aplicativo. */
export default function ConfiguracoesScreen() {
  const { pessoa, papeis } = useSessaoAtiva();
  const { sair } = useSession();
  const { preferencia } = usePreferenciaTema();
  const nomesPapeis = NOMES_PAPEIS.filter(([chave]) => papeis[chave] !== undefined).map(
    ([, nome]) => nome,
  );

  async function confirmarSaida() {
    if (await confirmar('Sair da conta?', 'Você volta para a tela de login.', 'Sair')) {
      await sair();
    }
  }

  return (
    <Screen>
      <SectionTitle>Conta</SectionTitle>
      <Card>
        <ThemedText type="smallBold">{pessoa.nome}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          CPF {formatarCpf(pessoa.num_documento)}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {nomesPapeis.length ? nomesPapeis.join(' · ') : 'Sem papel na escola'}
        </ThemedText>
      </Card>

      <SectionTitle>Aparência</SectionTitle>
      <Card>
        <ChipGroup
          opcoes={OPCOES_TEMA}
          selecionado={preferencia}
          aoSelecionar={definirPreferenciaTema}
        />
        <ThemedText type="small" themeColor="textSecondary">
          Automático segue o tema do celular.
        </ThemedText>
      </Card>

      <SectionTitle>Aplicativo</SectionTitle>
      <ListItem titulo="Sobre o App" subtitulo="Versão e commit do build" href="/sobre" />

      <View style={styles.sair}>
        <Button titulo="Sair da conta" variante="perigo" onPress={confirmarSaida} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sair: { marginTop: Spacing.three },
});
