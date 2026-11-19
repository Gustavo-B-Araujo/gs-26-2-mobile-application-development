import { Stack } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { usePainel } from '@/hooks/use-painel';
import { useSessaoAtiva } from '@/session/session-context';

/**
 * O dia a dia de cada papel.
 * O Menu lista as funcionalidades; a conta fica em Configurações.
 */
export default function HomeScreen() {
  const { papeis, pessoa } = useSessaoAtiva();
  const { data, erro, carregando, recarregar } = usePainel();

  const nenhumPapel = Object.values(papeis).every((v) => v === undefined);

  return (
    <>
      <Stack.Screen options={{ title: `Olá, ${pessoa.nome.split(' ')[0]}` }} />
      <Screen carregando={carregando} erro={erro} aoRecarregar={recarregar}>
        {data && (
          <>
            {nenhumPapel && (
              <Card>
                <ThemedText>Seu usuário não tem papel na escola.</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Peça à secretaria para vincular você como aluno, guardião, professor ou diretor.
                </ThemedText>
              </Card>
            )}
          </>
        )}
      </Screen>
    </>
  );
}
