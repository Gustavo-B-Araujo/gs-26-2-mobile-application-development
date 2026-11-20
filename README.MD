# Boletim Plus

Global Solution 2026/2
CitizenTech Disciplina: Mobile Application Development
Turma: 2TDSPW

## Integrantes

| Nome | RM |
|---|---|
| Gustavo Barrios de Araújo | 563358 |
| Phietro Solon Oliveira | 563842 |

## Problema CitizenTech

Em diversas escolas, o responsável costuma saber da nota baixa ou das faltas do filho só no fim do bimestre, quando o boletim em papel chega. Nessa hora, a recuperação já ficou difícil.

O **Boletim Plus** é um boletim digital. O professor registra notas e presenças, e o sistema:

- calcula a média por aluno e disciplina e classifica a situação (aprovado, recuperação, reprovado);
- calcula a frequência e gera um alerta quando ela fica abaixo de 75%;
- indica quais responsáveis devem ser avisados de cada alerta;
- guarda o histórico das mudanças de status dos usuários, para auditoria.

O cidadão ganha acompanhamento escolar em tempo real, sem depender de reunião presencial ou de papel.

Repositório dB: https://github.com/Gustavo-B-Araujo/gs-26-2-mastering-relational-and-non-relational-database
Repositório .NET: https://github.com/Gustavo-B-Araujo/gs-26-2-advanced-business-development
Repositório Java: https://github.com/Gustavo-B-Araujo/gs-26-2-java-advanced
Vídeo demonstração: https://youtu.be/8NOZdNgO4Nk


## Rodar

1. Instale as dependências: `npm install`.
2. Copie `.env.example` para `.env` e preencha as URLs das 2 APIs. Com só 1 URL, o login não
   mostra o seletor de servidor.
3. Suba o app: `npx expo start` e abra no Expo Go pelo QR code.

No celular, use o IP da máquina na rede (ex.: `http://192.168.0.10:8080`), não `localhost`.

Sem nenhuma URL no `.env`, ou com `EXPO_PUBLIC_DEMO=true`, o app entra no modo **Demonstração**:
dados em memória, copiados da `02_dml.sql` do repositório de banco. Ele só existe em
desenvolvimento (`__DEV__`); o app publicado usa só as APIs. Senha das contas de demonstração: `123456`.

| CPF            | Pessoa          | Papel      | O que vê                                     |
| -------------- | --------------- | ---------- | -------------------------------------------- |
| 123.456.789-00 | Seymour Skinner | Diretor    | Escola, professores, turmas; cria turma      |
| 123.456.789-01 | Edna Krabappel  | Professora | Português e Matemática; chamada e avaliações |
| 123.456.789-03 | Marge Simpson   | Guardiã    | Boletim de Bart e Lisa                       |
| 123.456.789-04 | Bart Simpson    | Aluno      | O próprio boletim                            |
| 123.456.789-02 | Homer Simpson   | Bloqueado  | Login recusado (`StatusUsuario = Bloqueado`) |

`TipoCurso` é a matéria da turma (Português, Matemática, História). As matérias de um professor
são as das turmas dele.

## Telas

| Rota                          | Tela                                                  | Acesso                              |
| ----------------------------- | ----------------------------------------------------- | ----------------------------------- |
| `/login`                      | Login por CPF e senha                                 | Público                             |
| `/cadastro`                   | Cadastro de responsável                               | Público                             |
| `/`                           | Início: painel e novidades do aluno, turmas e escolas | Logado                              |
| `/configuracoes`              | Conta, nome, senha, aparência, sobre, sair            | Logado                              |
| `/menu`                       | Menu: funcionalidades por categoria                   | Logado                              |
| `/conta/senha`                | Alterar a própria senha                               | Logado                              |
| `/conta/nome`                 | Alterar o próprio nome                                | Diretor, guardião                   |
| `/escola/[cod]`               | Turmas da escola                                      | Diretor                             |
| `/escola/[cod]/professores`   | Professores da escola; tocar edita o nome             | Diretor                             |
| `/escola/[cod]/alunos`        | Alunos da escola e sem turma; tocar edita o nome      | Diretor                             |
| `/professor/novo`             | Cadastrar professor na rede                           | Diretor (de qualquer escola)        |
| `/curso/novo`                 | Cadastrar curso (matéria) na rede                     | Diretor (de qualquer escola)        |
| `/aluno/novo`                 | Cadastrar aluno na rede                               | Diretor (de qualquer escola)        |
| `/professor/[cod]/editar`     | Alterar o nome do professor                           | Diretor (de qualquer escola)        |
| `/aluno/[cod]/editar`         | Alterar o nome do aluno                               | Diretor (de qualquer escola)        |
| `/escola/[cod]/nova-turma`    | Criar turma                                           | Diretor                             |
| `/turma/[cod]`                | Avaliações e alunos                                   | Professor, diretor                  |
| `/turma/[cod]/matricular`     | Matricular alunos da rede na turma                    | Diretor da escola                   |
| `/turma/[cod]/chamada`        | Chamada do dia                                        | Professor                           |
| `/chamada`                    | Chamada com escolha da matéria                        | Professor                           |
| `/turma/[cod]/nova-avaliacao` | Criar avaliação                                       | Professor                           |
| `/nova-avaliacao`             | Nova avaliação com escolha da matéria                 | Professor                           |
| `/avaliacao/[cod]`            | Lançar notas, excluir avaliação                       | Professor, diretor                  |
| `/avaliacao/[cod]/editar`     | Editar avaliação                                      | Professor                           |
| `/aluno/[cod]`                | Boletim: notas e médias, com análise por IA (só Java) | Aluno, guardião, professor, diretor |
| `/aluno/[cod]/frequencia`     | Frequência escolar: presenças e faltas por matéria    | Aluno, guardião, professor, diretor |
| `/dependentes/boletim`        | Boletim com o dependente escolhido no topo            | Guardião                            |
| `/dependentes/frequencia`     | Frequência com o dependente escolhido no topo         | Guardião                            |
| `/sobre`                      | Sobre o App: versão e hash do commit                  | Público                             |

