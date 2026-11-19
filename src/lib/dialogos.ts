import { Alert, Platform } from 'react-native';

/** Alerta simples. Na web o `Alert` do React Native não aparece: usa o do navegador. */
export function avisar(mensagem: string) {
  if (Platform.OS === 'web') window.alert(mensagem);
  else Alert.alert(mensagem);
}

/** Pergunta antes de uma ação destrutiva. Resolve `true` se a pessoa confirmar. */
export function confirmar(titulo: string, mensagem: string, textoConfirmar: string) {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(`${titulo}\n\n${mensagem}`));
  return new Promise<boolean>((resolve) =>
    Alert.alert(titulo, mensagem, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
      { text: textoConfirmar, style: 'destructive', onPress: () => resolve(true) },
    ]),
  );
}

export function mensagemDeErro(e: unknown, padrao: string) {
  return e instanceof Error ? e.message : padrao;
}
