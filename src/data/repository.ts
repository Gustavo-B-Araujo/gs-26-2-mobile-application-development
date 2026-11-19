import type { Enumerador, Pessoa } from './schema';

/** Papéis que uma Pessoa pode ter. Cada um guarda o `cod` da tabela do papel. */
export type Papeis = {
  diretorCod?: number;
  professorCod?: number;
  guardiaoCod?: number;
  alunoCod?: number;
};

export type Sessao = {
  token: string;
  usuarioCod: number;
  pessoa: Pessoa;
  papeis: Papeis;
};

export type NovoCadastro = {
  nome: string;
  /** CPF, 11 dígitos sem máscara. */
  numDocumento: string;
  senha: string;
};

/**
 * Cadastro feito por qualquer diretor. O professor é da rede, não de uma escola:
 * ganha turma (e, com ela, escola) em "Nova turma".
 */
export type NovoProfessor = NovoCadastro;

export type ProfessorResumo = {
  professorCod: number;
  nome: string;
  /** Matérias (`TipoCurso.enumerador`) das turmas do professor em toda a rede, sem repetir. */
  materias: string[];
};

/** Aluno da rede, para o diretor escolher na matrícula. */
export type AlunoResumo = {
  alunoCod: number;
  nome: string;
  /** CPF, 11 dígitos sem máscara. Separa homônimos na lista. */
  numDocumento: string;
  /** Quantas matrículas (`TurmaAluno`) o aluno tem em toda a rede. 0 = sem turma. */
  totalTurmas: number;
};

/**
 * Cadastro de aluno pelo diretor. Sem `senha`, o aluno não ganha `Usuario`:
 * o guardião acompanha o boletim por ele (como Lisa e Milhouse na DML).
 */
export type NovoAluno = {
  nome: string;
  numDocumento: string;
  senha: string | null;
};

export type ProfessorDaEscola = ProfessorResumo & {
  turmas: TurmaResumo[];
};

/** Aluno matriculado em ao menos uma turma da escola, com essas turmas. */
export type AlunoDaEscola = AlunoResumo & {
  turmas: TurmaResumo[];
};

/** Dados da nova turma. `Turma.cod_professor` é NOT NULL: a turma nasce com professor. */
export type NovaTurma = {
  codTipoCurso: number;
  codProfessor: number;
  semestre: 1 | 2;
  ano: number;
};

export type EscolaResumo = {
  cod: number;
  nome: string;
  diretorNome: string;
  totalTurmas: number;
};

export type TurmaResumo = {
  cod: number;
  escolaCod: number;
  escolaNome: string;
  tipoCurso: string;
  professorCod: number;
  professorNome: string;
  semestre: 1 | 2;
  ano: number;
  totalAlunos: number;
};

export type AlunoDaTurma = {
  turmaAlunoCod: number;
  alunoCod: number;
  nome: string;
};

export type AvaliacaoResumo = {
  cod: number;
  nome: string;
  codTipoNota: number;
  tipoNota: string;
  dataAvaliacao: string | null;
  notasLancadas: number;
};

export type TurmaDetalhe = TurmaResumo & {
  alunos: AlunoDaTurma[];
  avaliacoes: AvaliacaoResumo[];
};

export type Dependente = {
  alunoCod: number;
  nome: string;
  parentesco: string;
};

export type NotaDoAluno = {
  avaliacaoCod: number;
  avaliacaoNome: string;
  tipoNota: string;
  dataAvaliacao: string | null;
  nota: number | null;
};

export type PresencaDoAluno = {
  data: string;
  tipo: string;
  observacao: string | null;
};

export type BoletimTurma = {
  turma: TurmaResumo;
  notas: NotaDoAluno[];
  media: number | null;
  presencas: PresencaDoAluno[];
  /** Fração de 0 a 1, ou null sem registros. */
  frequencia: number | null;
};

export type BoletimAluno = {
  alunoCod: number;
  nome: string;
  turmas: BoletimTurma[];
};

/** Texto gerado por IA a partir do boletim do aluno. */
export type AnaliseBoletim = {
  texto: string;
  geradoEm: string;
};

export type NotaLancada = {
  turmaAlunoCod: number;
  alunoNome: string;
  nota: number | null;
};

export type AvaliacaoDetalhe = AvaliacaoResumo & {
  turma: TurmaResumo;
  notas: NotaLancada[];
};

export type ItemChamada = {
  turmaAlunoCod: number;
  alunoNome: string;
  codTipoPresenca: number | null;
  observacao: string | null;
};

