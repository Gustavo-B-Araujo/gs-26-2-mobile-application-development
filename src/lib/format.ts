export function apenasDigitos(valor: string) {
  return valor.replace(/\D/g, '');
}

export function formatarCpf(valor: string) {
  const d = apenasDigitos(valor).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

/** 'YYYY-MM-DD' -> 'DD/MM/YYYY' */
export function formatarData(iso: string | null) {
  if (!iso) return 'Sem data';
  const [a, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}

/** Data local de hoje em 'YYYY-MM-DD'. */
export function hojeIso() {
  return dateParaIso(new Date());
}

export function somarDias(iso: string, dias: number) {
  const data = isoParaDate(iso);
  data.setDate(data.getDate() + dias);
  return dateParaIso(data);
}

export function formatarNota(nota: number | null) {
  return nota === null ? '—' : nota.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}

export function formatarPercentual(fracao: number | null) {
  return fracao === null ? '—' : `${Math.round(fracao * 100)}%`;
}

/** Converte o texto digitado em nota (aceita vírgula). Vazio vira null. */
export function lerNota(texto: string): number | null | 'invalida' {
  const t = texto.trim().replace(',', '.');
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : 'invalida';
}

/**
 * Chave estável de um `enumerador` do banco, para comparar em regra de tela.
 * 'Falta Justificada' -> 'FALTA_JUSTIFICADA'; 'Mãe' -> 'MAE'.
 * O texto em si já vem pronto para a tela (a DML guarda 'Presente', 'Matemática').
 */
export function chaveEnum(enumerador: string) {
  return enumerador
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');
}

/** `TipoCurso` é a matéria da turma: 'Matemática · 2026/2'. */
export function nomeTurma(t: { tipoCurso: string; ano: number; semestre: number }) {
  return `${t.tipoCurso} · ${t.ano}/${t.semestre}`;
}

/** Matérias distintas de uma lista de turmas, em ordem alfabética. */
export function materiasDasTurmas(turmas: { tipoCurso: string }[]) {
  return [...new Set(turmas.map((t) => t.tipoCurso))].sort((a, b) => a.localeCompare(b));
}

/** `plural(1, 'aluno')` -> '1 aluno'; `plural(3, 'aluno')` -> '3 alunos'. */
export function plural(n: number, singular: string, pluralForma = `${singular}s`) {
  return `${n} ${n === 1 ? singular : pluralForma}`;
}

/** 'YYYY-MM-DD' -> Date à meia-noite local, para o calendário. */
export function isoParaDate(iso: string) {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d);
}

/** Date -> 'YYYY-MM-DD' no fuso local (não em UTC, que pode trocar o dia). */
export function dateParaIso(data: Date) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${data.getFullYear()}-${p(data.getMonth() + 1)}-${p(data.getDate())}`;
}
