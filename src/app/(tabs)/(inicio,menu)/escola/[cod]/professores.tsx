import { router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Badge, EmptyState, ListItem, SectionTitle } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { useAsync } from '@/hooks/use-async';
import { nomeTurma, plural } from '@/lib/format';
import { useSessaoAtiva } from '@/session/session-context';

/** Tocar no professor abre a edição do nome. */
const editar = (p: { professorCod: number; nome: string }) => ({
  pathname: '/professor/[cod]/editar' as const,
  params: { cod: p.professorCod, nome: p.nome },
});

export default function ProfessoresScreen() {
  const cod = Number(useLocalSearchParams<{ cod: string }>().cod);
  const { repository } = useSessaoAtiva();
  const { data, erro, carregando, recarregar } = useAsync(
    useCallback(
      () =>
        Promise.all([repository.listarProfessoresDaEscola(cod), repository.listarProfessores()]),
      [repository, cod],
    ),
  );
  const [daEscola, daRede] = data ?? [[], []];
  /** Professor sem turma não pertence a nenhuma escola no DDL: aparece aqui para ganhar uma. */
  const disponiveis = daRede.filter((p) => p.materias.length === 0);

  return (
    <Screen
      carregando={carregando}
      erro={erro}
      aoRecarregar={recarregar}
      rodape={
        <Button titulo="Cadastrar professor" onPress={() => router.push('/professor/novo')} />
      }>
      {data && (
        <>
          <SectionTitle>Nesta escola</SectionTitle>
          {daEscola.length === 0 && <EmptyState texto="Nenhum professor com turma nesta escola." />}
          {daEscola.map((p) => (
            <ListItem
              key={p.professorCod}
              titulo={p.nome}
              subtitulo={`Matérias: ${p.materias.join(', ')}\nTurmas aqui: ${p.turmas.map(nomeTurma).join(' · ')}`}
              direita={<Badge texto={plural(p.turmas.length, 'turma')} />}
              href={editar(p)}
            />
          ))}

          {disponiveis.length > 0 && (
            <>
              <SectionTitle>Disponíveis na rede</SectionTitle>
              {disponiveis.map((p) => (
                <ListItem key={p.professorCod} titulo={p.nome} href={editar(p)} />
              ))}
            </>
          )}
        </>
      )}
    </Screen>
  );
}
