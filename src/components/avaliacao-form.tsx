import { useState, type ReactNode } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { CampoData } from '@/components/ui/campo-data';
import { ChipGroup } from '@/components/ui/chip-group';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import type { DadosAvaliacao } from '@/data';
import type { Enumerador } from '@/data/schema';
import { Limites } from '@/data/schema';
import { mensagemDeErro } from '@/lib/dialogos';

type AvaliacaoFormProps = {
  tipos: Enumerador[] | null;
  carregando: boolean;
  erroCarga: string | null;
  inicial?: DadosAvaliacao;
  tituloBotao: string;
  aoSalvar: (dados: DadosAvaliacao) => Promise<void>;
  /** Conteúdo acima do nome, como o seletor de matéria. */
  cabecalho?: ReactNode;
  /** `false` trava o botão (ex.: matéria ainda não escolhida). */
  podeSalvar?: boolean;
};

/** Formulário de avaliação, igual para criar e editar. */
export function AvaliacaoForm({
  tipos,
  carregando,
  erroCarga,
  inicial,
  tituloBotao,
  aoSalvar,
  cabecalho,
  podeSalvar = true,
}: AvaliacaoFormProps) {
  const [nome, setNome] = useState(inicial?.nome ?? '');
  const [codTipoNota, setCodTipoNota] = useState<number | null>(inicial?.codTipoNota ?? null);
  const [data, setData] = useState<string | null>(inicial?.dataAvaliacao ?? null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const valido = podeSalvar && nome.trim() !== '' && codTipoNota !== null;

  async function salvar() {
    if (!valido || codTipoNota === null) return;
    setErro(null);
    setSalvando(true);
    try {
      await aoSalvar({ nome: nome.trim(), codTipoNota, dataAvaliacao: data });
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível salvar.'));
      setSalvando(false);
    }
  }

  return (
    <Screen
      carregando={carregando}
      erro={erroCarga}
      rodape={
        <Button
          titulo={tituloBotao}
          onPress={salvar}
          carregando={salvando}
          desabilitado={!valido}
        />
      }>
      {cabecalho}
      <TextField
        rotulo="Nome"
        value={nome}
        onChangeText={setNome}
        placeholder="Ex.: Prova 3"
        maxLength={Limites.nomeAvaliacaoMax}
        autoFocus={!inicial && !cabecalho}
      />
      <ThemedText type="smallBold" themeColor="textSecondary">
        Tipo
      </ThemedText>
      <ChipGroup
        opcoes={(tipos ?? []).map((t) => ({ valor: t.cod, rotulo: t.enumerador }))}
        selecionado={codTipoNota}
        aoSelecionar={setCodTipoNota}
      />
      <CampoData rotulo="Data (opcional)" valor={data} aoMudar={setData} opcional />
      {erro && (
        <ThemedText themeColor="danger" accessibilityLiveRegion="polite">
          {erro}
        </ThemedText>
      )}
    </Screen>
  );
}
