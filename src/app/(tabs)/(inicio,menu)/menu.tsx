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
  const nenhumaCategoria =
    data !== null && !acompanha && data.turmasProfessor === null && data.escolas === null;

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

          {data.turmasProfessor && data.turmasProfessor.length > 0 && (
            <>
              <SectionTitle>Sala de aula</SectionTitle>
              <ListItem
                titulo="Fazer chamada"
                subtitulo="Escolha a matéria e marque a presença"
                href="/chamada"
              />
              <ListItem
                titulo="Nova avaliação"
                subtitulo="Escolha a matéria e crie a avaliação"
                href="/nova-avaliacao"
              />
            </>
          )}

          {data.escolas && data.escolas.length > 0 && (
            <>
              <SectionTitle>Gestão escolar</SectionTitle>
              {data.escolas.map((e) => (
                <ListItem
                  key={`professores-${e.cod}`}
                  titulo="Professores da escola"
                  subtitulo={e.nome}
                  href={{ pathname: '/escola/[cod]/professores', params: { cod: e.cod } }}
                />
              ))}
              {data.escolas.map((e) => (
                <ListItem
                  key={`alunos-${e.cod}`}
                  titulo="Alunos da escola"
                  subtitulo={e.nome}
                  href={{ pathname: '/escola/[cod]/alunos', params: { cod: e.cod } }}
                />
              ))}
            </>
          )}

          {data.escolas && (
            <>
              <SectionTitle>Cadastros da rede</SectionTitle>
              <ListItem
                titulo="Cadastrar professor"
                subtitulo="Disponível para todas as escolas"
                href="/professor/novo"
              />
              <ListItem
                titulo="Cadastrar aluno"
                subtitulo="Depois, matricule o aluno na turma"
                href="/aluno/novo"
              />
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
