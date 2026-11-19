import { useLocalSearchParams } from 'expo-router';

import { EditarNomeForm } from '@/components/editar-nome-form';
import { useSessaoAtiva } from '@/session/session-context';

/** Só diretor. O nome atual vem da lista (`/escola/[cod]/alunos`) no parâmetro `nome`. */
export default function EditarAlunoScreen() {
  const params = useLocalSearchParams<{ cod: string; nome?: string }>();
  const { repository } = useSessaoAtiva();

  return (
    <EditarNomeForm
      nomeAtual={params.nome ?? ''}
      aoSalvar={(nome) => repository.renomearAluno(Number(params.cod), nome)}
      erroPadrao="Não foi possível alterar o nome do aluno."
    />
  );
}
