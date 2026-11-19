import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/card';
import { ChipGroup } from '@/components/ui/chip-group';
import { Screen } from '@/components/ui/screen';
import { useAsync } from '@/hooks/use-async';
import { useSessaoAtiva } from '@/session/session-context';

/**
 * Escolha do dependente no topo das telas Boletim e Frequência do guardião.
 * O parâmetro `aluno` da URL já vem escolhido (ex.: ao ir do boletim para a frequência).
 * Com um dependente só, não há o que escolher.
 */
export function useEscolhaDependente() {
  const { repository, papeis } = useSessaoAtiva();
  const { aluno } = useLocalSearchParams<{ aluno?: string }>();
  const guardiaoCod = papeis.guardiaoCod ?? -1;
  const carga = useAsync(
    useCallback(() => repository.listarDependentes(guardiaoCod), [repository, guardiaoCod]),
  );
  const [escolhido, setEscolhido] = useState<number | null>(aluno ? Number(aluno) : null);
  const dependentes = carga.data ?? [];
  const alunoCod = escolhido ?? (dependentes.length === 1 ? dependentes[0].alunoCod : null);

  const seletor = (
    <>
      <ThemedText type="smallBold" themeColor="textSecondary">
        Aluno
      </ThemedText>
      <ChipGroup
        opcoes={dependentes.map((d) => ({ valor: d.alunoCod, rotulo: d.nome.split(' ')[0] }))}
        selecionado={alunoCod}
        aoSelecionar={setEscolhido}
      />
    </>
  );

  /** Tela enquanto não há aluno escolhido: carregando, sem dependentes ou só o seletor. */
  const semAluno = (
    <Screen carregando={carga.carregando} erro={carga.erro} aoRecarregar={carga.recarregar}>
      {carga.data &&
        (dependentes.length === 0 ? (
          <EmptyState texto="Nenhum aluno vinculado. Peça à escola para vincular seus dependentes." />
        ) : (
          <>
            {seletor}
            <EmptyState texto="Escolha o aluno." />
          </>
        ))}
    </Screen>
  );

  return { alunoCod, seletor, semAluno };
}
