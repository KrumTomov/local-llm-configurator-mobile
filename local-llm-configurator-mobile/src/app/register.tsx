import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';

import { Card, ErrorText, Field, Header, PrimaryButton, Screen, styles } from '../components/neuro';
import { useAuth } from '../lib/auth-context';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  async function submit() {
    setError('');
    setIsPending(true);

    try {
      await register(name, email, password);
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : 'Registration failed.');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <Screen>
        <Header title="Create account" subtitle="Start monitoring local and hybrid LLM infrastructure from mobile." />
        <Card>
          <Field value={name} onChangeText={setName} placeholder="Name" />
          <Field autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="Email" />
          <Field secureTextEntry value={password} onChangeText={setPassword} placeholder="Password" />
          <PrimaryButton title={isPending ? 'Creating account...' : 'Register'} onPress={submit} disabled={isPending} />
          <ErrorText message={error} />
          <View style={styles.row}>
            <Text style={styles.muted}>Already registered?</Text>
            <Link href="/login" style={{ color: '#15b8c7', fontWeight: '800' }}>
              Login
            </Link>
          </View>
        </Card>
      </Screen>
    </KeyboardAvoidingView>
  );
}
