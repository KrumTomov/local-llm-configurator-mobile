import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { Card, ErrorText, Field, Header, LoadingState, PrimaryButton, Screen, styles } from '../../components/neuro';
import { SystemLog } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { useApiResource } from '../../lib/use-api';

export default function AccountScreen() {
  const { isAuthenticated, user, logout, updateProfile } = useAuth();
  const logs = useApiResource<SystemLog[]>('/logs?pageSize=30');
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  async function saveProfile() {
    setError('');
    setMessage('Saving profile...');

    try {
      await updateProfile(displayName, avatarUrl);
      setMessage('Profile updated.');
    } catch (profileError) {
      setMessage('');
      setError(profileError instanceof Error ? profileError.message : 'Profile update failed.');
    }
  }

  return (
    <Screen>
      <Header title="Account" subtitle="Profile, role, logs, and mobile session controls." />
      <Card>
        <Text style={styles.itemTitle}>{user?.displayName}</Text>
        <Text style={styles.itemMeta}>
          {user?.email} · {user?.role}
        </Text>
        <Field value={displayName} onChangeText={setDisplayName} placeholder="Display name" />
        <Field value={avatarUrl ?? ''} onChangeText={setAvatarUrl} placeholder="Avatar URL" />
        <PrimaryButton title="Update profile" onPress={saveProfile} />
        <PrimaryButton title="Log out" onPress={logout} />
        {message ? <Text style={styles.itemMeta}>{message}</Text> : null}
        <ErrorText message={error} />
      </Card>

      <Card>
        <Text style={styles.itemTitle}>System logs</Text>
        {logs.isLoading ? <LoadingState /> : null}
        <ErrorText message={logs.error} />
        {logs.data?.map((log) => (
          <Text key={log.id} style={styles.itemMeta}>
            {log.level.toUpperCase()} · {log.eventType} · {log.title}
          </Text>
        ))}
      </Card>
    </Screen>
  );
}
