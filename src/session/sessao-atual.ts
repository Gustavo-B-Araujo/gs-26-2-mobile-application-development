import type { Sessao } from '@/data';

let atual: Sessao | null = null;

/**
 * Sessão em uso, fora do React: o repository lê daqui sem ser recriado
 * quando a pessoa entra ou sai.
 * Quem escreve é só o `SessionProvider`.
 */
export const sessaoAtual = {
  obter: () => atual,
  definir: (sessao: Sessao | null) => {
    atual = sessao;
  },
};
