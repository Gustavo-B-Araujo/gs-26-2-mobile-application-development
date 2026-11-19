import {
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    useFonts,
} from '@expo-google-fonts/nunito';
import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { VoltarAcima } from '@/components/ui/voltar-acima';
import { criarNavigationTheme } from '@/constants/navigation-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { carregarPreferenciaTema, usePreferenciaTema } from '@/hooks/use-preferencia-tema';
import { SessionProvider, useSession } from '@/session/session-context';

SplashScreen.preventAutoHideAsync().catch(() => undefined);
carregarPreferenciaTema();

function RootStack() {
  const { sessao, restaurando } = useSession();
  const { carregada: temaCarregado } = usePreferenciaTema();
  const [fontesProntas, erroFontes] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });
  const pronto = !restaurando && temaCarregado && (fontesProntas || erroFontes !== null);
  const logado = sessao !== null;

  useEffect(() => {
    if (pronto) SplashScreen.hide();
  }, [pronto]);

  if (!pronto) return null;

  return (
    <Stack
      screenOptions={({ navigation }) => ({
        headerBackButtonDisplayMode: 'minimal',
        headerLeft: navigation.canGoBack() ? undefined : () => <VoltarAcima />,
      })}>
      <Stack.Protected guard={logado}>
        {/* Abas com o rodapé: Menu, Início e Configurações. */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!logado}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="cadastro" options={{ title: 'Criar conta' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const esquema = useColorScheme() === 'dark' ? 'dark' : 'light';
  return (
    <ThemeProvider value={criarNavigationTheme(esquema)}>
      <SessionProvider>
        <RootStack />
      </SessionProvider>
      {/* Texto da barra de status contrário ao fundo do tema escolhido, não ao do sistema. */}
      <StatusBar style={esquema === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
