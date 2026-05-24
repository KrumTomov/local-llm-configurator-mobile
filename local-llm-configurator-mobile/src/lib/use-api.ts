import { useCallback, useEffect, useState } from 'react';

import { apiRequest } from './api';
import { useAuth } from './auth-context';

export function useApiResource<T>(path: string) {
  const { token, isAuthenticated } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!isAuthenticated || !token) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiRequest<T>(path, { token });
      setData(response.data);
    } catch (resourceError) {
      setError(resourceError instanceof Error ? resourceError.message : 'Request failed.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, path, token]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, error, isLoading, reload: load };
}
