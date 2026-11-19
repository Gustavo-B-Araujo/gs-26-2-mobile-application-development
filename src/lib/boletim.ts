import type { BoletimAluno, BoletimTurma } from '@/data';

import { chaveEnum } from './format';

/** Abaixo destes valores a turma pede atenção. Referência de leitura, não regra de aprovação. */
export const MEDIA_ATENCAO = 60;
export const FREQUENCIA_ATENCAO = 0.75;

/** Referências de cor só para leitura rápida; não são regra de aprovação. */
export const corNota = (n: number | null) =>
  n === null ? 'textSecondary' : n >= 70 ? 'success' : n >= 50 ? 'warning' : 'danger';

export const corFrequencia = (f: number | null) =>
  f === null ? 'textSecondary' : f >= FREQUENCIA_ATENCAO ? 'success' : 'danger';

export const corPresenca = (tipo: string) =>
  chaveEnum(tipo) === 'PRESENTE' ? 'success' : chaveEnum(tipo) === 'FALTA' ? 'danger' : 'warning';

export function precisaAtencao(t: BoletimTurma) {
  return (
    (t.media !== null && t.media < MEDIA_ATENCAO) ||
    (t.frequencia !== null && t.frequencia < FREQUENCIA_ATENCAO)
  );
}

/**
 * Números do boletim inteiro: média das médias das turmas com nota,
 * frequência sobre todas as chamadas (só 'Presente' conta) e as turmas que pedem atenção.
 */
export function resumirBoletim(b: BoletimAluno) {
  const medias = b.turmas.map((t) => t.media).filter((m): m is number => m !== null);
  const presencas = b.turmas.flatMap((t) => t.presencas);
  const presentes = presencas.filter((p) => chaveEnum(p.tipo) === 'PRESENTE').length;
  return {
    media: medias.length ? medias.reduce((s, m) => s + m, 0) / medias.length : null,
    frequencia: presencas.length ? presentes / presencas.length : null,
    emAtencao: b.turmas.filter(precisaAtencao).map((t) => t.turma.tipoCurso),
  };
}

/** Quantas presenças, faltas e faltas justificadas, pelo texto normalizado do enumerador. */
export function contarPresencas(presencas: { tipo: string }[]) {
  const conta = (chave: string) => presencas.filter((p) => chaveEnum(p.tipo) === chave).length;
  return {
    presentes: conta('PRESENTE'),
    faltas: conta('FALTA'),
    justificadas: conta('FALTA_JUSTIFICADA'),
    total: presencas.length,
  };
}

export type Novidade = {
  chave: string;
  /** 'YYYY-MM-DD'. */
  data: string;
  tipo: 'nota' | 'presenca';
  /** Nota lançada, ou null numa novidade de presença. */
  nota: number | null;
  /** Nome da avaliação, ou o tipo de presença ('Falta', 'Falta Justificada'). */
  titulo: string;
  materia: string;
  observacao: string | null;
};

/**
 * Linha do tempo do aluno: notas lançadas e faltas (com ou sem justificativa), da mais recente
 * para a mais antiga. Presença comum não entra: o que importa no Início é o que pede ação.
 * Avaliação sem data fica de fora, porque não tem lugar na linha do tempo.
 */
export function novidades(b: BoletimAluno, quantidade: number): Novidade[] {
  const eventos = b.turmas.flatMap((t) => [
    ...t.notas
      .filter((n) => n.nota !== null && n.dataAvaliacao !== null)
      .map((n): Novidade => ({
        chave: `nota-${n.avaliacaoCod}`,
        data: n.dataAvaliacao!.slice(0, 10),
        tipo: 'nota',
        nota: n.nota,
        titulo: n.avaliacaoNome,
        materia: t.turma.tipoCurso,
        observacao: null,
      })),
    ...t.presencas
      .filter((p) => chaveEnum(p.tipo) !== 'PRESENTE')
      .map((p): Novidade => ({
        chave: `presenca-${t.turma.cod}-${p.data}`,
        data: p.data.slice(0, 10),
        tipo: 'presenca',
        nota: null,
        titulo: p.tipo,
        materia: t.turma.tipoCurso,
        observacao: p.observacao,
      })),
  ]);
  return eventos.sort((a, b) => b.data.localeCompare(a.data)).slice(0, quantidade);
}
