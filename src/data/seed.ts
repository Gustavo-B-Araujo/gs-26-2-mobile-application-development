import type {
    Aluno,
    AlunoGuardiao,
    Avaliacao,
    Boletim,
    Diretor,
    Enumerador,
    Escola,
    Guardiao,
    ListaPresenca,
    Pessoa,
    Professor,
    Turma,
    TurmaAluno,
    Usuario,
} from './schema';

/**
 * Cópia da `02_dml.sql` do repositório de banco: mesmos códigos, nomes e valores.
 */

/** Senha de todos os usuários do mock. */
export const SENHA_MOCK = '123456';

const T = '2026-08-01T09:00:00.000Z';

const enumeradores = (valores: string[]): Enumerador[] =>
  valores.map((enumerador, i) => ({ cod: i + 1, enumerador, data_criacao: T }));

const comCod = <L extends object>(linhas: L[]) =>
  linhas.map((linha, i) => ({ cod: i + 1, ...linha, data_criacao: T }));

export type BancoMock = {
  statusUsuario: Enumerador[];
  tipoParentesco: Enumerador[];
  tipoCurso: Enumerador[];
  tipoNota: Enumerador[];
  tipoPresenca: Enumerador[];
  pessoa: Pessoa[];
  usuario: Usuario[];
  diretor: Diretor[];
  professor: Professor[];
  guardiao: Guardiao[];
  aluno: Aluno[];
  alunoGuardiao: AlunoGuardiao[];
  escola: Escola[];
  turma: Turma[];
  turmaAluno: TurmaAluno[];
  avaliacao: Avaliacao[];
  boletim: Boletim[];
  listaPresenca: ListaPresenca[];
};

export function criarBancoMock(): BancoMock {
  const pessoas: [string, string][] = [
    ['Seymour Skinner', '12345678900'],
    ['Edna Krabappel', '12345678901'],
    ['Homer Simpson', '12345678902'],
    ['Marge Simpson', '12345678903'],
    ['Bart Simpson', '12345678904'],
    ['Lisa Simpson', '12345678905'],
    ['Milhouse Van Houten', '12345678906'],
    ['Kirk Van Houten', '12345678907'],
    ['Elizabeth Hoover', '12345678908'],
  ];

  // status: 1 Ativo, 2 Inativo, 3 Bloqueado. Só as pessoas 1 a 5 têm usuário.
  const usuarios: [number, number][] = [
    [1, 1],
    [1, 2],
    [3, 3],
    [1, 4],
    [1, 5],
  ];

  // [cod_escola, cod_tipo_curso, cod_professor, semestre, ano]. Curso 1 Português, 2 Matemática, 3 História.
  const turmas: [number, number, number, 1 | 2, number][] = [
    [1, 1, 1, 2, 2026],
    [1, 2, 1, 2, 2026],
    [1, 3, 2, 2, 2026],
  ];

  // [cod_turma, cod_tipo_nota, nome, data]. Nota 1 Prova, 2 Trabalho, 3 Caderno.
  const avaliacoes: [number, number, string, string][] = [
    [1, 1, 'Prova 1', '2026-09-15'],
    [1, 2, 'Trabalho 1', '2026-10-10'],
    [2, 1, 'Prova 1', '2026-09-16'],
    [2, 3, 'Caderno', '2026-11-05'],
    [3, 1, 'Prova 1', '2026-09-17'],
  ];

  // [cod_turma_aluno, cod_avaliacao, nota]
  const notas: [number, number, number][] = [
    [1, 1, 45],
    [1, 2, 60],
    [2, 1, 70],
    [2, 2, 75.5],
    [3, 3, 30],
    [3, 4, 55],
    [4, 3, 68],
    [4, 4, 80],
    [5, 5, 100],
    [6, 5, 40],
  ];

  // [cod_turma_aluno, cod_tipo_presenca, observacao, data]. Presença 1 Presente, 2 Falta, 3 Falta Justificada.
  const presencas: [number, number, string | null, string][] = [
    [1, 1, null, '2026-11-03'],
    [1, 2, null, '2026-11-04'],
    [1, 3, 'Atestado médico', '2026-11-05'],
    [2, 1, null, '2026-11-03'],
    [2, 1, null, '2026-11-04'],
    [5, 1, null, '2026-11-03'],
    [6, 2, null, '2026-11-03'],
  ];

  return {
    statusUsuario: enumeradores(['Ativo', 'Inativo', 'Bloqueado']),
    tipoParentesco: enumeradores(['Pai', 'Mãe', 'Representante Legal']),
    tipoCurso: enumeradores(['Português', 'Matemática', 'História']),
    tipoNota: enumeradores(['Prova', 'Trabalho', 'Caderno']),
    tipoPresenca: enumeradores(['Presente', 'Falta', 'Falta Justificada']),
    pessoa: comCod(pessoas.map(([nome, num_documento]) => ({ nome, num_documento }))),
    usuario: comCod(
      usuarios.map(([cod_status, cod_pessoa]) => ({
        cod_status,
        cod_pessoa,
        senha_hash: '$2b$10$mock',
      })),
    ),
    diretor: comCod([{ cod_pessoa: 1 }]),
    professor: comCod([{ cod_pessoa: 2 }, { cod_pessoa: 9 }]),
    guardiao: comCod([{ cod_pessoa: 3 }, { cod_pessoa: 4 }, { cod_pessoa: 8 }]),
    aluno: comCod([{ cod_pessoa: 5 }, { cod_pessoa: 6 }, { cod_pessoa: 7 }]),
    alunoGuardiao: comCod([
      { cod_guardiao: 1, cod_aluno: 1, cod_tipo_parentesco: 1 },
      { cod_guardiao: 2, cod_aluno: 1, cod_tipo_parentesco: 2 },
      { cod_guardiao: 1, cod_aluno: 2, cod_tipo_parentesco: 1 },
      { cod_guardiao: 2, cod_aluno: 2, cod_tipo_parentesco: 2 },
      { cod_guardiao: 3, cod_aluno: 3, cod_tipo_parentesco: 1 },
    ]),
    escola: comCod([{ cod_diretor: 1, nome: 'Escola Primária de Springfield' }]),
    turma: comCod(
      turmas.map(([cod_escola, cod_tipo_curso, cod_professor, semestre, ano]) => ({
        cod_escola,
        cod_tipo_curso,
        cod_professor,
        semestre_referencia: semestre,
        ano_referencia: ano,
      })),
    ),
    turmaAluno: comCod(
      [
        [1, 1],
        [1, 3],
        [2, 1],
        [2, 3],
        [3, 2],
        [3, 1],
      ].map(([cod_turma, cod_aluno]) => ({ cod_turma, cod_aluno })),
    ),
    avaliacao: comCod(
      avaliacoes.map(([cod_turma, cod_tipo_nota, nome, data_avaliacao]) => ({
        cod_turma,
        cod_tipo_nota,
        nome,
        data_avaliacao: data_avaliacao as string | null,
      })),
    ),
    boletim: comCod(
      notas.map(([cod_turma_aluno, cod_avaliacao, nota]) => ({
        cod_turma_aluno,
        cod_avaliacao,
        nota,
      })),
    ),
    listaPresenca: comCod(
      presencas.map(([cod_turma_aluno, cod_tipo_presenca, observacao, data_presenca]) => ({
        cod_turma_aluno,
        cod_tipo_presenca,
        observacao,
        data_presenca,
      })),
    ),
  };
}
