import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Limites } from '@/data/schema';
import { useAsync } from '@/hooks/use-async';
import { mensagemDeErro } from '@/lib/dialogos';
import { useSessaoAtiva } from '@/session/session-context';

/** O diretor cadastra um curso (matéria) em TipoCurso. O curso vale para toda a rede. */
export default function NovoCursoScreen() {
  const { repository } = useSessaoAtiva();
  const cursos = useAsync(useCallback(() => repository.listarTiposCurso(), [repository]));
  const [nome, setNome] = useState('');
  const [tentou, setTentou] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const erroNome = nome.trim() ? null : 'Informe o nome do curso.';

  async function salvar() {
    setTentou(true);
    if (erroNome) return;
    setErro(null);
    setSalvando(true);
    try {
      await repository.inserirTipoCurso(nome.trim());
      router.back();
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível cadastrar o curso.'));
      setSalvando(false);
    }
  }

  return (
    <Screen
      carregando={cursos.carregando}
      erro={cursos.erro}
      rodape={<Button titulo="Cadastrar curso" onPress={salvar} carregando={salvando} />}>
      <TextField
        rotulo="Nome do curso"
        value={nome}
        onChangeText={setNome}
        placeholder="Ex.: Geografia"
        maxLength={Limites.tipoCursoMax}
        autoFocus
        onSubmitEditing={salvar}
        erro={tentou ? erroNome : null}
      />

      {cursos.data && cursos.data.length > 0 && (
        <Card>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Cursos já cadastrados
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {cursos.data.map((c) => c.enumerador).join(' · ')}
          </ThemedText>
        </Card>
      )}

      {erro && (
        <ThemedText themeColor="danger" accessibilityLiveRegion="polite">
          {erro}
        </ThemedText>
      )}
    </Screen>
  );
}
