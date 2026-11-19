import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Card, EmptyState, SectionTitle } from '@/components/ui/card';
import { Spacing, type ThemeColor } from '@/constants/theme';
import type { BoletimAluno } from '@/data';
import { useTheme } from '@/hooks/use-theme';
import {
    corFrequencia,
    corNota,
    corPresenca,
    novidades,
    resumirBoletim,
    type Novidade,
} from '@/lib/boletim';
import { formatarData, formatarNota, formatarPercentual } from '@/lib/format';

const TAMANHO_ANEL = 104;
const ESPESSURA = 10;
const NOVIDADES = 6;

const arredondar = (n: number | null) => (n === null ? null : Math.round(n * 10) / 10);

type AnelProps = {
  /** De 0 a 1. `null` desenha só o trilho. */
  fracao: number | null;
  valor: string;
  rotulo: string;
  cor: ThemeColor;
  href: Href;
};

/** Anel de progresso com o número no centro. Tocar abre o detalhe (Boletim ou Frequência). */
function Anel({ fracao, valor, rotulo, cor, href }: AnelProps) {
  const theme = useTheme();
  const raio = (TAMANHO_ANEL - ESPESSURA) / 2;
  const volta = 2 * Math.PI * raio;
  const preenchido = Math.min(Math.max(fracao ?? 0, 0), 1) * volta;
  return (
    // Na web o Link vira <a> e não estica: a View dá a metade do cartão a cada anel.
    <View style={styles.metade}>
      <Link href={href} asChild>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`${rotulo} ${valor}. Ver detalhes`}
          style={({ pressed }) => pressed && styles.pressionado}>
          {/* Alinhamento numa View: na web o Link descarta o estilo em função do Pressable. */}
          <View style={styles.anelBotao}>
            <View style={styles.anel}>
              {/* Gira o desenho todo para o progresso começar no topo (o `rotation` do Circle quebra na web). */}
              <Svg width={TAMANHO_ANEL} height={TAMANHO_ANEL} style={styles.girado}>
                <Circle
                  cx={TAMANHO_ANEL / 2}
                  cy={TAMANHO_ANEL / 2}
                  r={raio}
                  stroke={theme.backgroundSelected}
                  strokeWidth={ESPESSURA}
                  fill="none"
                />
                {fracao !== null && (
                  <Circle
                    cx={TAMANHO_ANEL / 2}
                    cy={TAMANHO_ANEL / 2}
                    r={raio}
                    stroke={theme[cor]}
                    strokeWidth={ESPESSURA}
                    strokeLinecap="round"
                    strokeDasharray={`${preenchido} ${volta}`}
                    fill="none"
                  />
                )}
              </Svg>
              <View style={styles.anelCentro}>
                <ThemedText type="smallBold" themeColor={cor} style={styles.anelValor}>
                  {valor}
                </ThemedText>
              </View>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {rotulo} ›
            </ThemedText>
          </View>
        </Pressable>
      </Link>
    </View>
  );
}

/** Iniciais do nome: 'Bart Simpson' -> 'BS'. */
function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  return `${partes[0]?.[0] ?? ''}${partes.length > 1 ? partes[partes.length - 1][0] : ''}`;
}

