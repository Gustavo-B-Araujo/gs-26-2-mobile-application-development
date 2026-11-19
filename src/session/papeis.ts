import type { Sessao } from '@/data';

/** Papéis da sessão como booleanos, para `Stack.Protected` e para esconder botões. */
export function papeisDaSessao(sessao: Sessao | null) {
  const p = sessao?.papeis;
  return {
    ehDiretor: p?.diretorCod !== undefined,
    ehProfessor: p?.professorCod !== undefined,
    ehGuardiao: p?.guardiaoCod !== undefined,
    ehAluno: p?.alunoCod !== undefined,
  };
}
