import { Stack, type Href } from 'expo-router';
import { useCallback, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AnaliseIaCard } from '@/components/analise-ia-card';
import { ThemedText } from '@/components/themed-text';
import { Card, EmptyState, ListItem, SectionTitle } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import type { BoletimTurma } from '@/data';
import { useAsync } from '@/hooks/use-async';
import { corNota } from '@/lib/boletim';
import { formatarData, formatarNota, nomeTurma } from '@/lib/format';
import { useSessaoAtiva, useSession } from '@/session/session-context';

function NotasDaTurma({ item }: { item: BoletimTurma }) {
  return (
    <>
      <SectionTitle>{nomeTurma(item.turma)}</SectionTitle>
      <Card>
        <View style={styles.linha}>
          <View style={styles.flex}>
            <ThemedText type="small" themeColor="textSecondary">
              {item.turma.escolaNome}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Prof. {item.turma.professorNome}
            </ThemedText>
          </View>
          <View style={styles.media}>
            <ThemedText type="small" themeColor="textSecondary">
              Média
            </ThemedText>
            <ThemedText type="subtitle" themeColor={corNota(item.media)}>
              {formatarNota(item.media === null ? null : Math.round(item.media * 10) / 10)}
            </ThemedText>
          </View>
        </View>
      </Card>

      <Card>
        <ThemedText type="smallBold">Notas</ThemedText>
        {item.notas.length === 0 && (
          <ThemedText type="small" themeColor="textSecondary">
            Nenhuma avaliação cadastrada.
          </ThemedText>
        )}
        {item.notas.map((n) => (
          <View key={n.avaliacaoCod} style={styles.linha}>
            <View style={styles.flex}>
              <ThemedText type="small">{n.avaliacaoNome}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {n.tipoNota} · {formatarData(n.dataAvaliacao)}
              </ThemedText>
            </View>
            <ThemedText type="smallBold" themeColor={corNota(n.nota)}>
              {formatarNota(n.nota)}
            </ThemedText>
          </View>
        ))}
      </Card>
    </>
  );
}

type BoletimDoAlunoProps = {
  alunoCod: number;
  /** Link "Frequência escolar" do mesmo aluno. */
  frequencia: Href;
  /** Conteúdo acima do boletim, como o seletor de aluno. */
  cabecalho?: ReactNode;
  /** `true` põe o primeiro nome do aluno no título da tela. */
  nomeNoTitulo?: boolean;
};

/** Boletim: notas e médias por matéria. A presença fica em Frequência escolar. */
export function BoletimDoAluno({
  alunoCod: cod,
  frequencia,
  cabecalho,
  nomeNoTitulo,
}: BoletimDoAlunoProps) {
  const { repository } = useSessaoAtiva();
  const { servidor } = useSession();
  const { data, erro, carregando, recarregar } = useAsync(
    useCallback(() => repository.obterBoletimDoAluno(cod), [repository, cod]),
  );

  return (
    <Screen carregando={carregando} erro={erro} aoRecarregar={recarregar}>
      {cabecalho}
      {data && (
        <>
          {nomeNoTitulo && (
            <Stack.Screen options={{ title: `Boletim de ${data.nome.split(' ')[0]}` }} />
          )}
          <ListItem
            titulo="Frequência escolar"
            subtitulo="Presenças e faltas por matéria"
            href={frequencia}
          />
          {data.turmas.length > 0 && servidor.analiseIa && (
            <AnaliseIaCard alunoCod={cod} repository={repository} />
          )}
          {data.turmas.length === 0 && <EmptyState texto="Aluno sem matrícula em turmas." />}
          {data.turmas.map((t) => (
            <NotasDaTurma key={t.turma.cod} item={t} />
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.one,
  },
  flex: { flex: 1 },
  media: { alignItems: 'flex-end' },
});
