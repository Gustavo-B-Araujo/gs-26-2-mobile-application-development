import { Stack } from 'expo-router';

import { PainelDoAluno } from '@/components/painel-aluno';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { usePainel } from '@/hooks/use-painel';
import { plural } from '@/lib/format';
import { useSessaoAtiva } from '@/session/session-context';

/**
 * O dia a dia de cada papel: resumo do desempenho (aluno e dependentes), turmas e escolas.
 * O Menu lista as funcionalidades; a conta fica em Configurações.
 */
export default function HomeScreen() {
  const { papeis, pessoa } = useSessaoAtiva();
  const { data, erro, carregando, recarregar } = usePainel({ comBoletins: true });
  const meuBoletim = data?.meuBoletim ?? null;

  const nenhumPapel = Object.values(papeis).every((v) => v === undefined);

  return (
    <>
      <Stack.Screen options={{ title: `Olá, ${pessoa.nome.split(' ')[0]}` }} />
      <Screen carregando={carregando} erro={erro} aoRecarregar={recarregar}>
        {data && (
          <>
            {meuBoletim && (
              <PainelDoAluno
                boletim={meuBoletim}
                detalhe={plural(meuBoletim.turmas.length, 'matéria')}
              />
            )}

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
