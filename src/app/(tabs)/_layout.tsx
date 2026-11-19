import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/js-tabs';
import { StyleSheet, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Botão do meio do rodapé: círculo cheio, para o Início se destacar das outras abas. */
function IconeInicio({ focused }: { focused: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.inicio,
        {
          backgroundColor: focused ? theme.primary : theme.backgroundSelected,
          borderColor: theme.backgroundElement,
        },
      ]}>
      <Ionicons
        name={focused ? 'home' : 'home-outline'}
        size={26}
        color={focused ? theme.onPrimary : theme.primary}
      />
    </View>
  );
}

/** O app abre no Início, e o botão voltar do Android volta para ele. */
export const unstable_settings = { anchor: '(inicio)' };

/**
 * Rodapé do app. A ordem dos `Tabs.Screen` é a ordem na tela:
 * Menu à esquerda, Início no centro, Configurações à direita. Só ícones, sem rótulo:
 * `tabBarAccessibilityLabel` dá o nome que o leitor de tela lê.
 * Menu e Início têm pilha própria, com as mesmas telas (`(inicio,menu)`): voltar de uma tela
 * aberta pelo Menu leva ao Menu. O app abre no Início. Tocar de novo numa aba volta ao topo dela.
 */
export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      backBehavior="initialRoute"
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarShowLabel: false,
        tabBarStyle: { borderTopColor: theme.border },
        headerTitleStyle: { fontFamily: Fonts.bold },
      }}>
      <Tabs.Screen
        name="(menu)"
        options={{
          title: 'Menu',
          tabBarAccessibilityLabel: 'Menu',
          headerShown: false,
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name={focused ? 'menu' : 'menu-outline'}
              size={size}
              color={focused ? theme.primary : theme.textSecondary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(inicio)"
        options={{
          title: 'Início',
          tabBarAccessibilityLabel: 'Início',
          headerShown: false,
          tabBarIcon: ({ focused }) => <IconeInicio focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="configuracoes"
        options={{
          title: 'Configurações',
          tabBarAccessibilityLabel: 'Configurações',
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={size}
              color={focused ? theme.primary : theme.textSecondary}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  inicio: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
  },
});
