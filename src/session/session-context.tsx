import { createContext, use, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import {
    criarRepository,
    MODO,
    SERVIDOR_PADRAO,
    SERVIDORES,
    type EscolaRepository,
    type ModoDados,
    type NovoCadastro,
    type Servidor,
    type ServidorId,
    type Sessao,
} from '@/data';

import { sessaoAtual } from './sessao-atual';
import {
    apagarSessaoSalva,
    lerServidorSalvo,
    lerSessaoSalva,
    salvarServidor,
    salvarSessao,
} from './session-storage';

/** No modo demonstração o servidor não importa: o mock responde tudo. */
const disponivel = (id: ServidorId | null | undefined): id is ServidorId =>
  !!id && id in SERVIDORES && (MODO === 'demo' || SERVIDORES[id].url !== null);

type SessionValue = {
  sessao: Sessao | null;
  /** `true` enquanto lê a sessão salva no aparelho, ao abrir o app. */
  restaurando: boolean;
  modo: ModoDados | null;
  /** Servidor escolhido no login. */
  servidor: Servidor;
  /** Só no login, sem sessão: troca o servidor e lembra a escolha no aparelho. */
  escolherServidor: (id: ServidorId) => void;
  repository: EscolaRepository | null;
  entrar: (numDocumento: string, senha: string) => Promise<void>;
  cadastrar: (dados: NovoCadastro) => Promise<void>;
  sair: () => Promise<void>;
  /** Troca o próprio nome e atualiza a sessão salva. */
  alterarNome: (nome: string) => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [restaurando, setRestaurando] = useState(true);
  const [servidorId, setServidorId] = useState<ServidorId>(SERVIDOR_PADRAO);

  function definirSessao(nova: Sessao | null) {
    sessaoAtual.definir(nova);
    setSessao(nova);
  }

  const repository = useMemo(
    () =>
      MODO &&
      criarRepository(MODO, servidorId, {
        obterSessao: sessaoAtual.obter,
        aoExpirarSessao: () => {
          sessaoAtual.definir(null);
          setSessao(null);
          apagarSessaoSalva().catch(() => undefined);
        },
      }),
    [servidorId],
  );

  useEffect(() => {
    Promise.all([lerSessaoSalva(), lerServidorSalvo()])
      .then(([salva, preferido]) => {
        // Sessão salva em outro modo de dados ou servidor não vale.
        if (salva && salva.modo === MODO && disponivel(salva.servidor)) {
          setServidorId(salva.servidor);
          sessaoAtual.definir(salva.sessao);
          setSessao(salva.sessao);
        } else if (disponivel(preferido)) {
          setServidorId(preferido);
        }
      })
      .finally(() => setRestaurando(false));
  }, []);

  function escolherServidor(id: ServidorId) {
    if (sessaoAtual.obter() || !disponivel(id)) return;
    setServidorId(id);
    salvarServidor(id).catch(() => undefined);
  }

  function exigirRepository() {
    if (!MODO || !repository) {
      throw new Error('App sem as URLs das APIs. Veja o .env.example.');
    }
    return { modo: MODO, repository };
  }

  async function iniciarSessao(nova: Sessao, modo: ModoDados) {
    definirSessao(nova);
    await salvarSessao({ modo, servidor: servidorId, sessao: nova }).catch(() => undefined);
  }

  async function entrar(numDocumento: string, senha: string) {
    const atual = exigirRepository();
    await iniciarSessao(await atual.repository.login(numDocumento, senha), atual.modo);
  }

  async function cadastrar(dados: NovoCadastro) {
    const atual = exigirRepository();
    await iniciarSessao(await atual.repository.cadastrar(dados), atual.modo);
  }

  async function alterarNome(nome: string) {
    const atual = exigirRepository();
    const pessoa = await atual.repository.alterarMeuNome(nome);
    const vigente = sessaoAtual.obter();
    if (vigente) await iniciarSessao({ ...vigente, pessoa }, atual.modo);
  }

  async function sair() {
    await repository?.logout().catch(() => undefined);
    definirSessao(null);
    await apagarSessaoSalva().catch(() => undefined);
  }

  return (
    <SessionContext
      value={{
        sessao,
        restaurando,
        modo: MODO,
        // No modo demonstração o mock responde tudo, inclusive a análise com IA.
        servidor:
          MODO === 'demo' ? { ...SERVIDORES[servidorId], analiseIa: true } : SERVIDORES[servidorId],
        escolherServidor,
        repository,
        entrar,
        cadastrar,
        sair,
        alterarNome,
      }}>
      {children}
    </SessionContext>
  );
}

export function useSession() {
  const value = use(SessionContext);
  if (!value) throw new Error('useSession precisa estar dentro de <SessionProvider>.');
  return value;
}

/** Para telas dentro da área logada: a sessão e o repository sempre existem. */
export function useSessaoAtiva() {
  const { sessao, repository } = useSession();
  if (!sessao || !repository) throw new Error('Tela protegida aberta sem sessão.');
  return { ...sessao, repository };
}
