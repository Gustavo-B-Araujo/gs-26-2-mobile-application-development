import { RepositoryError } from './repository';

const TEMPO_LIMITE_MS = 15_000;

type Metodo = 'GET' | 'POST' | 'PUT' | 'DELETE';

type Opcoes = {
  corpo?: unknown;
  chaveIdempotencia?: string;
};

export type HttpClient = <T>(metodo: Metodo, caminho: string, opcoes?: Opcoes) => Promise<T>;

type Config = {
  baseUrl: string;
  obterToken: () => string | null;
  aoExpirarSessao: () => void;
};

async function lerMensagemDeErro(resposta: Response): Promise<string | null> {
  const corpo = (await resposta.json().catch(() => null)) as Record<string, unknown> | null;
  const mensagem = corpo?.mensagem ?? corpo?.message ?? corpo?.detail ?? corpo?.title;
  return typeof mensagem === 'string' ? mensagem : null;
}

async function erroDaResposta(resposta: Response): Promise<RepositoryError> {
  const mensagem = await lerMensagemDeErro(resposta);
  switch (resposta.status) {
    case 401:
      return new RepositoryError(mensagem ?? 'Sessão expirada. Entre de novo.', 401);
    case 403:
      return new RepositoryError(mensagem ?? 'Você não tem permissão para esta ação.', 403);
    case 429: {
      const espera = resposta.headers.get('Retry-After');
      const quando = espera ? `em ${espera} s` : 'em instantes';
      return new RepositoryError(`Muitas requisições. Tente de novo ${quando}.`, 429);
    }
    default:
      return new RepositoryError(
        mensagem ?? `Erro ${resposta.status} no servidor.`,
        resposta.status,
      );
  }
}

export function criarHttpClient({ baseUrl, obterToken, aoExpirarSessao }: Config): HttpClient {
  return async function requisitar<T>(metodo: Metodo, caminho: string, opcoes: Opcoes = {}) {
    const token = obterToken();
    const controle = new AbortController();
    const timer = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);

    let resposta: Response;
    try {
      resposta = await fetch(`${baseUrl}${caminho}`, {
        method: metodo,
        signal: controle.signal,
        headers: {
          Accept: 'application/json',
          ...(opcoes.corpo !== undefined ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(opcoes.chaveIdempotencia ? { 'Idempotency-Key': opcoes.chaveIdempotencia } : {}),
        },
        body: opcoes.corpo === undefined ? undefined : JSON.stringify(opcoes.corpo),
      });
    } catch {
      throw new RepositoryError(
        controle.signal.aborted
          ? 'O servidor demorou para responder. Tente de novo.'
          : 'Sem conexão com o servidor.',
      );
    } finally {
      clearTimeout(timer);
    }

    if (!resposta.ok) {
      if (resposta.status === 401 && token) aoExpirarSessao();
      throw await erroDaResposta(resposta);
    }

    const texto = await resposta.text();
    return (texto ? JSON.parse(texto) : undefined) as T;
  };
}
