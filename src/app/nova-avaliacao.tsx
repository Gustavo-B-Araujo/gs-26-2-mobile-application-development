import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { AvaliacaoForm } from '@/components/avaliacao-form';
import { SeletorTurma } from '@/components/seletor-turma';
import { ThemedText } from '@/components/themed-text';
import { useAsync } from '@/hooks/use-async';
import { gerarChaveIdempotencia } from '@/lib/idempotencia';
import { useSessaoAtiva } from '@/session/session-context';

/** Uma tela de nova avaliação para todas as turmas: o professor escolhe a matéria no topo. */
export default function NovaAvaliacaoScreen() {
  const { repository, papeis } = useSessaoAtiva();
  const professorCod = papeis.professorCod ?? -1;
  const carga = useAsync(
    useCallback(
      () =>
        Promise.all([
          repository.listarTiposNota(),
          repository.listarTurmasDoProfessor(professorCod),
        ]),
      [repository, professorCod],
    ),
  );
  const [tipos, turmas] = carga.data ?? [null, []];
  const [escolhida, setEscolhida] = useState<number | null>(null);
  const turmaCod = escolhida ?? (turmas.length === 1 ? turmas[0].cod : null);
  /** Uma chave por turma: trocar a matéria não reaproveita a avaliação já criada em outra. */
  const chaves = useRef(new Map<number, string>());
  function chaveDa(cod: number) {
    const chave = chaves.current.get(cod) ?? gerarChaveIdempotencia();
    chaves.current.set(cod, chave);
    return chave;
  }

  return (
    <AvaliacaoForm
      tipos={tipos}
      carregando={carga.carregando}
      erroCarga={carga.erro}
      tituloBotao="Criar e lançar notas"
      podeSalvar={turmaCod !== null}
      cabecalho={
        <>
          <SeletorTurma turmas={turmas} selecionada={turmaCod} aoSelecionar={setEscolhida} />
          {carga.data && turmas.length === 0 && (
            <ThemedText type="small" themeColor="danger">
              Nenhuma turma atribuída.
            </ThemedText>
          )}
        </>
      }
      aoSalvar={async (dados) => {
        if (turmaCod === null) return;
        const avaliacaoCod = await repository.criarAvaliacao(turmaCod, dados, chaveDa(turmaCod));
        router.dismiss();
        router.push({ pathname: '/avaliacao/[cod]', params: { cod: avaliacaoCod } });
      }}
    />
  );
}
