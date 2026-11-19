import type { HttpClient } from './http-client';
import type { EscolaRepository, Sessao } from './repository';

const comData = (data: string) => `?data=${encodeURIComponent(data)}`;

export function criarHttpRepository(api: HttpClient): EscolaRepository {
  return {
    login: (numDocumento, senha) =>
      api<Sessao>('POST', '/auth/login', { corpo: { num_documento: numDocumento, senha } }),
    cadastrar: (dados) =>
      api<Sessao>('POST', '/auth/cadastro', {
        corpo: { nome: dados.nome, num_documento: dados.numDocumento, senha: dados.senha },
      }),
    logout: () => api('POST', '/auth/logout'),
    alterarSenha: (senhaAtual, novaSenha) =>
      api('PUT', '/auth/senha', { corpo: { senha_atual: senhaAtual, nova_senha: novaSenha } }),
    alterarMeuNome: (nome) => api('PUT', '/auth/nome', { corpo: { nome } }),

    listarTiposPresenca: () => api('GET', '/tipos/presenca'),
    listarTiposNota: () => api('GET', '/tipos/nota'),
    listarTiposCurso: () => api('GET', '/tipos/curso'),
    inserirTipoCurso: (enumerador) => api('POST', '/tipos/curso', { corpo: { enumerador } }),

    listarEscolasDoDiretor: (cod) => api('GET', `/diretores/${cod}/escolas`),
    obterEscola: (cod) => api('GET', `/escolas/${cod}`),
    listarTurmasDaEscola: (cod) => api('GET', `/escolas/${cod}/turmas`),
    async criarTurma(escolaCod, dados, chaveIdempotencia) {
      const criada = await api<{ cod: number }>('POST', `/escolas/${escolaCod}/turmas`, {
        corpo: {
          cod_tipo_curso: dados.codTipoCurso,
          cod_professor: dados.codProfessor,
          semestre_referencia: dados.semestre,
          ano_referencia: dados.ano,
        },
        chaveIdempotencia,
      });
      return criada.cod;
    },
    listarProfessores: () => api('GET', '/professores'),
    listarProfessoresDaEscola: (cod) => api('GET', `/escolas/${cod}/professores`),
    async cadastrarProfessor(dados, chaveIdempotencia) {
      const criado = await api<{ professorCod: number }>('POST', '/professores', {
        corpo: { nome: dados.nome, num_documento: dados.numDocumento, senha: dados.senha },
        chaveIdempotencia,
      });
      return criado.professorCod;
    },
    renomearProfessor: (cod, nome) => api('PUT', `/professores/${cod}`, { corpo: { nome } }),
    listarTurmasDoProfessor: (cod) => api('GET', `/professores/${cod}/turmas`),
    listarAlunos: () => api('GET', '/alunos'),
    listarAlunosDaEscola: (cod) => api('GET', `/escolas/${cod}/alunos`),
    async cadastrarAluno(dados, chaveIdempotencia) {
      const criado = await api<{ alunoCod: number }>('POST', '/alunos', {
        corpo: { nome: dados.nome, num_documento: dados.numDocumento, senha: dados.senha },
        chaveIdempotencia,
      });
      return criado.alunoCod;
    },
    renomearAluno: (cod, nome) => api('PUT', `/alunos/${cod}`, { corpo: { nome } }),
    matricularAlunos: (turmaCod, alunoCods) =>
      api('POST', `/turmas/${turmaCod}/alunos`, { corpo: { cod_alunos: alunoCods } }),
    listarDependentes: (cod) => api('GET', `/guardioes/${cod}/dependentes`),

    obterTurma: (cod) => api('GET', `/turmas/${cod}`),
    obterBoletimDoAluno: (cod) => api('GET', `/alunos/${cod}/boletim`),
    analisarBoletim: (cod) => api('POST', `/alunos/${cod}/boletim/analise`),

    obterAvaliacao: (cod) => api('GET', `/avaliacoes/${cod}`),
    async criarAvaliacao(turmaCod, dados, chaveIdempotencia) {
      const criada = await api<{ cod: number }>('POST', `/turmas/${turmaCod}/avaliacoes`, {
        corpo: dados,
        chaveIdempotencia,
      });
      return criada.cod;
    },
    atualizarAvaliacao: (cod, dados) => api('PUT', `/avaliacoes/${cod}`, { corpo: dados }),
    excluirAvaliacao: (cod) => api('DELETE', `/avaliacoes/${cod}`),
    salvarNotas: (cod, notas) => api('PUT', `/avaliacoes/${cod}/notas`, { corpo: { notas } }),

    obterChamada: (cod, data) => api('GET', `/turmas/${cod}/chamada${comData(data)}`),
    salvarChamada: (cod, data, itens) =>
      api('PUT', `/turmas/${cod}/chamada${comData(data)}`, { corpo: { itens } }),
  };
}
