import { useColorScheme as useRNColorScheme } from 'react-native';

import { usePreferenciaTema } from './use-preferencia-tema';

/** Tema em uso: a escolha de Configurações › Aparência, ou o do aparelho em "Automático". */
export function useColorScheme() {
  const sistema = useRNColorScheme();
  const { preferencia } = usePreferenciaTema();
  if (preferencia === 'claro') return 'light';
  if (preferencia === 'escuro') return 'dark';
  return sistema;
}