/** Cartão do aluno: quem é, média e frequência em anéis, e as matérias que pedem atenção. */
function CartaoAluno({ boletim, detalhe }: { boletim: BoletimAluno; detalhe: string }) {
  const theme = useTheme();
  const { media, frequencia, emAtencao } = resumirBoletim(boletim);
  const cod = boletim.alunoCod;
  return (
    <Card>
      <View style={styles.cabecalho}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <ThemedText type="smallBold" style={{ color: theme.onPrimary }}>
            {iniciais(boletim.nome)}
          </ThemedText>
        </View>
        <View style={styles.flex}>
          <ThemedText type="smallBold">{boletim.nome}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {detalhe}
          </ThemedText>
        </View>
      </View>

      <View style={styles.aneis}>
        <Anel
          fracao={media === null ? null : media / 100}
          valor={formatarNota(arredondar(media))}
          rotulo="Média"
          cor={corNota(media)}
          href={{ pathname: '/aluno/[cod]', params: { cod } }}
        />
        <Anel
          fracao={frequencia}
          valor={formatarPercentual(frequencia)}
          rotulo="Frequência"
          cor={corFrequencia(frequencia)}
          href={{ pathname: '/aluno/[cod]/frequencia', params: { cod } }}
        />
      </View>

      <View
        style={[
          styles.alerta,
          { backgroundColor: emAtencao.length ? theme.backgroundSelected : 'transparent' },
        ]}>
        <ThemedText type="small" themeColor={emAtencao.length ? 'danger' : 'success'}>
          {emAtencao.length
            ? `⚠ Atenção em ${emAtencao.join(', ')}`
            : boletim.turmas.length
              ? '✓ Tudo em dia'
              : 'Sem matrícula em turmas'}
        </ThemedText>
      </View>
    </Card>
  );
}

function ItemNovidade({ item, ultimo }: { item: Novidade; ultimo: boolean }) {
  const theme = useTheme();
  const cor: ThemeColor = item.tipo === 'nota' ? corNota(item.nota) : corPresenca(item.titulo);
  const titulo = item.tipo === 'nota' ? `Nota ${formatarNota(item.nota)}` : item.titulo;
  const detalhe =
    item.tipo === 'nota'
      ? `${item.titulo} · ${item.materia}`
      : [item.materia, item.observacao].filter(Boolean).join(' · ');
  return (
    <View style={styles.item}>
      <View style={styles.trilho}>
        <View style={[styles.ponto, { backgroundColor: theme[cor] }]} />
        {!ultimo && <View style={[styles.linhaTempo, { backgroundColor: theme.border }]} />}
      </View>
      <View style={[styles.flex, !ultimo && styles.itemTexto]}>
        <View style={styles.itemTopo}>
          <ThemedText type="smallBold" themeColor={cor}>
            {titulo}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {formatarData(item.data)}
          </ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {detalhe}
        </ThemedText>
      </View>
    </View>
  );
}

/**
 * Início de quem acompanha um aluno (o próprio aluno ou o guardião): o cartão com média e
 * frequência, e as novidades. O detalhe completo fica no Boletim e na Frequência do Menu.
 */
export function PainelDoAluno({ boletim, detalhe }: { boletim: BoletimAluno; detalhe: string }) {
  const lista = novidades(boletim, NOVIDADES);
  return (
    <>
      <CartaoAluno boletim={boletim} detalhe={detalhe} />

      <SectionTitle>Novidades</SectionTitle>
      {lista.length === 0 ? (
        <EmptyState texto="Nenhuma nota ou falta registrada ainda." />
      ) : (
        <Card>
          {lista.map((n, i) => (
            <ItemNovidade key={n.chave} item={n} ultimo={i === lista.length - 1} />
          ))}
        </Card>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aneis: { flexDirection: 'row', paddingVertical: Spacing.two },
  metade: { flex: 1, alignItems: 'center' },
  girado: { transform: [{ rotate: '-90deg' }] },
  anelBotao: { alignItems: 'center', gap: Spacing.one },
  anel: { width: TAMANHO_ANEL, height: TAMANHO_ANEL },
  anelCentro: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  anelValor: { fontSize: 24, lineHeight: 30 },
  pressionado: { opacity: 0.7 },
  alerta: { borderRadius: 8, paddingHorizontal: Spacing.two, paddingVertical: Spacing.one },
  item: { flexDirection: 'row', gap: Spacing.three },
  trilho: { width: 12, alignItems: 'center' },
  ponto: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  linhaTempo: { width: 2, flex: 1, marginTop: Spacing.one },
  itemTexto: { paddingBottom: Spacing.three },
  itemTopo: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
});
