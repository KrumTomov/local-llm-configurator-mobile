import { Link, Redirect } from 'expo-router';
import { Text } from 'react-native';

import { Card, ErrorText, Header, LoadingState, Screen, styles } from '../../components/neuro';
import { AiModel } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { useApiResource } from '../../lib/use-api';

export default function ModelsScreen() {
  const { isAuthenticated } = useAuth();
  const { data, error, isLoading } = useApiResource<AiModel[]>('/models?pageSize=50');

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Screen>
      <Header title="Model Registry" subtitle="Browse local, cloud, and hybrid LLMs available to NeuroForge." />
      {isLoading ? <LoadingState /> : null}
      <ErrorText message={error} />
      {data?.map((model) => (
        <Link key={model.id} href={`/models/${model.id}`} asChild>
          <Card>
            <Text style={styles.itemTitle}>{model.name}</Text>
            <Text style={styles.itemMeta}>
              {model.provider} · {model.family} · {model.availability}
            </Text>
            <Text style={styles.itemMeta}>
              VRAM {model.recommendedVramMb ?? '-'} MB · Context {model.contextWindow ?? '-'} ·{' '}
              {model.quantization ?? 'mixed'}
            </Text>
          </Card>
        </Link>
      ))}
    </Screen>
  );
}
