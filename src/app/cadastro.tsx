import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { mensagemDeErro } from '@/lib/dialogos';
import { apenasDigitos, formatarCpf } from '@/lib/format';
import {
    SENHA_MIN,
    validarConfirmacao,
    validarCpf,
    validarNome,
    validarSenha,
} from '@/lib/validacao';
import { useSession } from '@/session/session-context';

/**
 * Cadastro de responsável (Guardião). A conta entra logada;
 * a escola vincula os dependentes (AlunoGuardiao) depois.
 */
export default function CadastroScreen() {
  const { cadastrar } = useSession();
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [tentou, setTentou] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const erros = {
    nome: validarNome(nome),
    cpf: validarCpf(cpf),
    senha: validarSenha(senha),
    confirmacao: validarConfirmacao(senha, confirmacao),
  };
  const valido = Object.values(erros).every((e) => e === null);
  const mostrar = (campo: keyof typeof erros) => (tentou ? erros[campo] : null);

  async function enviar() {
    setTentou(true);
    if (!valido) return;
    setErro(null);
    setEnviando(true);
    try {
      await cadastrar({ nome: nome.trim(), numDocumento: apenasDigitos(cpf), senha });
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível criar a conta.'));
      setEnviando(false);
    }
  }

  return (
    <Screen rodape={<Button titulo="Criar conta" onPress={enviar} carregando={enviando} />}>
      <Card>
        <ThemedText type="smallBold">Conta de responsável</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Depois do cadastro, a escola vincula seus dependentes e você acompanha notas e presença.
        </ThemedText>
      </Card>

      <TextField
        rotulo="Nome completo"
        value={nome}
        onChangeText={setNome}
        autoComplete="name"
        textContentType="name"
        autoCapitalize="words"
        maxLength={150}
        erro={mostrar('nome')}
      />
      <TextField
        rotulo="CPF"
        value={formatarCpf(cpf)}
        onChangeText={setCpf}
        placeholder="000.000.000-00"
        keyboardType="number-pad"
        maxLength={14}
        erro={mostrar('cpf')}
      />
      <TextField
        rotulo={`Senha (mínimo ${SENHA_MIN} caracteres, letras e números)`}
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        erro={mostrar('senha')}
      />
      <TextField
        rotulo="Confirme a senha"
        value={confirmacao}
        onChangeText={setConfirmacao}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        onSubmitEditing={enviar}
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
