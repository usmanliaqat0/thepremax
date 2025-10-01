import { useState, useEffect, useCallback } from "react";

export interface UseAdminDataOptions {
  endpoint: string;
  refreshTrigger?: number;
}

export interface UseAdminDataReturn<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setData: (data: T[]) => void;
}

export function useAdminData<T>({
  endpoint,
  refreshTrigger = 0,
}: UseAdminDataOptions): UseAdminDataReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${endpoint}?all=true`);
      const result = await response.json();

      if (result.success) {
        // Handle different response structures
        if (result.data.users) {
          setData(result.data.users);
        } else if (Array.isArray(result.data)) {
          setData(result.data);
        } else {
          setData([]);
        }
      } else {
        setError(result.error || "Failed to fetch data");
        setData([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  return {
    data,
    isLoading,
    error,
    refresh,
    setData,
  };
}
