import { router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Badge, EmptyState, ListItem, SectionTitle } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { useAsync } from '@/hooks/use-async';
import { formatarCpf, nomeTurma, plural } from '@/lib/format';
import { useSessaoAtiva } from '@/session/session-context';

/** Tocar no aluno abre a edição do nome. */
const editar = (a: { alunoCod: number; nome: string }) => ({
  pathname: '/aluno/[cod]/editar' as const,
  params: { cod: a.alunoCod, nome: a.nome },
});

export default function AlunosScreen() {
  const cod = Number(useLocalSearchParams<{ cod: string }>().cod);
  const { repository } = useSessaoAtiva();
  const { data, erro, carregando, recarregar } = useAsync(
    useCallback(
      () => Promise.all([repository.listarAlunosDaEscola(cod), repository.listarAlunos()]),
      [repository, cod],
    ),
  );
  const [daEscola, daRede] = data ?? [[], []];
  /** Aluno sem `TurmaAluno` não pertence a nenhuma escola no DDL: aparece aqui para ser matriculado. */
  const semTurma = daRede.filter((a) => a.totalTurmas === 0);

  return (
    <Screen
      carregando={carregando}
      erro={erro}
      aoRecarregar={recarregar}
      rodape={<Button titulo="Cadastrar aluno" onPress={() => router.push('/aluno/novo')} />}>
      {data && (
        <>
          <SectionTitle>Nesta escola</SectionTitle>
          {daEscola.length === 0 && <EmptyState texto="Nenhum aluno matriculado nesta escola." />}
          {daEscola.map((a) => (
            <ListItem
              key={a.alunoCod}
              titulo={a.nome}
              subtitulo={`CPF ${formatarCpf(a.numDocumento)}\nTurmas aqui: ${a.turmas.map(nomeTurma).join(' · ')}`}
              direita={<Badge texto={plural(a.turmas.length, 'turma')} />}
              href={editar(a)}
            />
          ))}

          {semTurma.length > 0 && (
            <>
              <SectionTitle>Sem turma na rede</SectionTitle>
              {semTurma.map((a) => (
                <ListItem
                  key={a.alunoCod}
                  titulo={a.nome}
                  subtitulo={`CPF ${formatarCpf(a.numDocumento)}`}
                  href={editar(a)}
                />
              ))}
            </>
          )}
        </>
      )}
    </Screen>
  );
}
