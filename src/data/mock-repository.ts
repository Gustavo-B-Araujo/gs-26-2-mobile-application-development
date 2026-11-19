import { chaveEnum, materiasDasTurmas, nomeTurma } from '@/lib/format';
import { validarNome, validarSenha } from '@/lib/validacao';

import {
    RepositoryError,
    type AlunoDaEscola,
    type AlunoResumo,
    type AnaliseBoletim,
    type AvaliacaoDetalhe,
    type AvaliacaoResumo,
    type BoletimAluno,
    type DadosAvaliacao,
    type Dependente,
    type EscolaRepository,
    type EscolaResumo,
    type ItemChamada,
    type NovoCadastro,
    type Papeis,
    type ProfessorDaEscola,
    type ProfessorResumo,
    type Sessao,
    type TurmaDetalhe,
    type TurmaResumo,
} from './repository';
import { Limites, type Enumerador, type Pessoa, type Turma } from './schema';
import { criarBancoMock, SENHA_MOCK } from './seed';

const LATENCIA_MS = 250;
const esperar = () => new Promise((r) => setTimeout(r, LATENCIA_MS));
const agora = () => new Date().toISOString();
const proximoCod = (linhas: { cod: number }[]) =>
  linhas.reduce((m, l) => Math.max(m, l.cod), 0) + 1;

/**
 * Implementação em memória, com as mesmas regras do DDL (UNIQUE, CHECK, FK)
 * e as regras de acesso por papel. Os dados voltam ao seed quando o app reinicia.
 */
