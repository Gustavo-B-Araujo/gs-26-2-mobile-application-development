import { SERVIDORES, type ModoDados, type ServidorId } from './backends';
import { criarHttpClient } from './http-client';
import { criarHttpRepository } from './http-repository';
import { criarMockRepository } from './mock-repository';
import type { EscolaRepository, Sessao } from './repository';

type ContextoSessao = {
  obterSessao: () => Sessao | null;
  aoExpirarSessao: () => void;
};

let mock: EscolaRepository | null = null;

/** O mock é criado uma vez, para os dados de demonstração sobreviverem ao logout. */
export function criarRepository(
  modo: ModoDados,
  servidor: ServidorId,
  contexto: ContextoSessao,
): EscolaRepository {
  if (modo === 'demo') {
    mock ??= criarMockRepository(contexto.obterSessao);
    return mock;
  }
  return criarHttpRepository(
    criarHttpClient({
      baseUrl: SERVIDORES[servidor].url ?? '',
      obterToken: () => contexto.obterSessao()?.token ?? null,
      aoExpirarSessao: contexto.aoExpirarSessao,
    }),
  );
}

export * from './backends';
export * from './repository';

