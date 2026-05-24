import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';

import { Card, ErrorText, Field, Header, PrimaryButton, Screen, styles } from '../components/neuro';
import { useAuth } from '../lib/auth-context';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('user1@example.com');
  const [password, setPassword] = useState('Password123');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  async function submit() {
    setError('');
    setIsPending(true);

    try {
      await login(email, password);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed.');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <Screen>
        <Header
          title="Sign in"
          subtitle="Connect the mobile companion to the NeuroForge infrastructure API."
        />
        <Card>
          <Field autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="Email" />
          <Field secureTextEntry value={password} onChangeText={setPassword} placeholder="Password" />
          <PrimaryButton title={isPending ? 'Signing in...' : 'Login'} onPress={submit} disabled={isPending} />
          <ErrorText message={error} />
          <View style={styles.row}>
            <Text style={styles.muted}>Need an account?</Text>
            <Link href="/register" style={{ color: '#15b8c7', fontWeight: '800' }}>
              Register
            </Link>
          </View>
        </Card>
      </Screen>
    </KeyboardAvoidingView>
  );
}
