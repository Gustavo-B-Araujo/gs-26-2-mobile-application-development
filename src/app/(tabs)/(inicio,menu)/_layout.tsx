import { Stack } from 'expo-router';

import { VoltarAcima } from '@/components/ui/voltar-acima';

/**
 * Rota compartilhada: `(inicio,menu)` cria 2 grupos com as mesmas telas, um por aba.
 * A pilha do Início abre em `index`; a do Menu abre em `menu`.
 * Navegar dentro do app mantém o grupo atual: uma tela aberta pelo Menu entra na pilha do Menu,
 * e voltar leva ao Menu. Link direto para uma turma ou boletim abre com a raiz embaixo.
 */
export const unstable_settings = {
  anchor: 'index',
  menu: { anchor: 'menu' },
};

/**
 * Pilha de cada aba: as telas abrem aqui, com o rodapé visível.
 * Os formulários (modais) ficam na pilha raiz.
 */
export default function AbaLayout() {
  return (
    <Stack
      screenOptions={({ navigation, route }) => ({
        headerBackButtonDisplayMode: 'minimal',
        headerLeft:
          route.name === 'index' || route.name === 'menu' || navigation.canGoBack()
            ? undefined
            : () => <VoltarAcima />,
      })}>
      {/* Raiz de cada aba. O Menu aberto por link direto cai no grupo do Início e se corrige (menu.tsx). */}
      <Stack.Screen name="index" options={{ title: 'Início' }} />
      <Stack.Screen name="menu" options={{ title: 'Menu' }} />
    </Stack>
  );
}
