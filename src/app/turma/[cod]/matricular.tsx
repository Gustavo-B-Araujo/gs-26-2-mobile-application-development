import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { EmptyState, ListItem, SectionTitle } from '@/components/ui/card';
import { CheckItem } from '@/components/ui/check-item';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { useAsync } from '@/hooks/use-async';
import { mensagemDeErro } from '@/lib/dialogos';
import { apenasDigitos, chaveEnum, formatarCpf, nomeTurma, plural } from '@/lib/format';
import { useSessaoAtiva } from '@/session/session-context';

/** Busca sem acento e sem maiúscula no nome, ou pelos dígitos do CPF. */
function combina(aluno: { nome: string; numDocumento: string }, busca: string) {
  const termo = busca.trim();
  if (!termo) return true;
  const digitos = apenasDigitos(termo);
  if (digitos && digitos === termo.replace(/[.\-\s]/g, '')) {
    return aluno.numDocumento.includes(digitos);
  }
  return chaveEnum(aluno.nome).includes(chaveEnum(termo));
}

/** O diretor da escola matricula alunos da rede na turma (TurmaAluno). */
export default function MatricularScreen() {
  const turmaCod = Number(useLocalSearchParams<{ cod: string }>().cod);
  const { repository } = useSessaoAtiva();
  const carga = useAsync(
    useCallback(
      () => Promise.all([repository.obterTurma(turmaCod), repository.listarAlunos()]),
      [repository, turmaCod],
    ),
  );
  const [busca, setBusca] = useState('');
  const [escolhidos, setEscolhidos] = useState<Set<number>>(new Set());
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [turma, alunos] = carga.data ?? [null, []];
  const naTurma = new Set(turma?.alunos.map((a) => a.alunoCod));
  const disponiveis = alunos.filter((a) => !naTurma.has(a.alunoCod));
  const visiveis = disponiveis.filter((a) => combina(a, busca));

  function alternar(alunoCod: number) {
    setEscolhidos((atual) => {
      const novo = new Set(atual);
      if (novo.has(alunoCod)) novo.delete(alunoCod);
      else novo.add(alunoCod);
      return novo;
    });
  }

  async function salvar() {
    if (escolhidos.size === 0) return;
    setErro(null);
    setSalvando(true);
    try {
      await repository.matricularAlunos(turmaCod, [...escolhidos]);
      router.back();
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível matricular os alunos.'));
      setSalvando(false);
    }
  }

  return (
    <Screen
      carregando={carga.carregando}
      erro={carga.erro}
      aoRecarregar={carga.recarregar}
      rodape={
        <Button
          titulo={
            escolhidos.size ? `Matricular ${plural(escolhidos.size, 'aluno')}` : 'Escolha os alunos'
          }
          onPress={salvar}
          carregando={salvando}
          desabilitado={escolhidos.size === 0}
        />
      }>
      {turma && (
        <>
          <ThemedText type="small" themeColor="textSecondary">
            {nomeTurma(turma)} · {turma.escolaNome} · {plural(turma.totalAlunos, 'aluno')}{' '}
            {turma.totalAlunos === 1 ? 'matriculado' : 'matriculados'}
          </ThemedText>

          {disponiveis.length > 0 && (
            <TextField
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar por nome ou CPF"
              accessibilityLabel="Buscar aluno por nome ou CPF"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          )}

          <SectionTitle>Alunos da rede</SectionTitle>
          {disponiveis.length === 0 && (
            <EmptyState texto="Todos os alunos da rede já estão nesta turma." />
          )}
          {disponiveis.length > 0 && visiveis.length === 0 && (
            <EmptyState texto={`Nenhum aluno encontrado para "${busca.trim()}".`} />
          )}
          {visiveis.map((a) => (
            <CheckItem
              key={a.alunoCod}
              titulo={a.nome}
              subtitulo={`CPF ${formatarCpf(a.numDocumento)}`}
              marcado={escolhidos.has(a.alunoCod)}
              aoAlternar={() => alternar(a.alunoCod)}
            />
          ))}

          <ListItem
            titulo="Cadastrar aluno"
            subtitulo="Aluno novo na rede? Cadastre e volte aqui para matricular"
            href="/aluno/novo"
          />

          {erro && (
            <ThemedText themeColor="danger" accessibilityLiveRegion="polite">
              {erro}
            </ThemedText>
          )}
        </>
      )}
    </Screen>
  );
}