As rotas logadas ficam em `Stack.Protected` (`src/app/_layout.tsx`). Sem sessão, o app volta ao login.
Dentro da área logada, cada rota também fica num `Stack.Protected` do papel da coluna "Acesso"
(`src/session/papeis.ts`): para quem não tem o papel, a rota não existe e o app volta ao Início.
Isso só organiza o app. Quem protege os dados é a API, que confere o JWT em cada rota.

### Rodapé

O rodapé tem 3 abas só com ícone (`src/app/(tabs)/_layout.tsx`): **Menu** à esquerda,
**Início** no centro e **Configurações** à direita. Menu e Início têm pilha própria com as mesmas
telas (rota compartilhada `src/app/(tabs)/(inicio,menu)/`): escola, turma, chamada, notas e boletim
abrem na pilha da aba onde a pessoa está, com o rodapé visível. Voltar de uma tela aberta pelo Menu
leva ao Menu; tocar de novo numa aba volta ao topo dela. Os formulários abrem como modal na pilha
raiz, por cima do rodapé.

O Menu separa as funcionalidades por categoria, e cada uma só aparece para o papel que a usa:

| Categoria         | Papel              | Itens                                                                          |
| ----------------- | ------------------ | ------------------------------------------------------------------------------ |
| Acompanhamento    | Aluno, responsável | Meu boletim e minha frequência; Boletim e Frequência com o dependente no topo  |
| Sala de aula      | Professor          | Fazer chamada e nova avaliação: uma tela cada, com a matéria escolhida no topo |
| Gestão escolar    | Diretor            | Turmas e matrículas, professores e alunos da escola                            |
| Cadastros da rede | Diretor            | Cadastrar professor, aluno, curso e turma                                      |

## Estrutura

```
src/
  app/                 rotas (Expo Router): uma tela por arquivo
  components/
    ui/                botão, card, campo, campo de data (calendário), chips, logo
    avaliacao-form.tsx formulário de criar e editar avaliação
    analise-ia-card.tsx análise do boletim com IA
  constants/           tema: cores, fontes, espaçamentos
  data/
    backends.ts        servidores (nome, URL do .env, análise com IA) e modo demonstração
    http-client.ts     fetch: token, timeout, idempotência, erros 401/403/429
    http-repository.ts rotas REST do contrato
    mock-repository.ts implementação em memória (desenvolvimento)
    repository.ts      interface EscolaRepository: o contrato das telas
    schema.ts, seed.ts tipos do DDL e dados de demonstração
  hooks/               useAsync, tema
  lib/                 formatação, validação, diálogos, chave de idempotência
  session/             sessão: contexto, token no SecureStore
```

## Contrato da API

Os 2 backends implementam todas as rotas abaixo, menos a análise com IA (só Java). O app manda
todas as chamadas para o servidor escolhido no login (`src/data/backends.ts`). Os 2 backends usam o
mesmo banco Oracle. Trocar de servidor só é possível na tela de login, sem sessão.

Toda rota, menos `/auth/login` e `/auth/cadastro`, recebe `Authorization: Bearer <jwt>`.

### Conta e acompanhamento

Login, cadastro, senha, nome, dependentes, boletim e análise com IA (só Java, Spring AI).

