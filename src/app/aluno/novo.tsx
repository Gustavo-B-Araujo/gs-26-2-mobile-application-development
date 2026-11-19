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
 * Qualquer diretor cadastra o aluno na rede. A senha é opcional: sem ela, o aluno
 * não entra no app e o guardião acompanha o boletim. A matrícula é feita na turma.
 */
export default function NovoAlunoScreen() {
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
    senha: senha ? validarSenha(senha) : null,
  };
  const valido = Object.values(erros).every((e) => e === null);
  const mostrar = (campo: keyof typeof erros) => (tentou ? erros[campo] : null);

  async function salvar() {
    setTentou(true);
    if (!valido) return;
    setErro(null);
    setSalvando(true);
    try {
      await repository.cadastrarAluno(
        { nome: nome.trim(), numDocumento: apenasDigitos(cpf), senha: senha || null },
        chaveIdempotencia,
      );
      router.back();
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível cadastrar o aluno.'));
      setSalvando(false);
    }
  }

  return (
    <Screen rodape={<Button titulo="Cadastrar aluno" onPress={salvar} carregando={salvando} />}>
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
        rotulo={`Senha inicial (opcional; mínimo ${SENHA_MIN} caracteres, letras e números)`}
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        autoComplete="off"
        erro={mostrar('senha')}
      />

      <ThemedText type="small" themeColor="textSecondary">
        Com senha, o aluno entra no app e vê o próprio boletim. Sem senha, só o responsável
        acompanha. Depois do cadastro, matricule o aluno na turma em Turma › Matricular alunos.
      </ThemedText>

      {erro && (
        <ThemedText themeColor="danger" accessibilityLiveRegion="polite">
          {erro}
        </ThemedText>
      )}
    </Screen>
  );
}
