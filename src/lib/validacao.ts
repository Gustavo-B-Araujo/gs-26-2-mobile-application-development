import { apenasDigitos } from './format';

export const SENHA_MIN = 8;

/** Cada função devolve a mensagem de erro, ou null quando o valor é válido. */

export function validarNome(nome: string): string | null {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length < 2) return 'Informe nome e sobrenome.';
  if (nome.trim().length > 150) return 'Máximo de 150 caracteres.';
  return null;
}

/** Confere os 2 dígitos verificadores do CPF. */
export function validarCpf(cpf: string): string | null {
  const d = apenasDigitos(cpf);
  if (d.length !== 11) return 'O CPF tem 11 dígitos.';
  if (/^(\d)\1{10}$/.test(d)) return 'CPF inválido.';
  const digito = (tamanho: number) => {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(d[i]) * (tamanho + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  if (digito(9) !== Number(d[9]) || digito(10) !== Number(d[10])) return 'CPF inválido.';
  return null;
}

export function validarSenha(senha: string): string | null {
  if (senha.length < SENHA_MIN) return `Mínimo de ${SENHA_MIN} caracteres.`;
  if (!/[A-Za-z]/.test(senha) || !/\d/.test(senha)) return 'Use letras e números.';
  return null;
}

export function validarConfirmacao(senha: string, confirmacao: string): string | null {
  return senha === confirmacao ? null : 'As senhas não conferem.';
}
