import { EditarNomeForm } from '@/components/editar-nome-form';
import { useSessaoAtiva, useSession } from '@/session/session-context';

/** Diretor e responsável trocam o próprio nome. */
export default function AlterarNomeScreen() {
  const { pessoa } = useSessaoAtiva();
  const { alterarNome } = useSession();

  return (
    <EditarNomeForm
      nomeAtual={pessoa.nome}
      aoSalvar={alterarNome}
      erroPadrao="Não foi possível alterar o nome."
      ajuda="O CPF não muda. Para corrigir o CPF, procure a secretaria."
    />
  );
}