export function criarMockRepository(obterSessao: () => Sessao | null): EscolaRepository {
  const db = criarBancoMock();
  /** Senha de quem se cadastrou no app. Os usuários do seed usam `SENHA_MOCK`. */
  const senhas = new Map<number, string>();
  /** Chave de idempotência -> cod da avaliação criada. */
  const criacoes = new Map<string, number>();

  const enumPorCod = (lista: Enumerador[], cod: number) =>
    lista.find((e) => e.cod === cod)?.enumerador ?? '?';
  const nomePessoa = (cod: number) => db.pessoa.find((p) => p.cod === cod)?.nome ?? '?';
  const nomeAluno = (alunoCod: number) =>
    nomePessoa(db.aluno.find((a) => a.cod === alunoCod)?.cod_pessoa ?? -1);

  function exigirSessao(): Sessao {
    const sessao = obterSessao();
    if (!sessao) throw new RepositoryError('Sessão expirada. Entre de novo.', 401);
    return sessao;
  }

  function criarSessao(pessoa: Pessoa, usuarioCod: number): Sessao {
    return {
      token: `mock-${usuarioCod}-${Date.now()}`,
      usuarioCod,
      pessoa,
      papeis: {
        diretorCod: db.diretor.find((d) => d.cod_pessoa === pessoa.cod)?.cod,
        professorCod: db.professor.find((d) => d.cod_pessoa === pessoa.cod)?.cod,
        guardiaoCod: db.guardiao.find((d) => d.cod_pessoa === pessoa.cod)?.cod,
        alunoCod: db.aluno.find((d) => d.cod_pessoa === pessoa.cod)?.cod,
      },
    };
  }

  function criarPessoa(nome: string, numDocumento: string): Pessoa {
    const pessoa: Pessoa = {
      cod: proximoCod(db.pessoa),
      nome: nome.trim(),
      num_documento: numDocumento,
      data_criacao: agora(),
    };
    db.pessoa.push(pessoa);
    return pessoa;
  }

  function criarPessoaComUsuario(dados: NovoCadastro) {
    const pessoa = criarPessoa(dados.nome, dados.numDocumento);
    const usuarioCod = proximoCod(db.usuario);
    db.usuario.push({
      cod: usuarioCod,
      cod_status: 1,
      cod_pessoa: pessoa.cod,
      senha_hash: '$2b$10$mock',
      data_criacao: agora(),
    });
    senhas.set(usuarioCod, dados.senha);
    return { pessoa, usuarioCod };
  }

  /** `Pessoa.nome` é o nome em todos os papéis: trocar aqui troca em todas as telas. */
  function renomearPessoa(pessoaCod: number, nome: string): Pessoa {
    const regra = validarNome(nome);
    if (regra) throw new RepositoryError(regra, 400);
    const pessoa = db.pessoa.find((p) => p.cod === pessoaCod);
    if (!pessoa) throw new RepositoryError('Pessoa não encontrada.', 404);
    pessoa.nome = nome.trim();
    return { ...pessoa };
  }

  function exigirDiretor(mensagem: string) {
    if (exigirSessao().papeis.diretorCod === undefined) {
      throw new RepositoryError(mensagem, 403);
    }
  }

  /** O que o professor ensina = as matérias (TipoCurso) das turmas dele, em toda a rede. */
  function materiasDoProfessor(professorCod: number) {
    return materiasDasTurmas(
      db.turma.filter((t) => t.cod_professor === professorCod).map(resumoTurma),
    );
  }

  function exigirDiretorDaEscola(escolaCod: number) {
    if (!ehDiretorDaEscola(exigirSessao().papeis, escolaCod)) {
      throw new RepositoryError('Acesso negado.', 403);
    }
  }

  function buscarTurma(turmaCod: number): Turma {
    const turma = db.turma.find((t) => t.cod === turmaCod);
    if (!turma) throw new RepositoryError('Turma não encontrada.', 404);
    return turma;
  }

  function buscarAvaliacao(avaliacaoCod: number) {
    const avaliacao = db.avaliacao.find((a) => a.cod === avaliacaoCod);
    if (!avaliacao) throw new RepositoryError('Avaliação não encontrada.', 404);
    return avaliacao;
  }

  function resumoTurma(t: Turma): TurmaResumo {
    const escola = db.escola.find((e) => e.cod === t.cod_escola);
    const professor = db.professor.find((p) => p.cod === t.cod_professor);
    return {
      cod: t.cod,
      escolaCod: t.cod_escola,
      escolaNome: escola?.nome ?? '?',
      tipoCurso: enumPorCod(db.tipoCurso, t.cod_tipo_curso),
      professorCod: t.cod_professor,
      professorNome: nomePessoa(professor?.cod_pessoa ?? -1),
      semestre: t.semestre_referencia,
      ano: t.ano_referencia,
      totalAlunos: db.turmaAluno.filter((ta) => ta.cod_turma === t.cod).length,
    };
  }

  const ordenarTurmas = (a: TurmaResumo, b: TurmaResumo) =>
    b.ano - a.ano || b.semestre - a.semestre || a.cod - b.cod;

  // --- Regras de acesso -------------------------------------------------

  function ehDiretorDaEscola(p: Papeis, escolaCod: number) {
    return db.escola.some((e) => e.cod === escolaCod && e.cod_diretor === p.diretorCod);
  }

  function podeVerTurma(p: Papeis, t: Turma) {
    if (t.cod_professor === p.professorCod) return true;
    if (ehDiretorDaEscola(p, t.cod_escola)) return true;
    const alunos = db.turmaAluno.filter((ta) => ta.cod_turma === t.cod).map((ta) => ta.cod_aluno);
    if (p.alunoCod !== undefined && alunos.includes(p.alunoCod)) return true;
    return db.alunoGuardiao.some(
      (ag) => ag.cod_guardiao === p.guardiaoCod && alunos.includes(ag.cod_aluno),
    );
  }

  function podeVerAluno(p: Papeis, alunoCod: number) {
    if (p.alunoCod === alunoCod) return true;
    if (
      db.alunoGuardiao.some((ag) => ag.cod_guardiao === p.guardiaoCod && ag.cod_aluno === alunoCod)
    ) {
      return true;
    }
    return db.turmaAluno
      .filter((ta) => ta.cod_aluno === alunoCod)
      .some((ta) => {
        const t = buscarTurma(ta.cod_turma);
        return t.cod_professor === p.professorCod || ehDiretorDaEscola(p, t.cod_escola);
      });
  }

  function exigirLeituraTurma(turmaCod: number): Turma {
    const turma = buscarTurma(turmaCod);
    if (!podeVerTurma(exigirSessao().papeis, turma)) {
      throw new RepositoryError('Você não tem acesso a esta turma.', 403);
    }
    return turma;
  }

  function exigirProfessorDaTurma(turmaCod: number): Turma {
    const turma = buscarTurma(turmaCod);
    if (turma.cod_professor !== exigirSessao().papeis.professorCod) {
      throw new RepositoryError('Só o professor da turma pode lançar dados.', 403);
    }
    return turma;
  }

  function validarAvaliacao(turmaCod: number, dados: DadosAvaliacao, ignorarCod?: number) {
    const nome = dados.nome.trim();
    if (!nome || nome.length > Limites.nomeAvaliacaoMax) {
      throw new RepositoryError(
        `O nome precisa ter de 1 a ${Limites.nomeAvaliacaoMax} caracteres.`,
        400,
      );
    }
    if (!db.tipoNota.some((t) => t.cod === dados.codTipoNota)) {
      throw new RepositoryError('Tipo de nota inválido.', 400);
    }
    // uq_avaliacao (cod_turma, nome)
    const repetida = db.avaliacao.some(
      (a) => a.cod_turma === turmaCod && a.nome === nome && a.cod !== ignorarCod,
    );
    if (repetida) {
      throw new RepositoryError('Já existe uma avaliação com este nome nesta turma.', 409);
    }
    return nome;
  }

  // --- Montagem de view models ------------------------------------------

  function resumoAvaliacao(avaliacaoCod: number): AvaliacaoResumo {
    const a = buscarAvaliacao(avaliacaoCod);
    return {
      cod: a.cod,
      nome: a.nome,
      codTipoNota: a.cod_tipo_nota,
      tipoNota: enumPorCod(db.tipoNota, a.cod_tipo_nota),
      dataAvaliacao: a.data_avaliacao,
      notasLancadas: db.boletim.filter((b) => b.cod_avaliacao === a.cod).length,
    };
  }

  function alunosDaTurma(turmaCod: number) {
    return db.turmaAluno
      .filter((ta) => ta.cod_turma === turmaCod)
      .map((ta) => ({
        turmaAlunoCod: ta.cod,
        alunoCod: ta.cod_aluno,
        nome: nomeAluno(ta.cod_aluno),
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }

  function avaliacoesDaTurma(turmaCod: number) {
    return db.avaliacao
      .filter((a) => a.cod_turma === turmaCod)
      .sort((a, b) => (a.data_avaliacao ?? '9999').localeCompare(b.data_avaliacao ?? '9999'));
  }

  function resumoEscola(escolaCod: number): EscolaResumo {
    const e = db.escola.find((x) => x.cod === escolaCod);
    if (!e) throw new RepositoryError('Escola não encontrada.', 404);
    const diretor = db.diretor.find((d) => d.cod === e.cod_diretor);
    return {
      cod: e.cod,
      nome: e.nome,
      diretorNome: nomePessoa(diretor?.cod_pessoa ?? -1),
      totalTurmas: db.turma.filter((t) => t.cod_escola === e.cod).length,
    };
  }

  function montarBoletim(alunoCod: number): BoletimAluno {
    const turmas = db.turmaAluno
      .filter((ta) => ta.cod_aluno === alunoCod)
      .map((ta) => {
        const notas = avaliacoesDaTurma(ta.cod_turma).map((a) => ({
          avaliacaoCod: a.cod,
          avaliacaoNome: a.nome,
          tipoNota: enumPorCod(db.tipoNota, a.cod_tipo_nota),
          dataAvaliacao: a.data_avaliacao,
          nota:
            db.boletim.find((b) => b.cod_turma_aluno === ta.cod && b.cod_avaliacao === a.cod)
              ?.nota ?? null,
        }));
        const lancadas = notas.filter((n) => n.nota !== null).map((n) => n.nota as number);
        const presencas = db.listaPresenca
          .filter((lp) => lp.cod_turma_aluno === ta.cod)
          .sort((a, b) => b.data_presenca.localeCompare(a.data_presenca))
          .map((lp) => ({
            data: lp.data_presenca,
            tipo: enumPorCod(db.tipoPresenca, lp.cod_tipo_presenca),
            observacao: lp.observacao,
          }));
        // Frequência: só 'Presente' conta como presença.
        const presentes = presencas.filter((p) => chaveEnum(p.tipo) === 'PRESENTE').length;
        return {
          turma: resumoTurma(buscarTurma(ta.cod_turma)),
          notas,
          media: lancadas.length ? lancadas.reduce((s, n) => s + n, 0) / lancadas.length : null,
          presencas,
          frequencia: presencas.length ? presentes / presencas.length : null,
        };
      })
      .sort((a, b) => ordenarTurmas(a.turma, b.turma));
    return { alunoCod, nome: nomeAluno(alunoCod), turmas };
  }

  // --- Implementação ------------------------------------------------------

  return {
    async login(numDocumento, senha) {
      await esperar();
      const pessoa = db.pessoa.find((p) => p.num_documento === numDocumento);
      const usuario = pessoa && db.usuario.find((u) => u.cod_pessoa === pessoa.cod);
      const senhaCerta = usuario && (senhas.get(usuario.cod) ?? SENHA_MOCK);
      if (!pessoa || !usuario || senha !== senhaCerta) {
        throw new RepositoryError('CPF ou senha inválidos.', 401);
      }
      const status = enumPorCod(db.statusUsuario, usuario.cod_status);
      if (chaveEnum(status) !== 'ATIVO') {
        throw new RepositoryError(`Usuário ${status.toLowerCase()}. Procure a secretaria.`, 403);
      }
      return criarSessao(pessoa, usuario.cod);
    },

    /** Cadastro cria Pessoa + Usuario ATIVO + Guardiao. A escola vincula os dependentes depois. */
    async cadastrar(dados) {
      await esperar();
      if (db.pessoa.some((p) => p.num_documento === dados.numDocumento)) {
        throw new RepositoryError('Este CPF já tem cadastro. Entre com sua senha.', 409);
      }
      const { pessoa, usuarioCod } = criarPessoaComUsuario(dados);
      db.guardiao.push({
        cod: proximoCod(db.guardiao),
        cod_pessoa: pessoa.cod,
        data_criacao: agora(),
      });
      return criarSessao(pessoa, usuarioCod);
    },

    async logout() {},

    async alterarSenha(senhaAtual, novaSenha) {
      await esperar();
      const { usuarioCod } = exigirSessao();
      if (senhaAtual !== (senhas.get(usuarioCod) ?? SENHA_MOCK)) {
        throw new RepositoryError('A senha atual não confere.', 400);
      }
      const regra = validarSenha(novaSenha);
      if (regra) throw new RepositoryError(regra, 400);
      if (novaSenha === senhaAtual) {
        throw new RepositoryError('A nova senha precisa ser diferente da atual.', 400);
      }
      senhas.set(usuarioCod, novaSenha);
    },

    async alterarMeuNome(nome) {
      await esperar();
      const { pessoa, papeis } = exigirSessao();
      if (papeis.diretorCod === undefined && papeis.guardiaoCod === undefined) {
        throw new RepositoryError('Só diretor e responsável alteram o próprio nome.', 403);
      }
      return renomearPessoa(pessoa.cod, nome);
    },

    async listarTiposPresenca() {
      return db.tipoPresenca;
    },

    async listarTiposNota() {
      return db.tipoNota;
    },

    async listarTiposCurso() {
      return db.tipoCurso;
    },

    async inserirTipoCurso(enumerador) {
      await esperar();
      if (exigirSessao().papeis.diretorCod === undefined) {
        throw new RepositoryError('Só o diretor insere cursos.', 403);
      }
      const nome = enumerador.trim();
      if (!nome || nome.length > Limites.tipoCursoMax) {
        throw new RepositoryError(
          `O nome precisa ter de 1 a ${Limites.tipoCursoMax} caracteres.`,
          400,
        );
      }
      // UNIQUE (enumerador). Compara sem acento e maiúscula para não ter "Historia" e "História".
      if (db.tipoCurso.some((t) => chaveEnum(t.enumerador) === chaveEnum(nome))) {
        throw new RepositoryError('Este curso já existe.', 409);
      }
      const curso = { cod: proximoCod(db.tipoCurso), enumerador: nome, data_criacao: agora() };
      db.tipoCurso.push(curso);
      return curso;
    },

    async listarProfessores(): Promise<ProfessorResumo[]> {
      await esperar();
      if (exigirSessao().papeis.diretorCod === undefined) {
        throw new RepositoryError('Acesso negado.', 403);
      }
      return db.professor
        .map((p) => ({
          professorCod: p.cod,
          nome: nomePessoa(p.cod_pessoa),
          materias: materiasDoProfessor(p.cod),
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome));
    },

    async criarTurma(escolaCod, dados, chaveIdempotencia) {
      await esperar();
      const repetida = criacoes.get(chaveIdempotencia);
      if (repetida !== undefined) return repetida;
      exigirDiretorDaEscola(escolaCod);
      if (!db.tipoCurso.some((t) => t.cod === dados.codTipoCurso)) {
        throw new RepositoryError('Tipo de curso inválido.', 400);
      }
      if (!db.professor.some((p) => p.cod === dados.codProfessor)) {
        throw new RepositoryError('Professor não encontrado.', 404);
      }
      // CHECK (semestre_referencia IN (1, 2)) e CHECK (ano_referencia >= 2000)
      if (dados.semestre !== 1 && dados.semestre !== 2) {
        throw new RepositoryError('Semestre inválido.', 400);
      }
      if (!Number.isInteger(dados.ano) || dados.ano < Limites.anoReferenciaMin) {
        throw new RepositoryError(`O ano precisa ser ${Limites.anoReferenciaMin} ou depois.`, 400);
      }
      const cod = proximoCod(db.turma);
      db.turma.push({
        cod,
        cod_escola: escolaCod,
        cod_tipo_curso: dados.codTipoCurso,
        cod_professor: dados.codProfessor,
        semestre_referencia: dados.semestre,
        ano_referencia: dados.ano,
        data_criacao: agora(),
      });
      criacoes.set(chaveIdempotencia, cod);
      return cod;
    },

    async listarEscolasDoDiretor(diretorCod) {
      await esperar();
      if (exigirSessao().papeis.diretorCod !== diretorCod) {
        throw new RepositoryError('Acesso negado.', 403);
      }
      return db.escola.filter((e) => e.cod_diretor === diretorCod).map((e) => resumoEscola(e.cod));
    },

    async obterEscola(escolaCod) {
      await esperar();
      if (!ehDiretorDaEscola(exigirSessao().papeis, escolaCod)) {
        throw new RepositoryError('Acesso negado.', 403);
      }
      return resumoEscola(escolaCod);
    },

    async listarTurmasDaEscola(escolaCod) {
      await esperar();
      if (!ehDiretorDaEscola(exigirSessao().papeis, escolaCod)) {
        throw new RepositoryError('Acesso negado.', 403);
      }
      return db.turma
        .filter((t) => t.cod_escola === escolaCod)
        .map(resumoTurma)
        .sort(ordenarTurmas);
    },

    /** Professores da escola = quem dá aula em alguma turma dela (o DDL não tem outra ligação). */
    async listarProfessoresDaEscola(escolaCod): Promise<ProfessorDaEscola[]> {
      await esperar();
      exigirDiretorDaEscola(escolaCod);
      const turmas = db.turma
        .filter((t) => t.cod_escola === escolaCod)
        .map(resumoTurma)
        .sort(ordenarTurmas);
      const porProfessor = new Map<number, ProfessorDaEscola>();
      for (const t of turmas) {
        const atual = porProfessor.get(t.professorCod) ?? {
          professorCod: t.professorCod,
          nome: t.professorNome,
          materias: materiasDoProfessor(t.professorCod),
          turmas: [],
        };
        atual.turmas.push(t);
        porProfessor.set(t.professorCod, atual);
      }
      return [...porProfessor.values()].sort((a, b) => a.nome.localeCompare(b.nome));
    },

    /**
     * Uma operação só: Pessoa + Usuario + Professor.
     * O professor é da rede: qualquer diretor cadastra, e todos os diretores o veem.
     */
    async cadastrarProfessor(dados, chaveIdempotencia) {
      await esperar();
      const repetido = criacoes.get(chaveIdempotencia);
      if (repetido !== undefined) return repetido;
      if (exigirSessao().papeis.diretorCod === undefined) {
        throw new RepositoryError('Só o diretor cadastra professores.', 403);
      }
      if (db.pessoa.some((p) => p.num_documento === dados.numDocumento)) {
        throw new RepositoryError('Este CPF já tem cadastro.', 409);
      }
      const { pessoa } = criarPessoaComUsuario(dados);
      const professorCod = proximoCod(db.professor);
      db.professor.push({ cod: professorCod, cod_pessoa: pessoa.cod, data_criacao: agora() });
      criacoes.set(chaveIdempotencia, professorCod);
      return professorCod;
    },

    async renomearProfessor(professorCod, nome) {
      await esperar();
      exigirDiretor('Só o diretor altera o nome do professor.');
      const professor = db.professor.find((p) => p.cod === professorCod);
      if (!professor) throw new RepositoryError('Professor não encontrado.', 404);
      renomearPessoa(professor.cod_pessoa, nome);
    },

    async listarTurmasDoProfessor(professorCod) {
      await esperar();
      if (exigirSessao().papeis.professorCod !== professorCod) {
        throw new RepositoryError('Acesso negado.', 403);
      }
      return db.turma
        .filter((t) => t.cod_professor === professorCod)
        .map(resumoTurma)
        .sort(ordenarTurmas);
    },

    async listarAlunos(): Promise<AlunoResumo[]> {
      await esperar();
      if (exigirSessao().papeis.diretorCod === undefined) {
        throw new RepositoryError('Acesso negado.', 403);
      }
      return db.aluno
        .map((a) => {
          const pessoa = db.pessoa.find((p) => p.cod === a.cod_pessoa);
          return {
            alunoCod: a.cod,
            nome: pessoa?.nome ?? '?',
            numDocumento: pessoa?.num_documento ?? '',
            totalTurmas: db.turmaAluno.filter((ta) => ta.cod_aluno === a.cod).length,
          };
        })
        .sort((a, b) => a.nome.localeCompare(b.nome));
    },

    async listarAlunosDaEscola(escolaCod): Promise<AlunoDaEscola[]> {
      await esperar();
      exigirDiretorDaEscola(escolaCod);
      const turmas = db.turma
        .filter((t) => t.cod_escola === escolaCod)
        .map(resumoTurma)
        .sort(ordenarTurmas);
      const porAluno = new Map<number, AlunoDaEscola>();
      for (const t of turmas) {
        for (const ta of db.turmaAluno.filter((x) => x.cod_turma === t.cod)) {
          const pessoa = db.pessoa.find(
            (p) => p.cod === db.aluno.find((a) => a.cod === ta.cod_aluno)?.cod_pessoa,
          );
          const atual = porAluno.get(ta.cod_aluno) ?? {
            alunoCod: ta.cod_aluno,
            nome: pessoa?.nome ?? '?',
            numDocumento: pessoa?.num_documento ?? '',
            totalTurmas: db.turmaAluno.filter((x) => x.cod_aluno === ta.cod_aluno).length,
            turmas: [],
          };
          atual.turmas.push(t);
          porAluno.set(ta.cod_aluno, atual);
        }
      }
      return [...porAluno.values()].sort((a, b) => a.nome.localeCompare(b.nome));
    },

    /** Pessoa + Aluno, e Usuario só quando vem senha. */
    async cadastrarAluno(dados, chaveIdempotencia) {
      await esperar();
      const repetido = criacoes.get(chaveIdempotencia);
      if (repetido !== undefined) return repetido;
      if (exigirSessao().papeis.diretorCod === undefined) {
        throw new RepositoryError('Só o diretor cadastra alunos.', 403);
      }
      if (db.pessoa.some((p) => p.num_documento === dados.numDocumento)) {
        throw new RepositoryError('Este CPF já tem cadastro.', 409);
      }
      const pessoa =
        dados.senha === null
          ? criarPessoa(dados.nome, dados.numDocumento)
          : criarPessoaComUsuario({ ...dados, senha: dados.senha }).pessoa;
      const alunoCod = proximoCod(db.aluno);
      db.aluno.push({ cod: alunoCod, cod_pessoa: pessoa.cod, data_criacao: agora() });
      criacoes.set(chaveIdempotencia, alunoCod);
      return alunoCod;
    },

    async renomearAluno(alunoCod, nome) {
      await esperar();
      exigirDiretor('Só o diretor altera o nome do aluno.');
      const aluno = db.aluno.find((a) => a.cod === alunoCod);
      if (!aluno) throw new RepositoryError('Aluno não encontrado.', 404);
      renomearPessoa(aluno.cod_pessoa, nome);
    },

    async matricularAlunos(turmaCod, alunoCods) {
      await esperar();
      const turma = buscarTurma(turmaCod);
      exigirDiretorDaEscola(turma.cod_escola);
      if (alunoCods.length === 0) {
        throw new RepositoryError('Escolha ao menos um aluno.', 400);
      }
      if (alunoCods.some((cod) => !db.aluno.some((a) => a.cod === cod))) {
        throw new RepositoryError('Aluno não encontrado.', 404);
      }
      for (const cod of new Set(alunoCods)) {
        // uq_turma_aluno (cod_turma, cod_aluno): quem já está na turma fica como está.
        if (db.turmaAluno.some((ta) => ta.cod_turma === turmaCod && ta.cod_aluno === cod)) continue;
        db.turmaAluno.push({
          cod: proximoCod(db.turmaAluno),
          cod_turma: turmaCod,
          cod_aluno: cod,
          data_criacao: agora(),
        });
      }
    },

    async listarDependentes(guardiaoCod): Promise<Dependente[]> {
      await esperar();
      if (exigirSessao().papeis.guardiaoCod !== guardiaoCod) {
        throw new RepositoryError('Acesso negado.', 403);
      }
      return db.alunoGuardiao
        .filter((ag) => ag.cod_guardiao === guardiaoCod)
        .map((ag) => ({
          alunoCod: ag.cod_aluno,
          nome: nomeAluno(ag.cod_aluno),
          parentesco: enumPorCod(db.tipoParentesco, ag.cod_tipo_parentesco),
        }));
    },

    async obterTurma(turmaCod): Promise<TurmaDetalhe> {
      await esperar();
      const turma = exigirLeituraTurma(turmaCod);
      return {
        ...resumoTurma(turma),
        alunos: alunosDaTurma(turmaCod),
        avaliacoes: avaliacoesDaTurma(turmaCod).map((a) => resumoAvaliacao(a.cod)),
      };
    },

    async obterBoletimDoAluno(alunoCod): Promise<BoletimAluno> {
      await esperar();
      if (!podeVerAluno(exigirSessao().papeis, alunoCod)) {
        throw new RepositoryError('Você não tem acesso a este aluno.', 403);
      }
      return montarBoletim(alunoCod);
    },

    /** Simula a análise do boletim com IA. */
    async analisarBoletim(alunoCod): Promise<AnaliseBoletim> {
      await esperar();
      await esperar();
      if (!podeVerAluno(exigirSessao().papeis, alunoCod)) {
        throw new RepositoryError('Você não tem acesso a este aluno.', 403);
      }
      const boletim = montarBoletim(alunoCod);
      const primeiroNome = boletim.nome.split(' ')[0];
      const linhas = boletim.turmas.map((t) => {
        const media = t.media === null ? 'sem notas' : `média ${t.media.toFixed(1)}`;
        const freq =
          t.frequencia === null ? 'sem chamadas' : `frequência ${Math.round(t.frequencia * 100)}%`;
        const alerta =
          (t.media !== null && t.media < 60) || (t.frequencia !== null && t.frequencia < 0.75)
            ? 'precisa de atenção: combine uma rotina de estudo e acompanhe as faltas.'
            : 'está no caminho certo: mantenha a rotina.';
        return `• ${nomeTurma(t.turma)}: ${media}, ${freq}; ${alerta}`;
      });
      return {
        texto: [
          `${primeiroNome} tem ${boletim.turmas.length} turma(s) neste período.`,
          ...linhas,
          'Converse com o professor sobre as avaliações sem nota.',
        ].join('\n'),
        geradoEm: agora(),
      };
    },

    async obterAvaliacao(avaliacaoCod): Promise<AvaliacaoDetalhe> {
      await esperar();
      const resumo = resumoAvaliacao(avaliacaoCod);
      const turma = exigirLeituraTurma(buscarAvaliacao(avaliacaoCod).cod_turma);
      return {
        ...resumo,
        turma: resumoTurma(turma),
        notas: alunosDaTurma(turma.cod).map((al) => ({
          turmaAlunoCod: al.turmaAlunoCod,
          alunoNome: al.nome,
          nota:
            db.boletim.find(
              (b) => b.cod_turma_aluno === al.turmaAlunoCod && b.cod_avaliacao === avaliacaoCod,
            )?.nota ?? null,
        })),
      };
    },

    async criarAvaliacao(turmaCod, dados, chaveIdempotencia) {
      await esperar();
      const repetida = criacoes.get(chaveIdempotencia);
      if (repetida !== undefined) return repetida;
      exigirProfessorDaTurma(turmaCod);
      const nome = validarAvaliacao(turmaCod, dados);
      const cod = proximoCod(db.avaliacao);
      db.avaliacao.push({
        cod,
        cod_turma: turmaCod,
        cod_tipo_nota: dados.codTipoNota,
        nome,
        data_avaliacao: dados.dataAvaliacao,
        data_criacao: agora(),
      });
      criacoes.set(chaveIdempotencia, cod);
      return cod;
    },

    async atualizarAvaliacao(avaliacaoCod, dados) {
      await esperar();
      const avaliacao = buscarAvaliacao(avaliacaoCod);
      exigirProfessorDaTurma(avaliacao.cod_turma);
      avaliacao.nome = validarAvaliacao(avaliacao.cod_turma, dados, avaliacaoCod);
      avaliacao.cod_tipo_nota = dados.codTipoNota;
      avaliacao.data_avaliacao = dados.dataAvaliacao;
    },

    /** Apaga as notas (Boletim) antes da avaliação, por causa da FK `cod_avaliacao`. */
    async excluirAvaliacao(avaliacaoCod) {
      await esperar();
      const avaliacao = buscarAvaliacao(avaliacaoCod);
      exigirProfessorDaTurma(avaliacao.cod_turma);
      db.boletim = db.boletim.filter((b) => b.cod_avaliacao !== avaliacaoCod);
      db.avaliacao = db.avaliacao.filter((a) => a.cod !== avaliacaoCod);
    },

    async salvarNotas(avaliacaoCod, notas) {
      await esperar();
      const a = buscarAvaliacao(avaliacaoCod);
      exigirProfessorDaTurma(a.cod_turma);
      const validos = new Set(alunosDaTurma(a.cod_turma).map((al) => al.turmaAlunoCod));
      for (const n of notas) {
        if (!validos.has(n.turmaAlunoCod)) throw new RepositoryError('Aluno fora da turma.', 400);
        if (n.nota !== null && (n.nota < Limites.notaMin || n.nota > Limites.notaMax)) {
          throw new RepositoryError(
            `A nota precisa estar entre ${Limites.notaMin} e ${Limites.notaMax}.`,
            400,
          );
        }
      }
      for (const n of notas) {
        // uq_boletim (cod_turma_aluno, cod_avaliacao): upsert, ou remove quando a nota fica vazia.
        const i = db.boletim.findIndex(
          (b) => b.cod_turma_aluno === n.turmaAlunoCod && b.cod_avaliacao === avaliacaoCod,
        );
        if (n.nota === null) {
          if (i >= 0) db.boletim.splice(i, 1);
        } else if (i >= 0) {
          db.boletim[i] = { ...db.boletim[i], nota: Math.round(n.nota * 100) / 100 };
        } else {
          db.boletim.push({
            cod: proximoCod(db.boletim),
            cod_turma_aluno: n.turmaAlunoCod,
            cod_avaliacao: avaliacaoCod,
            nota: Math.round(n.nota * 100) / 100,
            data_criacao: agora(),
          });
        }
      }
    },

    async obterChamada(turmaCod, data): Promise<ItemChamada[]> {
      await esperar();
      exigirLeituraTurma(turmaCod);
      return alunosDaTurma(turmaCod).map((al) => {
        const lp = db.listaPresenca.find(
          (x) => x.cod_turma_aluno === al.turmaAlunoCod && x.data_presenca === data,
        );
        return {
          turmaAlunoCod: al.turmaAlunoCod,
          alunoNome: al.nome,
          codTipoPresenca: lp?.cod_tipo_presenca ?? null,
          observacao: lp?.observacao ?? null,
        };
      });
    },

    async salvarChamada(turmaCod, data, itens) {
      await esperar();
      exigirProfessorDaTurma(turmaCod);
      if (data < Limites.dataPresencaMin) throw new RepositoryError('Data inválida.', 400);
      const validos = new Set(alunosDaTurma(turmaCod).map((al) => al.turmaAlunoCod));
      for (const item of itens) {
        if (!validos.has(item.turmaAlunoCod)) {
          throw new RepositoryError('Aluno fora da turma.', 400);
        }
        if (!db.tipoPresenca.some((t) => t.cod === item.codTipoPresenca)) {
          throw new RepositoryError('Tipo de presença inválido.', 400);
        }
        if ((item.observacao?.length ?? 0) > Limites.observacaoPresencaMax) {
          throw new RepositoryError(
            `Observação com mais de ${Limites.observacaoPresencaMax} caracteres.`,
            400,
          );
        }
      }
      for (const item of itens) {
        // uq_lista_presenca (cod_turma_aluno, data_presenca): upsert.
        const observacao = item.observacao?.trim() || null;
        const i = db.listaPresenca.findIndex(
          (x) => x.cod_turma_aluno === item.turmaAlunoCod && x.data_presenca === data,
        );
        if (i >= 0) {
          db.listaPresenca[i] = {
            ...db.listaPresenca[i],
            cod_tipo_presenca: item.codTipoPresenca,
            observacao,
          };
        } else {
          db.listaPresenca.push({
            cod: proximoCod(db.listaPresenca),
            cod_turma_aluno: item.turmaAlunoCod,
            cod_tipo_presenca: item.codTipoPresenca,
            observacao,
            data_presenca: data,
            data_criacao: agora(),
          });
        }
      }
    },
  };
}