| Método | Rota                           | Corpo                            | Resposta                      |
| ------ | ------------------------------ | -------------------------------- | ----------------------------- |
| POST   | `/auth/login`                  | `{ num_documento, senha }`       | `Sessao`                      |
| POST   | `/auth/cadastro`               | `{ nome, num_documento, senha }` | 201 `Sessao`                  |
| PUT    | `/auth/senha`                  | `{ senha_atual, nova_senha }`    | 204 (senha atual errada: 400) |
| PUT    | `/auth/nome`                   | `{ nome }`                       | `Pessoa` (diretor, guardião)  |
| POST   | `/auth/logout`                 | —                                | 204                           |
| GET    | `/guardioes/:cod/dependentes`  | —                                | `Dependente[]`                |
| GET    | `/alunos/:cod/boletim`         | —                                | `BoletimAluno`                |
| POST   | `/alunos/:cod/boletim/analise` | —                                | `AnaliseBoletim` (só Java)    |

### Gestão escolar e sala de aula

Tipos, escolas, turmas, cursos, professores, alunos, matrícula, avaliações, notas e chamada.

| Método | Rota                                             | Corpo                                                                                               | Resposta                                    |
| ------ | ------------------------------------------------ | --------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| GET    | `/tipos/presenca`, `/tipos/nota`, `/tipos/curso` | —                                                                                                   | `Enumerador[]`                              |
| POST   | `/tipos/curso`                                   | `{ enumerador }`                                                                                    | 201 `Enumerador` (só diretor; repetido 409) |
| GET    | `/professores`                                   | —                                                                                                   | `ProfessorResumo[]`                         |
| POST   | `/professores`                                   | `{ nome, num_documento, senha }` + header `Idempotency-Key`                                         | 201 `{ professorCod }` (só diretor)         |
| PUT    | `/professores/:cod`                              | `{ nome }`                                                                                          | 204 (só diretor)                            |
| GET    | `/alunos`                                        | —                                                                                                   | `AlunoResumo[]` (só diretor)                |
| POST   | `/alunos`                                        | `{ nome, num_documento, senha \| null }` + header `Idempotency-Key`                                 | 201 `{ alunoCod }` (só diretor)             |
| PUT    | `/alunos/:cod`                                   | `{ nome }`                                                                                          | 204 (só diretor)                            |
| POST   | `/turmas/:cod/alunos`                            | `{ cod_alunos }`                                                                                    | 204 (só diretor da escola)                  |
| GET    | `/diretores/:cod/escolas`                        | —                                                                                                   | `EscolaResumo[]`                            |
| GET    | `/escolas/:cod`                                  | —                                                                                                   | `EscolaResumo`                              |
| GET    | `/escolas/:cod/turmas`                           | —                                                                                                   | `TurmaResumo[]`                             |
| POST   | `/escolas/:cod/turmas`                           | `{ cod_tipo_curso, cod_professor, semestre_referencia, ano_referencia }` + header `Idempotency-Key` | 201 `{ cod }`                               |
| GET    | `/escolas/:cod/professores`                      | —                                                                                                   | `ProfessorDaEscola[]`                       |
| GET    | `/escolas/:cod/alunos`                           | —                                                                                                   | `AlunoDaEscola[]` (só diretor da escola)    |
| GET    | `/professores/:cod/turmas`                       | —                                                                                                   | `TurmaResumo[]`                             |
| GET    | `/turmas/:cod`                                   | —                                                                                                   | `TurmaDetalhe`                              |
| POST   | `/turmas/:cod/avaliacoes`                        | `DadosAvaliacao` + header `Idempotency-Key`                                                         | 201 `{ cod }`                               |
| GET    | `/avaliacoes/:cod`                               | —                                                                                                   | `AvaliacaoDetalhe`                          |
| PUT    | `/avaliacoes/:cod`                               | `DadosAvaliacao`                                                                                    | 204                                         |
| DELETE | `/avaliacoes/:cod`                               | —                                                                                                   | 204                                         |
| PUT    | `/avaliacoes/:cod/notas`                         | `{ notas }`                                                                                         | 204                                         |
| GET    | `/turmas/:cod/chamada?data=YYYY-MM-DD`           | —                                                                                                   | `ItemChamada[]`                             |
| PUT    | `/turmas/:cod/chamada?data=YYYY-MM-DD`           | `{ itens }`                                                                                         | 204                                         |

Os tipos estão em `src/data/repository.ts`.

Erro: status 4xx/5xx com a mensagem no corpo. O app lê `mensagem`, `message` (Spring) ou
`detail`/`title` (ProblemDetails do ASP.NET) e mostra na tela.

### Regras que o backend aplica

