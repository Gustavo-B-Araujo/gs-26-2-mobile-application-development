import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Badge, Card, EmptyState, ListItem, SectionTitle } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { useAsync } from '@/hooks/use-async';
import { nomeTurma, plural } from '@/lib/format';
import { useSessaoAtiva } from '@/session/session-context';

export default function EscolaScreen() {
  const cod = Number(useLocalSearchParams<{ cod: string }>().cod);
  const { repository } = useSessaoAtiva();
  const { data, erro, carregando, recarregar } = useAsync(
    useCallback(
      () => Promise.all([repository.obterEscola(cod), repository.listarTurmasDaEscola(cod)]),
      [repository, cod],
    ),
  );

  return (
    <Screen
      carregando={carregando}
      erro={erro}
      aoRecarregar={recarregar}
      rodape={
        <Button
          titulo="Nova turma"
          onPress={() => router.push({ pathname: '/escola/[cod]/nova-turma', params: { cod } })}
        />
      }>
      {data && (
        <>
          <Stack.Screen options={{ title: data[0].nome }} />
          <Card>
            <ThemedText type="smallBold">{data[0].nome}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Diretor(a): {data[0].diretorNome}
            </ThemedText>
          </Card>

          <ListItem
            titulo="Professores"
            subtitulo="Ver os professores da escola"
            href={{ pathname: '/escola/[cod]/professores', params: { cod } }}
          />
          <ListItem
            titulo="Alunos"
            subtitulo="Ver os alunos da escola"
            href={{ pathname: '/escola/[cod]/alunos', params: { cod } }}
          />

          <SectionTitle>Turmas</SectionTitle>
          {data[1].length === 0 && <EmptyState texto="Nenhuma turma cadastrada." />}
          {data[1].map((t) => (
            <ListItem
              key={t.cod}
              titulo={nomeTurma(t)}
              subtitulo={`Prof. ${t.professorNome}`}
              direita={<Badge texto={plural(t.totalAlunos, 'aluno')} />}
              href={{ pathname: '/turma/[cod]', params: { cod: t.cod } }}
            />
          ))}
        </>
      )}
    </Screen>
  );
}
