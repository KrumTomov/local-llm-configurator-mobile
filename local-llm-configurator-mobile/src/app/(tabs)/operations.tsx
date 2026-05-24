import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import {
  Benchmark,
  ModelConfiguration,
  ModelSession,
  apiRequest,
} from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { useApiResource } from '../../lib/use-api';
import {
  Card,
  ErrorText,
  Field,
  Header,
  LoadingState,
  PrimaryButton,
  Screen,
  styles,
} from '../../components/neuro';

export default function OperationsScreen() {
  const { isAuthenticated, token } = useAuth();
  const configs = useApiResource<ModelConfiguration[]>('/configurations?pageSize=20');
  const sessions = useApiResource<ModelSession[]>('/sessions?pageSize=20');
  const benchmarks = useApiResource<Benchmark[]>('/benchmarks?pageSize=20');
  const [modelId, setModelId] = useState('1');
  const [configName, setConfigName] = useState('Mobile optimized profile');
  const [prompt, setPrompt] = useState('Explain local LLM orchestration.');
  const [message, setMessage] = useState('');

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  async function createConfig() {
    setMessage('Creating configuration...');
    await apiRequest<ModelConfiguration>('/configurations', {
      token,
      method: 'POST',
      body: JSON.stringify({
        modelId,
        configName,
        contextSize: 4096,
        useCaseCategory: 'mobile_ops',
      }),
    });
    setMessage('Configuration created.');
    configs.reload();
  }

  async function startBenchmark() {
    setMessage('Running benchmark...');
    await apiRequest<Benchmark>('/benchmarks', {
      token,
      method: 'POST',
      body: JSON.stringify({ modelId, benchmarkPrompt: prompt }),
    });
    setMessage('Benchmark completed.');
    benchmarks.reload();
  }

  async function startSession() {
    const firstConfig = configs.data?.[0];

    if (!firstConfig) {
      setMessage('Create a configuration first.');
      return;
    }

    setMessage('Starting session...');
    await apiRequest<ModelSession>('/sessions', {
      token,
      method: 'POST',
      body: JSON.stringify({
        modelId: firstConfig.modelId,
        configurationId: firstConfig.id,
        sessionName: 'Mobile control session',
      }),
    });
    setMessage('Session started.');
    sessions.reload();
  }

  async function stopSession(id: number) {
    setMessage('Stopping session...');
    await apiRequest(`/sessions/${id}/stop`, { token, method: 'POST' });
    setMessage('Session stopped.');
    sessions.reload();
  }

  return (
    <Screen>
      <Header title="Operations" subtitle="Create configs, start sessions, and run benchmarks." />
      <ErrorText message={configs.error || sessions.error || benchmarks.error} />
      {configs.isLoading || sessions.isLoading || benchmarks.isLoading ? <LoadingState /> : null}

      <Card>
        <Text style={styles.itemTitle}>Quick control</Text>
        <Field value={modelId} onChangeText={setModelId} keyboardType="number-pad" placeholder="Model ID" />
        <Field value={configName} onChangeText={setConfigName} placeholder="Configuration name" />
        <Field value={prompt} onChangeText={setPrompt} placeholder="Benchmark prompt" />
        <View style={styles.row}>
          <PrimaryButton title="Create config" onPress={createConfig} />
          <PrimaryButton title="Start session" onPress={startSession} />
          <PrimaryButton title="Run benchmark" onPress={startBenchmark} />
        </View>
        {message ? <Text style={styles.itemMeta}>{message}</Text> : null}
      </Card>

      <Card>
        <Text style={styles.itemTitle}>Configurations</Text>
        {configs.data?.map((config) => (
          <Text key={config.id} style={styles.itemMeta}>
            #{config.id} {config.configName} · model {config.modelId}
          </Text>
        ))}
      </Card>

      <Card>
        <Text style={styles.itemTitle}>Sessions</Text>
        {sessions.data?.map((session) => (
          <View key={session.id} style={{ gap: 8 }}>
            <Text style={styles.itemMeta}>
              #{session.id} {session.sessionName} · {session.status}
            </Text>
            {session.status === 'active' ? (
              <PrimaryButton title="Stop" onPress={() => stopSession(session.id)} />
            ) : null}
          </View>
        ))}
      </Card>

      <Card>
        <Text style={styles.itemTitle}>Benchmarks</Text>
        {benchmarks.data?.map((benchmark) => (
          <Text key={benchmark.id} style={styles.itemMeta}>
            {benchmark.benchmarkName ?? `Benchmark ${benchmark.id}`} · {benchmark.tokensPerSecond} tok/s ·{' '}
            {benchmark.latencyMs}ms
          </Text>
        ))}
      </Card>
    </Screen>
  );
}
