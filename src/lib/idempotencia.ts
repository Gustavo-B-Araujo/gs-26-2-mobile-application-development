/** Chave única por formulário: tocar de novo no botão não cria o registro duas vezes. */
export function gerarChaveIdempotencia() {
  const aleatorio = () => Math.random().toString(16).slice(2, 10);
  return `${Date.now().toString(16)}-${aleatorio()}-${aleatorio()}`;
}
