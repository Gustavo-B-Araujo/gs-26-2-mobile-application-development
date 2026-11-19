import { router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';

import { AvaliacaoForm } from '@/components/avaliacao-form';
import { useAsync } from '@/hooks/use-async';
import { useSessaoAtiva } from '@/session/session-context';

export default function EditarAvaliacaoScreen() {
  const cod = Number(useLocalSearchParams<{ cod: string }>().cod);
  const { repository } = useSessaoAtiva();
  const { data, erro, carregando } = useAsync(
    useCallback(
      () => Promise.all([repository.obterAvaliacao(cod), repository.listarTiposNota()]),
      [repository, cod],
    ),
  );
  const [avaliacao, tipos] = data ?? [null, null];

  if (!avaliacao) {
    return (
      <AvaliacaoForm
        tipos={null}
        carregando={carregando}
        erroCarga={erro}
        tituloBotao="Salvar alterações"
        aoSalvar={async () => undefined}
      />
    );
  }

  return (
    <AvaliacaoForm
      key={avaliacao.cod}
      tipos={tipos}
      carregando={false}
      erroCarga={null}
      inicial={{
        nome: avaliacao.nome,
        codTipoNota: avaliacao.codTipoNota,
        dataAvaliacao: avaliacao.dataAvaliacao,
      }}
      tituloBotao="Salvar alterações"
      aoSalvar={async (dados) => {
        await repository.atualizarAvaliacao(cod, dados);
        router.back();
      }}
    />
  );
}
