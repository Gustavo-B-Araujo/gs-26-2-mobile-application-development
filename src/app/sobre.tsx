import Constants from 'expo-constants';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';

/** Gerado em `app.config.js` no momento do build. */
const commitHash = String(Constants.expoConfig?.extra?.commitHash ?? 'sem-commit');
const versao = Constants.expoConfig?.version ?? '?';

function Linha({ rotulo, valor, mono }: { rotulo: string; valor: string; mono?: boolean }) {
  return (
    <View style={styles.linha}>
      <ThemedText type="small" themeColor="textSecondary">
        {rotulo}
      </ThemedText>
      <ThemedText type={mono ? 'code' : 'smallBold'} selectable>
        {valor}
      </ThemedText>
    </View>
  );
}

export default function SobreScreen() {
  return (
    <Screen>
      <View style={styles.logo}>
        <Logo />
      </View>

      <Card>
        <Linha rotulo="Versão" valor={versao} />
        <Linha rotulo="Commit" valor={commitHash} mono />
      </Card>

      <Card>
        <ThemedText type="smallBold">O que é</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          O Boletim Plus aproxima família e escola pública: o professor lança notas e chamada, e o
          responsável acompanha o desempenho do aluno em tempo real.
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Global Solution 2026/2 · FIAP · CitizenTech
        </ThemedText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: { paddingVertical: Spacing.three },
  linha: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.three },
});
