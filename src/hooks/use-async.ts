import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

type Estado<T> = { data: T | null; erro: string | null; carregando: boolean };

/**
 * Carrega dados quando a tela ganha foco (e de novo ao voltar para ela),
 * para a tela mostrar o que outra tela acabou de salvar.
 *
 * `carregar` precisa ser estável: passe `useCallback(() => ..., [deps])`.
 * Uma função nova a cada render recarrega em loop.
 */
export function useAsync<T>(carregar: () => Promise<T>) {
  const [estado, setEstado] = useState<Estado<T>>({ data: null, erro: null, carregando: true });

  const recarregar = useCallback(() => {
    let ativo = true;
    setEstado((e) => ({ ...e, carregando: true, erro: null }));
    carregar()
      .then((data) => ativo && setEstado({ data, erro: null, carregando: false }))
      .catch(
        (e: unknown) =>
          ativo &&
          setEstado({
            data: null,
            erro: e instanceof Error ? e.message : String(e),
            carregando: false,
          }),
      );
    return () => {
      ativo = false;
    };
  }, [carregar]);

  useFocusEffect(recarregar);

  return { ...estado, recarregar };
}
