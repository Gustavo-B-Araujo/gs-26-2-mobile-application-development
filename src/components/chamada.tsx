import { router } from 'expo-router';
import { useCallback, useState, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { CampoData } from '@/components/ui/campo-data';
import { Card, EmptyState } from '@/components/ui/card';
import { ChipGroup } from '@/components/ui/chip-group';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { Limites } from '@/data/schema';
import { useAsync } from '@/hooks/use-async';
import { avisar, mensagemDeErro } from '@/lib/dialogos';
import { chaveEnum, hojeIso, somarDias } from '@/lib/format';
import { useSessaoAtiva } from '@/session/session-context';

type Edicao = { codTipoPresenca: number | null; observacao: string };

type ChamadaProps = {
  turmaCod: number;
  /** Conteúdo acima da data, como o seletor de matéria. */
  cabecalho?: ReactNode;
};

/**
 * Chamada de uma turma num dia: um tipo de presença por aluno, upsert por `uq_lista_presenca`.
 * Troque `key` junto com `turmaCod` para zerar as edições ao mudar de turma.
 */
export function Chamada({ turmaCod: cod, cabecalho }: ChamadaProps) {
  const { repository } = useSessaoAtiva();
  const [data, setData] = useState(hojeIso);
  const [edicoes, setEdicoes] = useState<Record<number, Edicao>>({});
  const [salvando, setSalvando] = useState(false);

  const carga = useAsync(
    useCallback(
      () => Promise.all([repository.obterChamada(cod, data), repository.listarTiposPresenca()]),
      [repository, cod, data],
    ),
  );
  const [itens, tipos] = carga.data ?? [[], []];
  const codPresente = tipos.find((t) => chaveEnum(t.enumerador) === 'PRESENTE')?.cod;

  const linhas = itens.map((i) => ({
    ...i,
    ...(edicoes[i.turmaAlunoCod] ?? {
      codTipoPresenca: i.codTipoPresenca,
      observacao: i.observacao ?? '',
    }),
  }));
  const pendentes = linhas.filter((l) => l.codTipoPresenca === null).length;

  /** Troca o dia da chamada pelas setas ou pelo calendário. Edições do dia anterior são descartadas. */
  function irPara(nova: string | null) {
    if (!nova || nova === data || nova > hojeIso() || nova < Limites.dataPresencaMin) return;
    setEdicoes({});
    setData(nova);
  }

  function editar(turmaAlunoCod: number, parcial: Partial<Edicao>) {
    setEdicoes((atual) => {
      const linha = linhas.find((l) => l.turmaAlunoCod === turmaAlunoCod)!;
      return {
        ...atual,
        [turmaAlunoCod]: {
          codTipoPresenca: linha.codTipoPresenca,
          observacao: linha.observacao,
          ...parcial,
        },
      };
    });
  }

  function marcarTodosPresentes() {
    if (codPresente === undefined) return;
    const novas: Record<number, Edicao> = {};
    for (const l of linhas) {
      novas[l.turmaAlunoCod] = {
        codTipoPresenca: l.codTipoPresenca ?? codPresente,
        observacao: l.observacao,
      };
    }
    setEdicoes(novas);
  }

  async function salvar() {
    setSalvando(true);
    try {
      await repository.salvarChamada(
        cod,
        data,
        linhas.map((l) => ({
          turmaAlunoCod: l.turmaAlunoCod,
          codTipoPresenca: l.codTipoPresenca!,
          observacao: l.observacao.trim() || null,
        })),
      );
      router.back();
    } catch (e) {
      avisar(mensagemDeErro(e, 'Não foi possível salvar.'));
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
          titulo={pendentes ? `Faltam ${pendentes} aluno(s)` : 'Salvar chamada'}
          onPress={salvar}
          carregando={salvando}
          desabilitado={pendentes > 0 || linhas.length === 0}
        />
      }>
      {cabecalho}
      <Card style={styles.data}>
        <Button titulo="‹" variante="secundario" onPress={() => irPara(somarDias(data, -1))} />
        <CampoData
          valor={data}
          aoMudar={irPara}
          minimo={Limites.dataPresencaMin}
          maximo={hojeIso()}
          detalhe={data === hojeIso() ? 'Hoje' : null}
          estilo={styles.dataCampo}
        />
        <Button
          titulo="›"
          variante="secundario"
          onPress={() => irPara(somarDias(data, 1))}
          desabilitado={data >= hojeIso()}
        />
      </Card>

      {linhas.length > 0 && (
        <Button
          titulo="Marcar todos como presentes"
          variante="secundario"
          onPress={marcarTodosPresentes}
        />
      )}
      {carga.data && linhas.length === 0 && <EmptyState texto="Nenhum aluno matriculado." />}

      {linhas.map((l) => {
        const tipo = tipos.find((t) => t.cod === l.codTipoPresenca)?.enumerador;
        const pedeObservacao =
          (tipo !== undefined && chaveEnum(tipo) === 'FALTA_JUSTIFICADA') || l.observacao !== '';
        return (
          <Card key={l.turmaAlunoCod}>
            <ThemedText>{l.alunoNome}</ThemedText>
            <ChipGroup
              opcoes={tipos.map((t) => ({ valor: t.cod, rotulo: t.enumerador }))}
              selecionado={l.codTipoPresenca}
              aoSelecionar={(codTipoPresenca) => editar(l.turmaAlunoCod, { codTipoPresenca })}
            />
            {pedeObservacao && (
              <TextField
                placeholder="Observação (opcional)"
                value={l.observacao}
                onChangeText={(observacao) => editar(l.turmaAlunoCod, { observacao })}
                maxLength={Limites.observacaoPresencaMax}
              />
            )}
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  data: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  dataCampo: { flex: 1 },
});
