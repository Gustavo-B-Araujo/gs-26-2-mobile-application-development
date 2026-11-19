import { router } from 'expo-router';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { avisar, mensagemDeErro } from '@/lib/dialogos';
import { SENHA_MIN, validarConfirmacao, validarSenha } from '@/lib/validacao';
import { useSessaoAtiva } from '@/session/session-context';

/** Qualquer usuário logado troca a própria senha. */
export default function AlterarSenhaScreen() {
  const { repository } = useSessaoAtiva();
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [tentou, setTentou] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const erros = {
    atual: atual ? null : 'Informe a senha atual.',
    nova: validarSenha(nova) ?? (nova === atual ? 'Use uma senha diferente da atual.' : null),
    confirmacao: validarConfirmacao(nova, confirmacao),
  };
  const valido = Object.values(erros).every((e) => e === null);
  const mostrar = (campo: keyof typeof erros) => (tentou ? erros[campo] : null);

  async function salvar() {
    setTentou(true);
    if (!valido) return;
    setErro(null);
    setSalvando(true);
    try {
      await repository.alterarSenha(atual, nova);
      avisar('Senha alterada. Use a nova senha no próximo login.');
      router.back();
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível alterar a senha.'));
      setSalvando(false);
    }
  }

  return (
    <Screen rodape={<Button titulo="Alterar senha" onPress={salvar} carregando={salvando} />}>
      <TextField
        rotulo="Senha atual"
        value={atual}
        onChangeText={setAtual}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        autoFocus
        erro={mostrar('atual')}
      />
      <TextField
        rotulo={`Nova senha (mínimo ${SENHA_MIN} caracteres, letras e números)`}
        value={nova}
        onChangeText={setNova}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        erro={mostrar('nova')}
      />
      <TextField
        rotulo="Confirme a nova senha"
        value={confirmacao}
        onChangeText={setConfirmacao}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        onSubmitEditing={salvar}
        erro={mostrar('confirmacao')}
      />

      {erro && (
        <ThemedText themeColor="danger" accessibilityLiveRegion="polite">
          {erro}
        </ThemedText>
      )}
    </Screen>
  );
}
