import { useLocalSearchParams } from 'expo-router';

import { Chamada } from '@/components/chamada';

/** Chamada aberta pela tela da turma: a turma já vem da URL. */
export default function ChamadaDaTurmaScreen() {
  const cod = Number(useLocalSearchParams<{ cod: string }>().cod);
  return <Chamada turmaCod={cod} />;
}
