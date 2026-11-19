import { useCallback, useState } from 'react';

import { Chamada } from '@/components/chamada';
import { SeletorTurma } from '@/components/seletor-turma';
import { EmptyState } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { useAsync } from '@/hooks/use-async';
import { useSessaoAtiva } from '@/session/session-context';

/** Uma tela de chamada para todas as turmas: o professor escolhe a matéria no topo. */
export default function FazerChamadaScreen() {
  const { repository, papeis } = useSessaoAtiva();
  const professorCod = papeis.professorCod ?? -1;
  const carga = useAsync(
    useCallback(() => repository.listarTurmasDoProfessor(professorCod), [repository, professorCod]),
  );
  const [escolhida, setEscolhida] = useState<number | null>(null);
  const turmas = carga.data ?? [];
  // Com uma turma só, não há o que escolher.
  const turmaCod = escolhida ?? (turmas.length === 1 ? turmas[0].cod : null);

  const seletor = (
    <SeletorTurma turmas={turmas} selecionada={turmaCod} aoSelecionar={setEscolhida} />
  );

  if (turmaCod === null) {
    return (
      <Screen carregando={carga.carregando} erro={carga.erro} aoRecarregar={carga.recarregar}>
        {carga.data &&
          (turmas.length === 0 ? (
            <EmptyState texto="Nenhuma turma atribuída." />
          ) : (
            <>
              {seletor}
              <EmptyState texto="Escolha a matéria para fazer a chamada." />
            </>
          ))}
      </Screen>
    );
  }
  return <Chamada key={turmaCod} turmaCod={turmaCod} cabecalho={seletor} />;
}