O mock aplica as mesmas regras; no app publicado, quem garante a segurança é a API.

- **Login:** compara a senha com `senha_hash` (bcrypt). Só `StatusUsuario = ATIVO` entra.
- **Alterar senha:** qualquer usuário logado, só a própria. Compara `senha_atual` com
  `senha_hash` (bcrypt) e grava o hash da nova. Senha atual errada responde 400, não 401: o app
  trata 401 como sessão vencida e volta ao login. A nova senha segue a regra do cadastro
  (mínimo 8 caracteres, letras e números) e precisa ser diferente da atual.
- **Alterar o próprio nome:** só diretor e guardião (papel lido no banco pelo `sub`); outro
  papel recebe 403. Faz `UPDATE Pessoa SET nome` da pessoa do token e devolve a `Pessoa`; o app
  troca o nome na sessão salva. O CPF (`num_documento`) não muda.
- **Alterar nome de professor ou aluno:** só diretor, de qualquer escola (professor e aluno são
  da rede). Acha o `cod_pessoa` em `Professor` ou `Aluno` e faz `UPDATE Pessoa SET nome`.
  Código inexistente responde 404. O nome vale para todos os papéis da pessoa.
- **Nome:** nome e sobrenome, até 150 caracteres (`Pessoa.nome VARCHAR2(150)`); fora disso, 400.
- **Cadastro:** cria `Pessoa`, `Usuario` ATIVO e `Guardiao`. CPF repetido responde 409.
- **Cadastro de professor:** qualquer diretor, de qualquer escola. Numa transação: cria
  `Pessoa`, `Usuario` e `Professor`. CPF repetido responde 409. O professor é da rede, não de
  uma escola: todos os diretores o veem em `GET /professores`. O DDL só liga professor e escola
  pela `Turma`: o professor novo aparece com `materias: []` e ganha turma em "Nova turma".
- **Cadastro de aluno:** qualquer diretor. Numa transação: cria `Pessoa` e `Aluno`, e
  `Usuario` ATIVO só quando vem `senha`. Sem senha, o aluno não entra no app (como Lisa e
  Milhouse na DML). CPF repetido responde 409.
- **Alunos da escola:** só o diretor da escola. Junta `TurmaAluno` com as turmas da escola e
  devolve cada aluno uma vez, com as turmas dele ali. `GET /alunos` traz `totalTurmas` (matrículas
  na rede inteira); o app mostra os de `totalTurmas = 0` como "Sem turma na rede".
- **Matrícula:** só o diretor da escola da turma. Insere em `TurmaAluno` os alunos de
  `cod_alunos`. Aluno já matriculado é ignorado (`uq_turma_aluno`), então repetir é seguro.
  Lista vazia responde 400; aluno que não existe, 404.
- **Cadastro de curso:** qualquer diretor. O curso (`TipoCurso`) vale para todas as escolas.
- **Criar turma:** só o diretor da escola. O professor é obrigatório (`cod_professor NOT NULL`)
  e pode ser qualquer um da rede (`GET /professores`, só para diretor). Valida os CHECKs:
  semestre 1 ou 2, ano a partir de 2000.
- **Leitura:** aluno vê o próprio boletim. Guardião vê os dependentes de `AlunoGuardiao`.
  Professor vê as próprias turmas. Diretor vê a própria escola.
- **Escrita:** só o professor da turma (`Turma.cod_professor`) lança chamada, notas e avaliações.
- **Idempotência:** o POST de avaliação com uma `Idempotency-Key` já usada devolve a mesma avaliação.
- **Exclusão:** `DELETE /avaliacoes/:cod` apaga as linhas de `Boletim` antes (FK `cod_avaliacao`).
- **Notas:** `PUT` faz upsert por `uq_boletim`. Nota `null` apaga a linha de `Boletim`.
- **Chamada:** `PUT` faz upsert por `uq_lista_presenca`.
- **Rate limit:** 429 com header `Retry-After`; o app mostra "Tente de novo em N s".
- **JWT:** cada backend emite o token no login e no cadastro (`sub` = `Usuario.cod`, HS256). Com
  a mesma `JWT_SECRET` nos 2 backends, o token de um vale no outro. Cada API lê os papéis no banco
  a partir do `sub`; nenhuma confia no que o app manda.
- **Token vencido:** 401 numa rota autenticada; o app apaga a sessão e volta ao login.
- **Frequência:** só `Presente` conta como presença.
- **Enumeradores:** o app compara pelo texto normalizado (`'Falta Justificada'` →
  `FALTA_JUSTIFICADA`). Mantenha os valores da `02_dml.sql`.

## Verificar

```bash
npm run lint
npm run typecheck
npm run format:check
npx expo-doctor
```