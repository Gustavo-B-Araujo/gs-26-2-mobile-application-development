import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Badge, Card, EmptyState, ListItem, SectionTitle } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { formatarData, nomeTurma, plural } from '@/lib/format';
import { useSessaoAtiva } from '@/session/session-context';

export default function TurmaScreen() {
  const cod = Number(useLocalSearchParams<{ cod: string }>().cod);
  const { papeis, repository } = useSessaoAtiva();
  const {
    data: turma,
    erro,
    carregando,
    recarregar,
  } = useAsync(useCallback(() => repository.obterTurma(cod), [repository, cod]));

  const ehProfessor = turma !== null && turma.professorCod === papeis.professorCod;
  // Só o diretor desta escola chega aqui sem ser professor, aluno ou guardião da turma.
  const ehDiretor = papeis.diretorCod !== undefined;
  // Aluno e guardião não veem a lista de colegas nem as notas da turma: veem o boletim.
  const veTurmaInteira = ehProfessor || ehDiretor;

  return (
    <Screen carregando={carregando} erro={erro} aoRecarregar={recarregar}>
      {turma && (
        <>
          <Stack.Screen options={{ title: nomeTurma(turma) }} />
          <Card>
            <ThemedText type="smallBold">{nomeTurma(turma)}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {turma.escolaNome}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Prof. {turma.professorNome} · {plural(turma.totalAlunos, 'aluno')}
            </ThemedText>
          </Card>

          {ehProfessor && (
            <View style={styles.acoes}>
              <View style={styles.acao}>
                <Button
                  titulo="Fazer chamada"
                  onPress={() => router.push({ pathname: '/turma/[cod]/chamada', params: { cod } })}
                />
              </View>
              <View style={styles.acao}>
                <Button
                  titulo="Nova avaliação"
                  variante="secundario"
                  onPress={() =>
                    router.push({ pathname: '/turma/[cod]/nova-avaliacao', params: { cod } })
                  }
                />
              </View>
            </View>
          )}

          <SectionTitle>Avaliações</SectionTitle>
          {turma.avaliacoes.length === 0 && <EmptyState texto="Nenhuma avaliação cadastrada." />}
          {turma.avaliacoes.map((a) => {
            const completa = a.notasLancadas === turma.totalAlunos;
            return (
              <ListItem
                key={a.cod}
                titulo={a.nome}
                subtitulo={`${a.tipoNota} · ${formatarData(a.dataAvaliacao)}`}
                direita={
                  veTurmaInteira ? (
                    <Badge
                      texto={`${a.notasLancadas}/${turma.totalAlunos}`}
                      cor={completa ? 'success' : a.notasLancadas ? 'warning' : 'textSecondary'}
                    />
                  ) : undefined
                }
                href={
                  veTurmaInteira
                    ? { pathname: '/avaliacao/[cod]', params: { cod: a.cod } }
                    : undefined
                }
              />
            );
          })}

          {veTurmaInteira && (
            <>
              <SectionTitle>Alunos</SectionTitle>
              {ehDiretor && (
                <Button
                  titulo="Matricular alunos"
                  variante="secundario"
                  onPress={() =>
                    router.push({ pathname: '/turma/[cod]/matricular', params: { cod } })
                  }
                />
              )}
              {turma.alunos.length === 0 && (
                <EmptyState
                  texto={
                    ehDiretor
                      ? 'Nenhum aluno matriculado. Toque em Matricular alunos.'
                      : 'Nenhum aluno matriculado. Peça ao diretor da escola para matricular.'
                  }
                />
              )}
              {turma.alunos.map((al) => (
                <ListItem
                  key={al.turmaAlunoCod}
                  titulo={al.nome}
                  href={{ pathname: '/aluno/[cod]', params: { cod: al.alunoCod } }}
                />
              ))}
            </>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  acoes: { flexDirection: 'row', gap: Spacing.two },
  acao: { flex: 1 },
});
