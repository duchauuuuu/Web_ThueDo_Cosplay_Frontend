import useSWR, { SWRConfiguration, SWRResponse } from "swr";
import { useAuthStore } from '@/store/useAuthStore';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';

async function jsonFetcher<T>(url: string, headers?: Record<string, string>): Promise<T> {
  // Sử dụng fetchWithAuth để tự động thêm token và xử lý refresh token
  const res = await fetchWithAuth(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
  });

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(message || `Request failed: ${res.status}`);
  }

  // Nếu không có nội dung trả về
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

/**
 * Hook SWR chỉ dùng cho GET requests để fetch dữ liệu.
 *
 * @param url       Endpoint (set null để tắt gọi)
 * @param headers   Optional headers cho request
 * @param config    Cấu hình SWR (revalidate, deduping, v.v.)
 */
export function useSWRFetch<T = unknown>(
  url: string | null,
  headers?: Record<string, string>,
  config?: SWRConfiguration<T>
): SWRResponse<T, Error> & { isLoading: boolean } {
  const key = url === null ? null : [url, headers];

  const swr = useSWR<T, Error>(
    key,
    () => jsonFetcher<T>(url as string, headers),
    {
      revalidateOnFocus: false,
      ...config,
    }
  );

  return {
    ...swr,
    isLoading: swr.isLoading ?? (!swr.error && !swr.data),
  };
}

