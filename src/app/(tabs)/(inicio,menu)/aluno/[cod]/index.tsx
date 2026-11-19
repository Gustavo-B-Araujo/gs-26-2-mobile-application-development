import { useLocalSearchParams } from 'expo-router';

import { BoletimDoAluno } from '@/components/boletim-do-aluno';

/** Boletim de um aluno pelo código: aberto pelo Início, pela turma ou pelo próprio aluno. */
export default function BoletimScreen() {
  const cod = Number(useLocalSearchParams<{ cod: string }>().cod);
  return (
    <BoletimDoAluno
      alunoCod={cod}
      frequencia={{ pathname: '/aluno/[cod]/frequencia', params: { cod } }}
      nomeNoTitulo
    />
  );
}
