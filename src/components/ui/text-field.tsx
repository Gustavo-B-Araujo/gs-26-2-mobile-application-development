import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TextFieldProps = TextInputProps & { rotulo?: string; erro?: string | null };

export function TextField({ rotulo, erro, style, ...rest }: TextFieldProps) {
  const theme = useTheme();
  return (
    <View style={styles.wrapper}>
      {rotulo && (
        <ThemedText type="smallBold" themeColor="textSecondary">
          {rotulo}
        </ThemedText>
      )}
      <TextInput
        placeholderTextColor={theme.textSecondary}
        accessibilityLabel={rotulo}
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.backgroundElement,
            borderColor: erro ? theme.danger : theme.border,
          },
          style,
        ]}
        {...rest}
      />
      {erro && (
        <ThemedText type="small" themeColor="danger" accessibilityLiveRegion="polite">
          {erro}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.one },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.medio,
    paddingHorizontal: Spacing.three,
    fontFamily: Fonts.semiBold,
    fontSize: 16,
  },
});
