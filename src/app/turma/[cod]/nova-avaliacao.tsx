import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';

import { AvaliacaoForm } from '@/components/avaliacao-form';
import { useAsync } from '@/hooks/use-async';
import { gerarChaveIdempotencia } from '@/lib/idempotencia';
import { useSessaoAtiva } from '@/session/session-context';

export default function NovaAvaliacaoScreen() {
  const cod = Number(useLocalSearchParams<{ cod: string }>().cod);
  const { repository } = useSessaoAtiva();
  const tipos = useAsync(useCallback(() => repository.listarTiposNota(), [repository]));
  /** Uma chave por formulário: tocar "Criar" de novo não duplica a avaliação. */
  const [chaveIdempotencia] = useState(gerarChaveIdempotencia);

  return (
    <AvaliacaoForm
      tipos={tipos.data}
      carregando={tipos.carregando}
      erroCarga={tipos.erro}
      tituloBotao="Criar e lançar notas"
      aoSalvar={async (dados) => {
        const avaliacaoCod = await repository.criarAvaliacao(cod, dados, chaveIdempotencia);
        router.dismiss();
        router.push({ pathname: '/avaliacao/[cod]', params: { cod: avaliacaoCod } });
      }}
    />
  );
}
