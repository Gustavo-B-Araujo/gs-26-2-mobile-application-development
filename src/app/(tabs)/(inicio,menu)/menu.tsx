import { Redirect, useSegments, type Href } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { usePainel } from '@/hooks/use-painel';

/**
 * Todas as funcionalidades do app, separadas por categoria.
 * Cada categoria só aparece para o papel que pode usá-la.
 */
export default function MenuScreen() {
  const { data, erro, carregando, recarregar } = usePainel();
  const segmentos: string[] = useSegments();

  /**
   * Link direto (recarregar na web) resolve `/menu` no primeiro grupo em ordem alfabética,
   * o `(inicio)`. Manda para a aba Menu, para o voltar das telas abertas aqui levar ao Menu.
   */
  if (segmentos.includes('(inicio)')) return <Redirect href={'/(tabs)/(menu)/menu' as Href} />;

  return (
    <Screen carregando={carregando} erro={erro} aoRecarregar={recarregar}>
      {data && (
        <Card>
          <ThemedText type="small" themeColor="textSecondary">
            Nenhuma funcionalidade para o seu usuário ainda. Peça à escola para vincular você como
            aluno, guardião, professor ou diretor.
          </ThemedText>
        </Card>
      )}
    </Screen>
  );
}
