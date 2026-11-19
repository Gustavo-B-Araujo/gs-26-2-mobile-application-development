import { useLocalSearchParams } from 'expo-router';

import { FrequenciaDoAluno } from '@/components/frequencia-do-aluno';

/** Frequência de um aluno pelo código: aberta pelo Início, pelo boletim ou pelo próprio aluno. */
export default function FrequenciaScreen() {
  const cod = Number(useLocalSearchParams<{ cod: string }>().cod);
  return (
    <FrequenciaDoAluno
      alunoCod={cod}
      boletim={{ pathname: '/aluno/[cod]', params: { cod } }}
      nomeNoTitulo
    />
  );
}
