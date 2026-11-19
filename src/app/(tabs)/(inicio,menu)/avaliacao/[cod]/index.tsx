import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card, EmptyState } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { Limites } from '@/data/schema';
import { useAsync } from '@/hooks/use-async';
import { avisar, confirmar, mensagemDeErro } from '@/lib/dialogos';
import { formatarData, formatarNota, lerNota, nomeTurma } from '@/lib/format';
import { useSessaoAtiva } from '@/session/session-context';

function validarNota(texto: string): string | null {
  const n = lerNota(texto);
  if (n === 'invalida') return 'Número inválido.';
  if (n !== null && (n < Limites.notaMin || n > Limites.notaMax)) {
    return `De ${Limites.notaMin} a ${Limites.notaMax}.`;
  }
  if (n !== null && !/^\d+([.,]\d{1,2})?$/.test(texto.trim())) return 'Até 2 casas decimais.';
  return null;
}

export default function AvaliacaoScreen() {
  const cod = Number(useLocalSearchParams<{ cod: string }>().cod);
  const { papeis, repository } = useSessaoAtiva();
  const {
    data: av,
    erro,
    carregando,
    recarregar,
  } = useAsync(useCallback(() => repository.obterAvaliacao(cod), [repository, cod]));
  const [textos, setTextos] = useState<Record<number, string>>({});
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  async function excluir() {
    if (!av) return;
    const ok = await confirmar(
      'Excluir avaliação?',
      `"${av.nome}" e as ${av.notasLancadas} nota(s) lançadas serão apagadas. Não dá para desfazer.`,
      'Excluir',
    );
    if (!ok) return;
    setExcluindo(true);
    try {
      await repository.excluirAvaliacao(cod);
      router.back();
    } catch (e) {
      avisar(mensagemDeErro(e, 'Não foi possível excluir.'));
      setExcluindo(false);
    }
  }

  const podeEditar = av !== null && av.turma.professorCod === papeis.professorCod;
  const texto = (turmaAlunoCod: number, nota: number | null) =>
    textos[turmaAlunoCod] ?? (nota === null ? '' : String(nota).replace('.', ','));
  const algumErro =
    av?.notas.some((n) => validarNota(texto(n.turmaAlunoCod, n.nota)) !== null) ?? false;
  const alterou = Object.keys(textos).length > 0;

  async function salvar() {
    if (!av) return;
    setErroSalvar(null);
    setSalvando(true);
    try {
      await repository.salvarNotas(
        cod,
        av.notas.map((n) => ({
          turmaAlunoCod: n.turmaAlunoCod,
          nota: lerNota(texto(n.turmaAlunoCod, n.nota)) as number | null,
        })),
      );
      router.back();
    } catch (e) {
      setErroSalvar(mensagemDeErro(e, 'Não foi possível salvar.'));
      setSalvando(false);
    }
  }

  return (
    <Screen
      carregando={carregando}
      erro={erro}
      aoRecarregar={alterou ? undefined : recarregar}
      rodape={
        podeEditar ? (
          <Button
            titulo="Salvar notas"
            onPress={salvar}
            carregando={salvando}
            desabilitado={algumErro || !alterou}
          />
        ) : undefined
      }>
      {av && (
        <>
          <Stack.Screen options={{ title: av.nome }} />
          <Card>
            <ThemedText type="smallBold">{av.nome}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {av.tipoNota} · {formatarData(av.dataAvaliacao)}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {nomeTurma(av.turma)} · Prof. {av.turma.professorNome}
            </ThemedText>
            {podeEditar && (
              <ThemedText type="small" themeColor="textSecondary">
                Notas de {Limites.notaMin} a {Limites.notaMax}. Deixe vazio para não lançar.
              </ThemedText>
            )}
          </Card>

          {podeEditar && (
            <View style={styles.acoes}>
              <View style={styles.acao}>
                <Button
                  titulo="Editar dados"
                  variante="secundario"
                  onPress={() =>
                    router.push({ pathname: '/avaliacao/[cod]/editar', params: { cod } })
                  }
                />
              </View>
              <View style={styles.acao}>
                <Button
                  titulo="Excluir"
                  variante="perigo"
                  onPress={excluir}
                  carregando={excluindo}
                />
              </View>
            </View>
          )}

          {av.notas.length === 0 && <EmptyState texto="Nenhum aluno matriculado." />}
          {av.notas.map((n) => {
            const valor = texto(n.turmaAlunoCod, n.nota);
            return (
              <Card key={n.turmaAlunoCod} style={styles.linha}>
                <ThemedText style={styles.nome}>{n.alunoNome}</ThemedText>
                {podeEditar ? (
                  <View style={styles.campo}>
                    <TextField
                      value={valor}
                      onChangeText={(t) => setTextos((a) => ({ ...a, [n.turmaAlunoCod]: t }))}
                      keyboardType="decimal-pad"
                      placeholder="—"
                      maxLength={6}
                      style={styles.input}
                      erro={validarNota(valor)}
                      accessibilityLabel={`Nota de ${n.alunoNome}`}
                    />
                  </View>
                ) : (
                  <ThemedText type="smallBold">{formatarNota(n.nota)}</ThemedText>
                )}
              </Card>
            );
          })}
          {erroSalvar && <ThemedText themeColor="danger">{erroSalvar}</ThemedText>}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  acoes: { flexDirection: 'row', gap: Spacing.two },
  acao: { flex: 1 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  nome: { flex: 1 },
  campo: { width: 110 },
  input: { textAlign: 'right' },
});
