import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { AgentPreset, PromptTemplate, apiRequest } from '../../lib/api';
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

export default function LibraryScreen() {
  const { isAuthenticated, token } = useAuth();
  const prompts = useApiResource<PromptTemplate[]>('/prompts?pageSize=30');
  const agents = useApiResource<AgentPreset[]>('/agents?pageSize=30');
  const [title, setTitle] = useState('Mobile prompt');
  const [content, setContent] = useState('Answer concisely using operational context.');
  const [agentPrompt, setAgentPrompt] = useState('Summarize current infrastructure health.');
  const [message, setMessage] = useState('');

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  async function createPrompt() {
    setMessage('Saving prompt...');
    await apiRequest<PromptTemplate>('/prompts', {
      token,
      method: 'POST',
      body: JSON.stringify({ title, content, category: 'mobile', visibility: 'private' }),
    });
    setMessage('Prompt saved.');
    prompts.reload();
  }

  async function deletePrompt(id: number) {
    setMessage('Deleting prompt...');
    await apiRequest(`/prompts/${id}`, { token, method: 'DELETE' });
    setMessage('Prompt deleted.');
    prompts.reload();
  }

  async function runAgent(id: number) {
    setMessage('Running agent...');
    const response = await apiRequest<{ output: string }>(`/agents/${id}/run`, {
      token,
      method: 'POST',
      body: JSON.stringify({ prompt: agentPrompt }),
    });
    setMessage(response.data.output);
  }

  return (
    <Screen>
      <Header title="Library" subtitle="Prompt templates and reusable AI agent presets." />
      {prompts.isLoading || agents.isLoading ? <LoadingState /> : null}
      <ErrorText message={prompts.error || agents.error} />

      <Card>
        <Text style={styles.itemTitle}>Create prompt</Text>
        <Field value={title} onChangeText={setTitle} placeholder="Title" />
        <Field value={content} onChangeText={setContent} placeholder="Prompt content" multiline />
        <PrimaryButton title="Save prompt" onPress={createPrompt} />
      </Card>

      <Card>
        <Text style={styles.itemTitle}>Prompts</Text>
        {prompts.data?.map((prompt) => (
          <View key={prompt.id} style={{ gap: 8 }}>
            <Text style={styles.itemMeta}>
              {prompt.title} · {prompt.category} · v{prompt.version}
            </Text>
            <PrimaryButton title="Delete" onPress={() => deletePrompt(prompt.id)} />
          </View>
        ))}
      </Card>

      <Card>
        <Text style={styles.itemTitle}>Agent runner</Text>
        <Field value={agentPrompt} onChangeText={setAgentPrompt} placeholder="Agent prompt" multiline />
        {agents.data?.map((agent) => (
          <View key={agent.id} style={{ gap: 8 }}>
            <Text style={styles.itemMeta}>
              {agent.name} · model {agent.modelId}
            </Text>
            <PrimaryButton title="Run agent" onPress={() => runAgent(agent.id)} />
          </View>
        ))}
      </Card>

      {message ? (
        <Card>
          <Text style={styles.itemTitle}>Result</Text>
          <Text style={styles.itemMeta}>{message}</Text>
        </Card>
      ) : null}
    </Screen>
  );
}
