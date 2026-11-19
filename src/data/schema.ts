/**
 * Tipos que espelham as tabelas de `01_ddl.sql` (Oracle).
 * Nomes de campo iguais às colunas.
 * NUMBER -> number, VARCHAR2 -> string, DATE -> 'YYYY-MM-DD', TIMESTAMP -> ISO 8601.
 */

export type Enumerador = {
  cod: number;
  enumerador: string;
  data_criacao: string;
};

export type StatusUsuario = Enumerador;
export type TipoParentesco = Enumerador;
export type TipoCurso = Enumerador;
export type TipoNota = Enumerador;
export type TipoPresenca = Enumerador;

export type Pessoa = {
  cod: number;
  nome: string;
  /** CPF, 11 dígitos sem máscara. */
  num_documento: string;
  data_criacao: string;
};

export type Usuario = {
  cod: number;
  cod_status: number;
  cod_pessoa: number;
  senha_hash: string;
  data_criacao: string;
};

export type Diretor = { cod: number; cod_pessoa: number; data_criacao: string };
export type Professor = { cod: number; cod_pessoa: number; data_criacao: string };
export type Guardiao = { cod: number; cod_pessoa: number; data_criacao: string };
export type Aluno = { cod: number; cod_pessoa: number; data_criacao: string };

export type AlunoGuardiao = {
  cod: number;
  cod_guardiao: number;
  cod_aluno: number;
  cod_tipo_parentesco: number;
  data_criacao: string;
};

export type Escola = {
  cod: number;
  cod_diretor: number;
  nome: string;
  data_criacao: string;
};

export type Turma = {
  cod: number;
  cod_escola: number;
  cod_tipo_curso: number;
  cod_professor: number;
  semestre_referencia: 1 | 2;
  ano_referencia: number;
  data_criacao: string;
};

export type TurmaAluno = {
  cod: number;
  cod_turma: number;
  cod_aluno: number;
  data_criacao: string;
};

export type Avaliacao = {
  cod: number;
  cod_turma: number;
  cod_tipo_nota: number;
  nome: string;
  data_avaliacao: string | null;
  data_criacao: string;
};

export type Boletim = {
  cod: number;
  cod_turma_aluno: number;
  cod_avaliacao: number;
  /** NUMBER(5,2), de 0 a 100. */
  nota: number;
  data_criacao: string;
};

export type ListaPresenca = {
  cod: number;
  cod_turma_aluno: number;
  cod_tipo_presenca: number;
  observacao: string | null;
  data_presenca: string;
  data_criacao: string;
};

/** Limites vindos das constraints do DDL. */
export const Limites = {
  notaMin: 0,
  notaMax: 100,
  nomeAvaliacaoMax: 50,
  /** TipoCurso.enumerador VARCHAR2(30). */
  tipoCursoMax: 30,
  observacaoPresencaMax: 150,
  anoReferenciaMin: 2000,
  dataPresencaMin: '2000-01-01',
} as const;
