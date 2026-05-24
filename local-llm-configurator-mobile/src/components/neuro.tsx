import { PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

export function Screen({ children }: PropsWithChildren) {
  return <ScrollView contentContainerStyle={styles.screen}>{children}</ScrollView>;
}

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.kicker}>NeuroForge</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Card({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  disabled,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, disabled ? styles.buttonDisabled : null]}>
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps) {
  return <TextInput placeholderTextColor="#789" {...props} style={[styles.input, props.style]} />;
}

export function LoadingState() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color="#15b8c7" />
      <Text style={styles.muted}>Loading NeuroForge data...</Text>
    </View>
  );
}

export function ErrorText({ message }: { message: string }) {
  if (!message) {
    return null;
  }

  return <Text style={styles.error}>{message}</Text>;
}

export const styles = StyleSheet.create({
  screen: {
    gap: 16,
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#071014',
    minHeight: '100%',
  },
  header: {
    gap: 6,
    paddingTop: 12,
  },
  kicker: {
    color: '#15b8c7',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    color: '#f3fbff',
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: '#9fb3bd',
    fontSize: 14,
    lineHeight: 21,
  },
  card: {
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#18343c',
    borderRadius: 8,
    backgroundColor: '#0c1b21',
  },
  stat: {
    flex: 1,
    minWidth: 120,
    padding: 14,
    borderWidth: 1,
    borderColor: '#18343c',
    borderRadius: 8,
    backgroundColor: '#0f242b',
  },
  statLabel: {
    color: '#8ba4af',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statValue: {
    color: '#f3fbff',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 6,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: '#08899a',
    paddingHorizontal: 16,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#23424b',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#f3fbff',
    backgroundColor: '#071014',
  },
  center: {
    alignItems: 'center',
    gap: 10,
    padding: 24,
  },
  muted: {
    color: '#9fb3bd',
  },
  error: {
    color: '#ff8d8d',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  itemTitle: {
    color: '#f3fbff',
    fontSize: 16,
    fontWeight: '800',
  },
  itemMeta: {
    color: '#9fb3bd',
    fontSize: 12,
  },
});
