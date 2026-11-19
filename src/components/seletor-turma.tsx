import { ThemedText } from '@/components/themed-text';
import { ChipGroup } from '@/components/ui/chip-group';
import type { TurmaResumo } from '@/data';
import { nomeTurma } from '@/lib/format';

type SeletorTurmaProps = {
  turmas: TurmaResumo[];
  selecionada: number | null;
  aoSelecionar: (turmaCod: number) => void;
};

/**
 * Escolha da matéria (turma) em que a operação vai acontecer.
 * Se a mesma matéria e período aparecem em 2 escolas, o nome da escola entra no rótulo.
 */
export function SeletorTurma({ turmas, selecionada, aoSelecionar }: SeletorTurmaProps) {
  const repetidas = (t: TurmaResumo) =>
    turmas.filter((o) => nomeTurma(o) === nomeTurma(t)).length > 1;
  return (
    <>
      <ThemedText type="smallBold" themeColor="textSecondary">
        Matéria
      </ThemedText>
      <ChipGroup
        opcoes={turmas.map((t) => ({
          valor: t.cod,
          rotulo: repetidas(t) ? `${nomeTurma(t)} · ${t.escolaNome}` : nomeTurma(t),
        }))}
        selecionado={selecionada}
        aoSelecionar={aoSelecionar}
      />
    </>
  );
}
