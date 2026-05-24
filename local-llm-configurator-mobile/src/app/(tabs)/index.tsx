import { Redirect } from 'expo-router';
import { Text, View } from 'react-native';

import { Card, ErrorText, Header, LoadingState, Screen, Stat, styles } from '../../components/neuro';
import { DashboardSummary } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { useApiResource } from '../../lib/use-api';

export default function DashboardScreen() {
  const { isAuthenticated, user } = useAuth();
  const { data, error, isLoading } = useApiResource<DashboardSummary>('/dashboard');

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Screen>
      <Header
        title={`Command Center`}
        subtitle={`Signed in as ${user?.displayName ?? 'operator'}. Monitor your local and hybrid LLM infrastructure.`}
      />
      {isLoading ? <LoadingState /> : null}
      <ErrorText message={error} />
      {data ? (
        <>
          <View style={styles.row}>
            <Stat label="Models" value={data.totals.models} />
            <Stat label="Configs" value={data.totals.configurations} />
            <Stat label="Benchmarks" value={data.totals.benchmarks} />
            <Stat label="Agents" value={data.totals.agents} />
          </View>
          <Card>
            <Text style={styles.itemTitle}>Performance</Text>
            <Text style={styles.itemMeta}>
              Avg {Math.round(Number(data.performance.avgTokensPerSecond))} tok/s ·{' '}
              {Math.round(Number(data.performance.avgLatencyMs))}ms latency
            </Text>
          </Card>
          <Card>
            <Text style={styles.itemTitle}>Active sessions</Text>
            {data.activeSessions.length ? (
              data.activeSessions.map((item) => (
                <Text key={item.session.id} style={styles.itemMeta}>
                  {item.session.sessionName} · {item.model.name}
                </Text>
              ))
            ) : (
              <Text style={styles.itemMeta}>No active sessions.</Text>
            )}
          </Card>
          <Card>
            <Text style={styles.itemTitle}>Recent logs</Text>
            {data.latestLogs.slice(0, 5).map((log) => (
              <Text key={log.id} style={styles.itemMeta}>
                {log.level.toUpperCase()} · {log.title}
              </Text>
            ))}
          </Card>
        </>
      ) : null}
    </Screen>
  );
}
