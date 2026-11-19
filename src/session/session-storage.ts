import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { ModoDados, ServidorId, Sessao } from '@/data';

const CHAVE = 'boletimplus.sessao';
const CHAVE_SERVIDOR = 'boletimplus.servidor';

export type SessaoSalva = { modo: ModoDados; servidor: ServidorId; sessao: Sessao };

/**
 * Guarda a sessão para o login sobreviver ao fechar o app.
 * No celular usa o SecureStore (Keychain/Keystore, criptografado).
 * Na web o SecureStore não existe: usa o localStorage.
 */
async function ler(chave: string): Promise<string | null> {
  if (Platform.OS === 'web') return globalThis.localStorage?.getItem(chave) ?? null;
  return SecureStore.getItemAsync(chave);
}

async function gravar(chave: string, texto: string): Promise<void> {
  if (Platform.OS === 'web') globalThis.localStorage?.setItem(chave, texto);
  else await SecureStore.setItemAsync(chave, texto);
}

export async function lerSessaoSalva(): Promise<SessaoSalva | null> {
  try {
    const texto = await ler(CHAVE);
    return texto ? (JSON.parse(texto) as SessaoSalva) : null;
  } catch {
    return null;
  }
}

export async function salvarSessao(valor: SessaoSalva): Promise<void> {
  await gravar(CHAVE, JSON.stringify(valor));
}

export async function apagarSessaoSalva(): Promise<void> {
  if (Platform.OS === 'web') globalThis.localStorage?.removeItem(CHAVE);
  else await SecureStore.deleteItemAsync(CHAVE);
}

/** Último servidor escolhido no login, para a tela já abrir nele. */
export async function lerServidorSalvo(): Promise<ServidorId | null> {
  try {
    const valor = await ler(CHAVE_SERVIDOR);
    return valor === 'java' || valor === 'dotnet' ? valor : null;
  } catch {
    return null;
  }
}

export async function salvarServidor(servidor: ServidorId): Promise<void> {
  await gravar(CHAVE_SERVIDOR, servidor);
}
