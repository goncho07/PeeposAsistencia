import { useState, useEffect } from 'react';
import axios from '@/lib/axios';

interface UseEntityDataOptions {
  endpoint: string;
  enabled?: boolean;
}

interface UseEntityDataReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useEntityData<T = any>({
  endpoint,
  enabled = true,
}: UseEntityDataOptions): UseEntityDataReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(endpoint);
      setData(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar datos');
      console.error(`Error fetching ${endpoint}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint, enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