/** Dados para criar e editar avaliação. */
export type DadosAvaliacao = {
  nome: string;
  codTipoNota: number;
  dataAvaliacao: string | null;
};

/** Contrato do app com os dados. A tela só conhece esta interface. */
export interface EscolaRepository {
  login(numDocumento: string, senha: string): Promise<Sessao>;
  cadastrar(dados: NovoCadastro): Promise<Sessao>;
  logout(): Promise<void>;
  /** Troca a senha de quem está logado. */
  alterarSenha(senhaAtual: string, novaSenha: string): Promise<void>;
  /** Troca o próprio nome. Só diretor e guardião. Devolve a `Pessoa` atualizada. */
  alterarMeuNome(nome: string): Promise<Pessoa>;

  listarTiposPresenca(): Promise<Enumerador[]>;
  listarTiposNota(): Promise<Enumerador[]>;
  listarTiposCurso(): Promise<Enumerador[]>;
  /** Insere um curso (matéria) em TipoCurso. Só diretor. Nome repetido dá erro. */
  inserirTipoCurso(enumerador: string): Promise<Enumerador>;

  listarEscolasDoDiretor(diretorCod: number): Promise<EscolaResumo[]>;
  obterEscola(escolaCod: number): Promise<EscolaResumo>;
  listarTurmasDaEscola(escolaCod: number): Promise<TurmaResumo[]>;
  criarTurma(escolaCod: number, dados: NovaTurma, chaveIdempotencia: string): Promise<number>;
  /** Todos os professores da rede: o DDL não prende professor a uma escola. */
  listarProfessores(): Promise<ProfessorResumo[]>;
  listarProfessoresDaEscola(escolaCod: number): Promise<ProfessorDaEscola[]>;
  /** Só diretor (de qualquer escola). CPF repetido dá erro. */
  cadastrarProfessor(dados: NovoProfessor, chaveIdempotencia: string): Promise<number>;
  /** Troca o nome (`Pessoa.nome`) do professor. Só diretor (de qualquer escola). */
  renomearProfessor(professorCod: number, nome: string): Promise<void>;
  listarTurmasDoProfessor(professorCod: number): Promise<TurmaResumo[]>;
  /** Todos os alunos da rede. Só diretor. */
  listarAlunos(): Promise<AlunoResumo[]>;
  /** Alunos com matrícula em turma da escola. Só o diretor da escola. */
  listarAlunosDaEscola(escolaCod: number): Promise<AlunoDaEscola[]>;
  /** Só diretor (de qualquer escola). CPF repetido dá erro. */
  cadastrarAluno(dados: NovoAluno, chaveIdempotencia: string): Promise<number>;
  /** Troca o nome (`Pessoa.nome`) do aluno. Só diretor (de qualquer escola). */
  renomearAluno(alunoCod: number, nome: string): Promise<void>;
  /**
   * Insere em TurmaAluno. Só o diretor da escola da turma.
   * Aluno já matriculado é ignorado (uq_turma_aluno), então repetir a chamada é seguro.
   */
  matricularAlunos(turmaCod: number, alunoCods: number[]): Promise<void>;
  listarDependentes(guardiaoCod: number): Promise<Dependente[]>;

  obterTurma(turmaCod: number): Promise<TurmaDetalhe>;
  obterBoletimDoAluno(alunoCod: number): Promise<BoletimAluno>;
  analisarBoletim(alunoCod: number): Promise<AnaliseBoletim>;

  obterAvaliacao(avaliacaoCod: number): Promise<AvaliacaoDetalhe>;
  criarAvaliacao(
    turmaCod: number,
    dados: DadosAvaliacao,
    chaveIdempotencia: string,
  ): Promise<number>;
  atualizarAvaliacao(avaliacaoCod: number, dados: DadosAvaliacao): Promise<void>;
  excluirAvaliacao(avaliacaoCod: number): Promise<void>;
  salvarNotas(
    avaliacaoCod: number,
    notas: { turmaAlunoCod: number; nota: number | null }[],
  ): Promise<void>;

  obterChamada(turmaCod: number, data: string): Promise<ItemChamada[]>;
  salvarChamada(
    turmaCod: number,
    data: string,
    itens: { turmaAlunoCod: number; codTipoPresenca: number; observacao: string | null }[],
  ): Promise<void>;
}

/** Erro com mensagem para mostrar na tela. */
export class RepositoryError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}
