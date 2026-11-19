import { router } from 'expo-router';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { mensagemDeErro } from '@/lib/dialogos';
import { validarNome } from '@/lib/validacao';

type Props = {
  nomeAtual: string;
  /** Grava o nome já sem espaços nas pontas. */
  aoSalvar: (nome: string) => Promise<void>;
  erroPadrao: string;
  ajuda?: string;
};

/** Formulário de um campo só, usado para trocar `Pessoa.nome`. Ao salvar, fecha o modal. */
export function EditarNomeForm({ nomeAtual, aoSalvar, erroPadrao, ajuda }: Props) {
  const [nome, setNome] = useState(nomeAtual);
  const [tentou, setTentou] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const erroNome = validarNome(nome);

  async function salvar() {
    setTentou(true);
    if (erroNome) return;
    if (nome.trim() === nomeAtual) {
      router.back();
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      await aoSalvar(nome.trim());
      router.back();
    } catch (e) {
      setErro(mensagemDeErro(e, erroPadrao));
      setSalvando(false);
    }
  }

  return (
    <Screen rodape={<Button titulo="Salvar nome" onPress={salvar} carregando={salvando} />}>
      <TextField
        rotulo="Nome completo"
        value={nome}
        onChangeText={setNome}
        autoCapitalize="words"
        maxLength={150}
        autoFocus
        onSubmitEditing={salvar}
        erro={tentou ? erroNome : null}
      />

      {ajuda && (
        <ThemedText type="small" themeColor="textSecondary">
          {ajuda}
        </ThemedText>
      )}

      {erro && (
        <ThemedText themeColor="danger" accessibilityLiveRegion="polite">
          {erro}
        </ThemedText>
      )}
    </Screen>
  );
}
