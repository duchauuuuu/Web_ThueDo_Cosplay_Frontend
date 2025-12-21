import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import axiosInstance from '@/lib/api/axios-instance';

export type MutationMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface UseApiMutationOptions<TData = unknown, TVariables = unknown> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
}

export interface UseApiMutationResult<TData = unknown, TVariables = unknown> {
  mutate: (variables: TVariables, endpoint: string, method?: MutationMethod) => Promise<TData | undefined>;
  mutateAsync: (variables: TVariables, endpoint: string, method?: MutationMethod) => Promise<TData>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * Hook để thực hiện các mutation requests (POST, PUT, PATCH, DELETE) sử dụng axios
 * 
 * @param options - Callback options cho success và error
 * @returns Object chứa mutate function, loading state, error state
 * 
 * @example
 * ```tsx
 * const { mutate, isLoading, error } = useApiMutation({
 *   onSuccess: (data) => console.log('Success:', data),
 *   onError: (error) => console.error('Error:', error)
 * });
 * 
 * // Sử dụng
 * await mutate({ name: 'Test' }, '/products', 'POST');
 * ```
 */
export function useApiMutation<TData = unknown, TVariables = unknown>(
  options?: UseApiMutationOptions<TData, TVariables>
): UseApiMutationResult<TData, TVariables> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (
      variables: TVariables,
      endpoint: string,
      method: MutationMethod = 'POST'
    ): Promise<TData | undefined> => {
      setIsLoading(true);
      setError(null);

      try {
        let response;

        switch (method) {
          case 'POST':
            response = await axiosInstance.post<TData>(endpoint, variables);
            break;
          case 'PUT':
            response = await axiosInstance.put<TData>(endpoint, variables);
            break;
          case 'PATCH':
            response = await axiosInstance.patch<TData>(endpoint, variables);
            break;
          case 'DELETE':
            response = await axiosInstance.delete<TData>(endpoint);
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }

        const data = response.data;

        options?.onSuccess?.(data, variables);
        setIsLoading(false);
        return data;
      } catch (err) {
        let error: Error;

        if (axios.isAxiosError(err)) {
          const axiosError = err as AxiosError<{ message?: string }>;
          const errorMessage = 
            axiosError.response?.data?.message || 
            axiosError.message || 
            'Request failed';
          error = new Error(errorMessage);
        } else {
          error = err instanceof Error ? err : new Error('Unknown error occurred');
        }

        setError(error);
        options?.onError?.(error, variables);
        setIsLoading(false);
        throw error;
      }
    },
    [options]
  );

  const mutateAsync = useCallback(
    async (
      variables: TVariables,
      endpoint: string,
      method: MutationMethod = 'POST'
    ): Promise<TData> => {
      const result = await mutate(variables, endpoint, method);
      if (result === undefined) {
        // Nếu response không có data (204 No Content), return empty object
        return {} as TData;
      }
      return result;
    },
    [mutate]
  );

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    mutate,
    mutateAsync,
    isLoading,
    error,
    reset,
  };
}

