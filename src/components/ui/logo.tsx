import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

const LOGO = require('@/assets/images/logo.png');

type LogoProps = { tamanho?: number; comNome?: boolean };

export function Logo({ tamanho = 72, comNome = true }: LogoProps) {
  return (
    <View style={styles.linha}>
      <Image
        source={LOGO}
        style={{ width: tamanho, height: tamanho }}
        accessibilityLabel="Logo do Boletim Plus"
      />
      {comNome && (
        <View>
          <ThemedText type="subtitle">
            Boletim{' '}
            <ThemedText type="subtitle" themeColor="accent">
              Plus
            </ThemedText>
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Notas e presença na palma da mão
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
});
