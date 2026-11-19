import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChipGroup } from '@/components/ui/chip-group';
import { Logo } from '@/components/ui/logo';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { SERVIDORES_DISPONIVEIS } from '@/data';
import { SENHA_MOCK } from '@/data/seed';
import { mensagemDeErro } from '@/lib/dialogos';
import { apenasDigitos, formatarCpf } from '@/lib/format';
import { useSession } from '@/session/session-context';

/** Usuários da `02_dml.sql`. Homer está com `StatusUsuario = Bloqueado`. */
const CONTAS_DEMO = [
  { cpf: '12345678900', papel: 'Diretor (Skinner)' },
  { cpf: '12345678901', papel: 'Professora (Edna)' },
  { cpf: '12345678903', papel: 'Guardiã (Marge)' },
  { cpf: '12345678904', papel: 'Aluno (Bart)' },
  { cpf: '12345678902', papel: 'Bloqueado (Homer)' },
];

export default function LoginScreen() {
  const { entrar, modo, servidor, escolherServidor } = useSession();
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const cpfCompleto = apenasDigitos(cpf).length === 11;
  const modoDemo = modo === 'demo';

  async function enviar() {
    if (!cpfCompleto || !senha) return;
    setErro(null);
    setEnviando(true);
    try {
      await entrar(apenasDigitos(cpf), senha);
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível entrar.'));
      setEnviando(false);
    }
  }

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.centro} keyboardShouldPersistTaps="handled">
            <View style={styles.form}>
              <View style={styles.cabecalho}>
                <Logo />
              </View>

              {modo === null && (
                <ThemedText themeColor="danger">
                  App sem as URLs das APIs. Crie o .env a partir do .env.example.
                </ThemedText>
              )}

              {modo === 'api' && SERVIDORES_DISPONIVEIS.length > 1 && (
                <View style={styles.servidor}>
                  <ThemedText type="smallBold">Servidor</ThemedText>
                  <ChipGroup
                    opcoes={SERVIDORES_DISPONIVEIS.map((s) => ({ valor: s.id, rotulo: s.nome }))}
                    selecionado={servidor.id}
                    aoSelecionar={(id) => {
                      escolherServidor(id);
                      setErro(null);
                    }}
                  />
                </View>
              )}

              <TextField
                rotulo="CPF"
                value={formatarCpf(cpf)}
                onChangeText={setCpf}
                placeholder="000.000.000-00"
                keyboardType="number-pad"
                autoComplete="username"
                textContentType="username"
                maxLength={14}
              />
              <TextField
                rotulo="Senha"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                autoComplete="current-password"
                textContentType="password"
                onSubmitEditing={enviar}
                erro={erro}
              />
              <Button
                titulo="Entrar"
                onPress={enviar}
                carregando={enviando}
                desabilitado={!cpfCompleto || !senha || modo === null}
              />

              <View style={styles.links}>
                <Link href="/cadastro" asChild>
                  <ThemedText type="link" accessibilityRole="link">
                    Não tem conta? Cadastre-se
                  </ThemedText>
                </Link>
                <Link href="/sobre" asChild>
                  <ThemedText type="link" themeColor="textSecondary" accessibilityRole="link">
                    Sobre o App
                  </ThemedText>
                </Link>
              </View>

              {modoDemo && (
                <Card>
                  <ThemedText type="smallBold">Modo demonstração</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Dados em memória, só para desenvolvimento. Senha: {SENHA_MOCK}. Toque numa conta
                    para preencher.
                  </ThemedText>
                  {CONTAS_DEMO.map((c) => (
                    <ThemedText
                      key={c.cpf}
                      type="link"
                      accessibilityRole="button"
                      onPress={() => {
                        setCpf(c.cpf);
                        setSenha(SENHA_MOCK);
                        setErro(null);
                      }}>
                      {c.papel}: {formatarCpf(c.cpf)}
                    </ThemedText>
                  ))}
                </Card>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  centro: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.three },
  form: { width: '100%', maxWidth: 420, gap: Spacing.three },
  cabecalho: { marginBottom: Spacing.three },
  servidor: { gap: Spacing.two },
  links: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
});
