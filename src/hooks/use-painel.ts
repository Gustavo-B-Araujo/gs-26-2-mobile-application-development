import { useCallback } from 'react';

import type { BoletimAluno, EscolaRepository, Papeis } from '@/data';
import { useAsync } from '@/hooks/use-async';
import { useSessaoAtiva } from '@/session/session-context';

async function carregarPainel(repository: EscolaRepository, p: Papeis, comBoletins: boolean) {
  const [escolas, turmasProfessor, dependentes, meuBoletim] = await Promise.all([
    p.diretorCod !== undefined ? repository.listarEscolasDoDiretor(p.diretorCod) : null,
    p.professorCod !== undefined ? repository.listarTurmasDoProfessor(p.professorCod) : null,
    p.guardiaoCod !== undefined ? repository.listarDependentes(p.guardiaoCod) : null,
    comBoletins && p.alunoCod !== undefined ? repository.obterBoletimDoAluno(p.alunoCod) : null,
  ]);
  const boletinsDependentes = new Map<number, BoletimAluno>();
  if (comBoletins && dependentes) {
    const boletins = await Promise.all(
      dependentes.map((d) => repository.obterBoletimDoAluno(d.alunoCod)),
    );
    for (const b of boletins) boletinsDependentes.set(b.alunoCod, b);
  }
  return { escolas, turmasProfessor, dependentes, meuBoletim, boletinsDependentes };
}

/**
 * O que cada papel da pessoa enxerga: escolas (diretor), turmas (professor) e
 * dependentes (guardião). `null` quando a pessoa não tem o papel.
 * Com `comBoletins`, traz também o boletim do aluno e o de cada dependente (para o resumo do Início).
 */
export function usePainel({ comBoletins = false } = {}) {
  const { repository, papeis } = useSessaoAtiva();
  return useAsync(
    useCallback(
      () => carregarPainel(repository, papeis, comBoletins),
      [repository, papeis, comBoletins],
    ),
  );
}
