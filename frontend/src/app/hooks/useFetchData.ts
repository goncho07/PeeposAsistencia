import { useState, useEffect, useCallback, useRef } from 'react';

interface UseFetchDataOptions<T> {
  fetchFn: () => Promise<T[]>;
  errorMessage?: string;
  onSuccess?: (data: T[]) => void;
  onError?: (error: any) => void;
}

export function useFetchData<T>({
  fetchFn,
  errorMessage = 'Error al cargar datos',
  onSuccess,
  onError,
}: UseFetchDataOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFnRef = useRef(fetchFn);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    fetchFnRef.current = fetchFn;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  });

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFnRef.current();
      setData(result || []);
      onSuccessRef.current?.(result || []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || errorMessage;
      setError(errorMsg);
      onErrorRef.current?.(err);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [errorMessage]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
