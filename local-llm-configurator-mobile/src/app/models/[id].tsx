import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

import { Card, ErrorText, Header, LoadingState, Screen, Stat, styles } from '../../components/neuro';
import { AiModel } from '../../lib/api';
import { useApiResource } from '../../lib/use-api';

export default function ModelDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, error, isLoading } = useApiResource<AiModel>(`/models/${id}`);

  return (
    <Screen>
      <Header title={data?.name ?? 'Model Details'} subtitle="Hardware and runtime metadata for this model." />
      {isLoading ? <LoadingState /> : null}
      <ErrorText message={error} />
      {data ? (
        <>
          <Card>
            <Text style={styles.itemTitle}>{data.name}</Text>
            <Text style={styles.itemMeta}>{data.description}</Text>
          </Card>
          <Stat label="Provider" value={data.provider} />
          <Stat label="Model type" value={data.modelType} />
          <Stat label="Availability" value={data.availability} />
          <Stat label="VRAM MB" value={data.recommendedVramMb ?? '-'} />
          <Stat label="RAM MB" value={data.recommendedRamMb ?? '-'} />
          <Stat label="Context" value={data.contextWindow ?? '-'} />
        </>
      ) : null}
    </Screen>
  );
}
