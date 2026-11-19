import { router } from 'expo-router';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { mensagemDeErro } from '@/lib/dialogos';
import { apenasDigitos, formatarCpf } from '@/lib/format';
import { gerarChaveIdempotencia } from '@/lib/idempotencia';
import { SENHA_MIN, validarCpf, validarNome, validarSenha } from '@/lib/validacao';
import { useSessaoAtiva } from '@/session/session-context';

/**
 * Qualquer diretor cadastra o professor na rede. Ele não pertence a uma escola:
 * ganha turma em "Nova turma", em qualquer escola, e todos os diretores o veem.
 */
export default function NovoProfessorScreen() {
  const { repository } = useSessaoAtiva();
  const [chaveIdempotencia] = useState(gerarChaveIdempotencia);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [tentou, setTentou] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const erros = {
    nome: validarNome(nome),
    cpf: validarCpf(cpf),
    senha: validarSenha(senha),
  };
  const valido = Object.values(erros).every((e) => e === null);
  const mostrar = (campo: keyof typeof erros) => (tentou ? erros[campo] : null);

  async function salvar() {
    setTentou(true);
    if (!valido) return;
    setErro(null);
    setSalvando(true);
    try {
      await repository.cadastrarProfessor(
        { nome: nome.trim(), numDocumento: apenasDigitos(cpf), senha },
        chaveIdempotencia,
      );
      router.back();
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível cadastrar o professor.'));
      setSalvando(false);
    }
  }

  return (
    <Screen rodape={<Button titulo="Cadastrar professor" onPress={salvar} carregando={salvando} />}>
      <TextField
        rotulo="Nome completo"
        value={nome}
        onChangeText={setNome}
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
        rotulo={`Senha inicial (mínimo ${SENHA_MIN} caracteres, letras e números)`}
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        autoComplete="off"
        erro={mostrar('senha')}
      />

      <ThemedText type="small" themeColor="textSecondary">
        O professor fica disponível para todas as escolas. Para dar aula, atribua a ele uma turma em
        Nova turma.
      </ThemedText>

      {erro && (
        <ThemedText themeColor="danger" accessibilityLiveRegion="polite">
          {erro}
        </ThemedText>
      )}
    </Screen>
  );
}
