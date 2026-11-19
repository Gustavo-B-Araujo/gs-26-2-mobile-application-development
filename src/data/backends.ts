const semBarraFinal = (url: string | undefined) => (url ? url.replace(/\/$/, '') : null);

export type ServidorId = 'java' | 'dotnet';

export type Servidor = {
  id: ServidorId;
  /** Nome que a pessoa vê no login. */
  nome: string;
  url: string | null;
  /** Mostra o cartão de análise com IA. */
  analiseIa: boolean;
};

/** O Expo só embute no app as variáveis com prefixo `EXPO_PUBLIC_`, lidas pelo nome completo. */
export const SERVIDORES: Record<ServidorId, Servidor> = {
  java: {
    id: 'java',
    nome: 'Servidor Principal',
    url: semBarraFinal(process.env.EXPO_PUBLIC_JAVA_API_URL),
    analiseIa: true,
  },
  dotnet: {
    id: 'dotnet',
    nome: 'Servidor Alternativo',
    url: semBarraFinal(process.env.EXPO_PUBLIC_DOTNET_API_URL),
    analiseIa: false,
  },
};

/** Servidores com URL no `.env`, na ordem do login. */
export const SERVIDORES_DISPONIVEIS = Object.values(SERVIDORES).filter((s) => s.url !== null);

export const SERVIDOR_PADRAO: ServidorId = SERVIDORES_DISPONIVEIS[0]?.id ?? 'java';

/** `demo`: dados em memória. Só em desenvolvimento, sem URLs ou com `EXPO_PUBLIC_DEMO=true`. */
export type ModoDados = 'api' | 'demo';

const forcarDemo = process.env.EXPO_PUBLIC_DEMO === 'true';
const temApi = SERVIDORES_DISPONIVEIS.length > 0;

/** `null`: build publicado sem as URLs. O login mostra o erro de configuração. */
export const MODO: ModoDados | null =
  __DEV__ && (forcarDemo || !temApi) ? 'demo' : temApi ? 'api' : null;
