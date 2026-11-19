import * as SecureStore from 'expo-secure-store';
import { useSyncExternalStore } from 'react';
import { Appearance, Platform } from 'react-native';

export type PreferenciaTema = 'sistema' | 'claro' | 'escuro';

const CHAVE = 'boletimplus.tema';
const VALIDAS: PreferenciaTema[] = ['sistema', 'claro', 'escuro'];

type Estado = { preferencia: PreferenciaTema; carregada: boolean };

let estado: Estado = { preferencia: 'sistema', carregada: false };
const ouvintes = new Set<() => void>();

function mudar(novo: Estado) {
  estado = novo;
  // No celular, o override também vale para os componentes nativos (alertas, calendário).
  if (Platform.OS !== 'web') {
    Appearance.setColorScheme(
      novo.preferencia === 'claro'
        ? 'light'
        : novo.preferencia === 'escuro'
          ? 'dark'
          : 'unspecified',
    );
  }
  ouvintes.forEach((avisar) => avisar());
}

async function ler(): Promise<string | null> {
  if (Platform.OS === 'web') return globalThis.localStorage?.getItem(CHAVE) ?? null;
  return SecureStore.getItemAsync(CHAVE);
}

async function gravar(valor: PreferenciaTema) {
  if (Platform.OS === 'web') globalThis.localStorage?.setItem(CHAVE, valor);
  else await SecureStore.setItemAsync(CHAVE, valor);
}

/** Lê a preferência salva no aparelho. Chamada uma vez, ao abrir o app. */
export async function carregarPreferenciaTema() {
  try {
    const salva = await ler();
    const preferencia = VALIDAS.includes(salva as PreferenciaTema)
      ? (salva as PreferenciaTema)
      : 'sistema';
    mudar({ preferencia, carregada: true });
  } catch {
    mudar({ ...estado, carregada: true });
  }
}

/** Troca o tema na hora e salva a escolha. */
export function definirPreferenciaTema(preferencia: PreferenciaTema) {
  mudar({ preferencia, carregada: true });
  gravar(preferencia).catch(() => undefined);
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

const lerEstado = () => estado;

/**
 * Tema escolhido em Configurações › Aparência: 'sistema' segue o aparelho.
 * `carregada` fica `false` até ler o valor salvo, para o app não piscar no tema errado.
 */
export function usePreferenciaTema() {
  return useSyncExternalStore(assinar, lerEstado, lerEstado);
}
