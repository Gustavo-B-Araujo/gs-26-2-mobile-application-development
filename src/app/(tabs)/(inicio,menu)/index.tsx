import { Stack } from 'expo-router';
import { useState } from 'react';

import { PainelDoAluno } from '@/components/painel-aluno';
import { ThemedText } from '@/components/themed-text';
import { Badge, Card, EmptyState, ListItem, SectionTitle } from '@/components/ui/card';
import { ChipGroup } from '@/components/ui/chip-group';
import { Screen } from '@/components/ui/screen';
import { usePainel } from '@/hooks/use-painel';
import { nomeTurma, plural } from '@/lib/format';
import { useSessaoAtiva } from '@/session/session-context';

/**
 * O dia a dia de cada papel: resumo do desempenho (aluno e dependentes), turmas e escolas.
 * O Menu lista as funcionalidades; a conta fica em Configurações.
 */
export default function HomeScreen() {
  const { papeis, pessoa } = useSessaoAtiva();
  const { data, erro, carregando, recarregar } = usePainel({ comBoletins: true });
  const meuBoletim = data?.meuBoletim ?? null;
  const dependentes = data?.dependentes ?? [];
  const [escolhido, setEscolhido] = useState<number | null>(null);
  /** O guardião abre no primeiro dependente; os chips trocam de aluno. */
  const dependenteCod = escolhido ?? dependentes[0]?.alunoCod ?? null;
  const dependente = dependentes.find((d) => d.alunoCod === dependenteCod) ?? null;
  const boletimDependente =
    dependenteCod === null ? null : (data?.boletinsDependentes.get(dependenteCod) ?? null);

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

            {data.dependentes && (
              <>
                {dependentes.length === 0 && (
                  <>
                    <SectionTitle>Meus dependentes</SectionTitle>
                    <EmptyState texto="Nenhum aluno vinculado. Peça à escola para vincular seus dependentes." />
                  </>
                )}
                {dependentes.length > 1 && (
                  <ChipGroup
                    opcoes={dependentes.map((d) => ({
                      valor: d.alunoCod,
                      rotulo: d.nome.split(' ')[0],
                    }))}
                    selecionado={dependenteCod}
                    aoSelecionar={setEscolhido}
                  />
                )}
                {boletimDependente && dependente && (
                  <PainelDoAluno
                    boletim={boletimDependente}
                    detalhe={`${dependente.parentesco} · ${plural(boletimDependente.turmas.length, 'matéria')}`}
                  />
                )}
              </>
            )}

            {data.turmasProfessor && (
              <>
                <SectionTitle>Minhas turmas</SectionTitle>
                {data.turmasProfessor.length === 0 && (
                  <EmptyState texto="Nenhuma turma atribuída." />
                )}
                {data.turmasProfessor.map((t) => (
                  <ListItem
                    key={t.cod}
                    titulo={nomeTurma(t)}
                    subtitulo={t.escolaNome}
                    direita={<Badge texto={plural(t.totalAlunos, 'aluno')} />}
                    href={{ pathname: '/turma/[cod]', params: { cod: t.cod } }}
                  />
                ))}
              </>
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
