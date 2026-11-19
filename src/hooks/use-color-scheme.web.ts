import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { usePreferenciaTema } from './use-preferencia-tema';

const semAssinatura = () => () => {};

export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(
    semAssinatura,
    () => true,
    () => false,
  );
  const colorScheme = useRNColorScheme();
  const { preferencia } = usePreferenciaTema();

  if (!hasHydrated) return 'light';
  if (preferencia === 'claro') return 'light';
  if (preferencia === 'escuro') return 'dark';
  return colorScheme;
}
