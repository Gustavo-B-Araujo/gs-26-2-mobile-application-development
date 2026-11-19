import { Redirect, useSegments, type Href } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Card, ListItem, SectionTitle } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { usePainel } from '@/hooks/use-painel';
import { useSessaoAtiva } from '@/session/session-context';

/**
 * Todas as funcionalidades do app, separadas por categoria.
 * Cada categoria só aparece para o papel que pode usá-la.
 */
export default function MenuScreen() {
  const { papeis } = useSessaoAtiva();
  const { data, erro, carregando, recarregar } = usePainel();
  const segmentos: string[] = useSegments();

  /**
   * Link direto (recarregar na web) resolve `/menu` no primeiro grupo em ordem alfabética,
   * o `(inicio)`. Manda para a aba Menu, para o voltar das telas abertas aqui levar ao Menu.
   */
  if (segmentos.includes('(inicio)')) return <Redirect href={'/(tabs)/(menu)/menu' as Href} />;

  const acompanha = papeis.alunoCod !== undefined || (data?.dependentes?.length ?? 0) > 0;
  const nenhumaCategoria = data !== null && !acompanha;

  return (
    <Screen carregando={carregando} erro={erro} aoRecarregar={recarregar}>
      {data && (
        <>
          {acompanha && (
            <>
              <SectionTitle>Acompanhamento</SectionTitle>
              {papeis.alunoCod !== undefined && (
                <>
                  <ListItem
                    titulo="Meu boletim"
                    subtitulo="Notas e médias por matéria"
                    href={{ pathname: '/aluno/[cod]', params: { cod: papeis.alunoCod } }}
                  />
                  <ListItem
                    titulo="Minha frequência"
                    subtitulo="Presenças e faltas por matéria"
                    href={{ pathname: '/aluno/[cod]/frequencia', params: { cod: papeis.alunoCod } }}
                  />
                </>
              )}
              {/* Guardião: uma tela de cada, com o dependente escolhido no topo. */}
              {(data.dependentes?.length ?? 0) > 0 && (
                <>
                  <ListItem
                    titulo="Boletim"
                    subtitulo="Escolha o aluno e veja notas e médias"
                    href="/dependentes/boletim"
                  />
                  <ListItem
                    titulo="Frequência"
                    subtitulo="Escolha o aluno e veja presenças e faltas"
                    href="/dependentes/frequencia"
                  />
                </>
              )}
            </>
          )}

          {nenhumaCategoria && (
            <Card>
              <ThemedText type="small" themeColor="textSecondary">
                Nenhuma funcionalidade para o seu usuário ainda. Peça à escola para vincular você
                como aluno, guardião, professor ou diretor.
              </ThemedText>
            </Card>
          )}
        </>
      )}
    </Screen>
  );
}
