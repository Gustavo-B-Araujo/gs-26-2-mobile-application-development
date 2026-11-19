import { BoletimDoAluno } from '@/components/boletim-do-aluno';
import { useEscolhaDependente } from '@/components/escolha-dependente';

/** Boletim do guardião: escolhe o dependente no topo. */
export default function BoletimDependenteScreen() {
  const { alunoCod, seletor, semAluno } = useEscolhaDependente();
  if (alunoCod === null) return semAluno;
  return (
    <BoletimDoAluno
      key={alunoCod}
      alunoCod={alunoCod}
      frequencia={{ pathname: '/dependentes/frequencia', params: { aluno: alunoCod } }}
      cabecalho={seletor}
    />
  );
}
