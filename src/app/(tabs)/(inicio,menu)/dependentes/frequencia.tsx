import { useEscolhaDependente } from '@/components/escolha-dependente';
import { FrequenciaDoAluno } from '@/components/frequencia-do-aluno';

/** Frequência do guardião: escolhe o dependente no topo. */
export default function FrequenciaDependenteScreen() {
  const { alunoCod, seletor, semAluno } = useEscolhaDependente();
  if (alunoCod === null) return semAluno;
  return (
    <FrequenciaDoAluno
      key={alunoCod}
      alunoCod={alunoCod}
      boletim={{ pathname: '/dependentes/boletim', params: { aluno: alunoCod } }}
      cabecalho={seletor}
    />
  );
}
