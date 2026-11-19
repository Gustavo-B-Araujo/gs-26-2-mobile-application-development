import { Stack, type Href } from 'expo-router';
import { useCallback, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge, Card, EmptyState, ListItem, SectionTitle } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import type { BoletimTurma, PresencaDoAluno } from '@/data';
import { useAsync } from '@/hooks/use-async';
import { contarPresencas, corFrequencia, corPresenca, resumirBoletim } from '@/lib/boletim';
import { formatarData, formatarPercentual, nomeTurma, plural } from '@/lib/format';
import { useSessaoAtiva } from '@/session/session-context';

/** Frequência em destaque e a contagem de presenças, faltas e justificadas. */
function Contagem({
  frequencia,
  presencas,
}: {
  frequencia: number | null;
  presencas: PresencaDoAluno[];
}) {
  const c = contarPresencas(presencas);
  return (
    <View style={styles.contagem}>
      <View style={styles.flex}>
        <ThemedText type="small" themeColor="textSecondary">
          Frequência
        </ThemedText>
        <ThemedText type="subtitle" themeColor={corFrequencia(frequencia)}>
          {formatarPercentual(frequencia)}
        </ThemedText>
      </View>
      <View style={styles.numeros}>
        <ThemedText type="small" themeColor="success">
          {plural(c.presentes, 'presença', 'presenças')}
        </ThemedText>
        <ThemedText type="small" themeColor="danger">
          {plural(c.faltas, 'falta')}
        </ThemedText>
        <ThemedText type="small" themeColor="warning">
          {plural(c.justificadas, 'justificada')}
        </ThemedText>
      </View>
    </View>
  );
}

function FrequenciaDaTurma({ item }: { item: BoletimTurma }) {
  return (
    <>
      <SectionTitle>{nomeTurma(item.turma)}</SectionTitle>
      <Card>
        <ThemedText type="small" themeColor="textSecondary">
          {item.turma.escolaNome} · Prof. {item.turma.professorNome}
        </ThemedText>
        <Contagem frequencia={item.frequencia} presencas={item.presencas} />
      </Card>
      <Card>
        <ThemedText type="smallBold">Chamadas</ThemedText>
        {item.presencas.length === 0 && (
          <ThemedText type="small" themeColor="textSecondary">
            Nenhuma chamada registrada.
          </ThemedText>
        )}
        {item.presencas.map((p) => (
          <View key={p.data} style={styles.linha}>
            <View style={styles.flex}>
              <ThemedText type="small">{formatarData(p.data)}</ThemedText>
              {p.observacao && (
                <ThemedText type="small" themeColor="textSecondary">
                  {p.observacao}
                </ThemedText>
              )}
            </View>
            <Badge texto={p.tipo} cor={corPresenca(p.tipo)} />
          </View>
        ))}
      </Card>
    </>
  );
}

type FrequenciaDoAlunoProps = {
  alunoCod: number;
  /** Link "Boletim" do mesmo aluno. */
  boletim: Href;
  /** Conteúdo acima da frequência, como o seletor de aluno. */
  cabecalho?: ReactNode;
  /** `true` põe o primeiro nome do aluno no título da tela. */
  nomeNoTitulo?: boolean;
};

/** Frequência escolar: todas as chamadas do aluno, por matéria. Só 'Presente' conta como presença. */
export function FrequenciaDoAluno({
  alunoCod: cod,
  boletim,
  cabecalho,
  nomeNoTitulo,
}: FrequenciaDoAlunoProps) {
  const { repository } = useSessaoAtiva();
  const { data, erro, carregando, recarregar } = useAsync(
    useCallback(() => repository.obterBoletimDoAluno(cod), [repository, cod]),
  );

  return (
    <Screen carregando={carregando} erro={erro} aoRecarregar={recarregar}>
      {cabecalho}
      {data && (
        <>
          {nomeNoTitulo && (
            <Stack.Screen options={{ title: `Frequência de ${data.nome.split(' ')[0]}` }} />
          )}
          <ListItem titulo="Boletim" subtitulo="Notas e médias por matéria" href={boletim} />
          {data.turmas.length === 0 && <EmptyState texto="Aluno sem matrícula em turmas." />}
          {data.turmas.length > 0 && (
            <>
              <SectionTitle>Geral</SectionTitle>
              <Card>
                <Contagem
                  frequencia={resumirBoletim(data).frequencia}
                  presencas={data.turmas.flatMap((t) => t.presencas)}
                />
                <ThemedText type="small" themeColor="textSecondary">
                  Só a presença conta para a frequência. Falta justificada também reduz o
                  percentual.
                </ThemedText>
              </Card>
            </>
          )}
          {data.turmas.map((t) => (
            <FrequenciaDaTurma key={t.turma.cod} item={t} />
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  contagem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  numeros: { alignItems: 'flex-end', gap: Spacing.half },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.one,
  },
  flex: { flex: 1 },
});
