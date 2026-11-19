import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import type { AnaliseBoletim, EscolaRepository } from '@/data';
import { useTheme } from '@/hooks/use-theme';
import { mensagemDeErro } from '@/lib/dialogos';

type AnaliseIaCardProps = { alunoCod: number; repository: EscolaRepository };

/**
 * Resumo do boletim com recomendações, gerado por IA.
 * Só gera quando a pessoa toca no botão: cada análise tem custo.
 */
export function AnaliseIaCard({ alunoCod, repository }: AnaliseIaCardProps) {
  const theme = useTheme();
  const [analise, setAnalise] = useState<AnaliseBoletim | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [gerando, setGerando] = useState(false);

  async function gerar() {
    setErro(null);
    setGerando(true);
    try {
      setAnalise(await repository.analisarBoletim(alunoCod));
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível gerar a análise.'));
    } finally {
      setGerando(false);
    }
  }

  return (
    <Card style={{ borderColor: theme.primary }}>
      <ThemedText type="smallBold" themeColor="primary">
        ✦ Análise com IA
      </ThemedText>
      {!analise && !gerando && (
        <ThemedText type="small" themeColor="textSecondary">
          Um resumo do desempenho com sugestões para o responsável acompanhar em casa.
        </ThemedText>
      )}
      {gerando && (
        <View style={styles.gerando}>
          <ActivityIndicator color={theme.primary} />
          <ThemedText type="small" themeColor="textSecondary">
            Gerando análise…
          </ThemedText>
        </View>
      )}
      {analise && !gerando && <ThemedText type="small">{analise.texto}</ThemedText>}
      {erro && (
        <ThemedText type="small" themeColor="danger" accessibilityLiveRegion="polite">
          {erro}
        </ThemedText>
      )}
      <Button
        titulo={analise ? 'Gerar de novo' : 'Gerar análise'}
        variante="secundario"
        onPress={gerar}
        desabilitado={gerando}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  gerando: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
