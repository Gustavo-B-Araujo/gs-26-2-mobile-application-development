import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { ChipGroup } from '@/components/ui/chip-group';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Limites } from '@/data/schema';
import { useAsync } from '@/hooks/use-async';
import { mensagemDeErro } from '@/lib/dialogos';
import { apenasDigitos } from '@/lib/format';
import { gerarChaveIdempotencia } from '@/lib/idempotencia';
import { useSessaoAtiva } from '@/session/session-context';

const anoAtual = new Date().getFullYear();
const semestreAtual: 1 | 2 = new Date().getMonth() < 6 ? 1 : 2;

function validarAno(texto: string): string | null {
  const ano = Number(texto);
  if (!/^\d{4}$/.test(texto)) return 'Informe o ano com 4 dígitos.';
  if (ano < Limites.anoReferenciaMin) return `A partir de ${Limites.anoReferenciaMin}.`;
  if (ano > anoAtual + 1) return `No máximo ${anoAtual + 1}.`;
  return null;
}

/** O diretor cria uma turma na escola. O professor é obrigatório (Turma.cod_professor NOT NULL). */
export default function NovaTurmaScreen() {
  const escolaCod = Number(useLocalSearchParams<{ cod: string }>().cod);
  const { repository } = useSessaoAtiva();
  const carga = useAsync(
    useCallback(
      () => Promise.all([repository.listarTiposCurso(), repository.listarProfessores()]),
      [repository],
    ),
  );
  const [tiposCurso, professores] = carga.data ?? [[], []];
  const [chaveIdempotencia] = useState(gerarChaveIdempotencia);
  const [codTipoCurso, setCodTipoCurso] = useState<number | null>(null);
  const [semestre, setSemestre] = useState<1 | 2>(semestreAtual);
  const [ano, setAno] = useState(String(anoAtual));
  const [codProfessor, setCodProfessor] = useState<number | null>(null);
  const [tentou, setTentou] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const erros = {
    curso: codTipoCurso === null ? 'Escolha a matéria.' : null,
    ano: validarAno(ano),
    professor: codProfessor === null ? 'Escolha o professor.' : null,
  };
  const mostrar = (campo: keyof typeof erros) => (tentou ? erros[campo] : null);
  const materiaEscolhida = tiposCurso.find((t) => t.cod === codTipoCurso)?.enumerador;
  const professorEscolhido = professores.find((p) => p.professorCod === codProfessor);
  /** Quem já dá aula da matéria escolhida aparece primeiro. */
  const professoresOrdenados = [...professores].sort(
    (a, b) =>
      Number(materiaEscolhida !== undefined && b.materias.includes(materiaEscolhida)) -
      Number(materiaEscolhida !== undefined && a.materias.includes(materiaEscolhida)),
  );

  async function salvar() {
    setTentou(true);
    if (codTipoCurso === null || codProfessor === null || erros.ano) return;
    setErro(null);
    setSalvando(true);
    try {
      await repository.criarTurma(
        escolaCod,
        { codTipoCurso, codProfessor, semestre, ano: Number(ano) },
        chaveIdempotencia,
      );
      router.back();
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível criar a turma.'));
      setSalvando(false);
    }
  }

  return (
    <Screen
      carregando={carga.carregando}
      erro={carga.erro}
      rodape={<Button titulo="Criar turma" onPress={salvar} carregando={salvando} />}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        Matéria
      </ThemedText>
      <ChipGroup
        opcoes={tiposCurso.map((t) => ({ valor: t.cod, rotulo: t.enumerador }))}
        selecionado={codTipoCurso}
        aoSelecionar={setCodTipoCurso}
      />
      {mostrar('curso') && (
        <ThemedText type="small" themeColor="danger">
          {mostrar('curso')}
        </ThemedText>
      )}
      <ThemedText type="small" themeColor="textSecondary">
        Matéria nova? Cadastre no Menu, em Cadastros da rede › Cadastrar curso.
      </ThemedText>

      <ThemedText type="smallBold" themeColor="textSecondary">
        Semestre
      </ThemedText>
      <ChipGroup
        opcoes={[
          { valor: 1 as const, rotulo: '1º semestre' },
          { valor: 2 as const, rotulo: '2º semestre' },
        ]}
        selecionado={semestre}
        aoSelecionar={setSemestre}
      />

      <TextField
        rotulo="Ano"
        value={ano}
        onChangeText={(t) => setAno(apenasDigitos(t))}
        keyboardType="number-pad"
        maxLength={4}
        erro={ano.length === 4 || tentou ? erros.ano : null}
      />

      <ThemedText type="smallBold" themeColor="textSecondary">
        Professor
      </ThemedText>
      <ChipGroup
        opcoes={professoresOrdenados.map((p) => ({
          valor: p.professorCod,
          rotulo: p.materias.length ? `${p.nome} (${p.materias.join(', ')})` : p.nome,
        }))}
        selecionado={codProfessor}
        aoSelecionar={setCodProfessor}
      />
      {professorEscolhido &&
        materiaEscolhida &&
        !professorEscolhido.materias.includes(materiaEscolhida) && (
          <ThemedText type="small" themeColor="warning">
            {professorEscolhido.nome} ainda não dá aula de {materiaEscolhida}.
          </ThemedText>
        )}
      {mostrar('professor') && (
        <ThemedText type="small" themeColor="danger">
          {mostrar('professor')}
        </ThemedText>
      )}
      <ThemedText type="small" themeColor="textSecondary">
        Professor novo na rede? Cadastre no Menu, em Cadastros da rede › Cadastrar professor.
      </ThemedText>

      {erro && (
        <ThemedText themeColor="danger" accessibilityLiveRegion="polite">
          {erro}
        </ThemedText>
      )}
    </Screen>
  );
}
