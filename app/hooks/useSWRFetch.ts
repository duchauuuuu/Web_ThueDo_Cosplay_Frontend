import useSWR, { SWRConfiguration, SWRResponse } from "swr";
import { FetchOptions } from "@/types";

async function jsonFetcher<T>(url: string, opts?: FetchOptions): Promise<T> {
  const res = await fetch(url, {
    method: opts?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(opts?.headers ?? {}),
    },
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
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
 * Hook SWR dùng chung để fetch dữ liệu.
 *
 * @param url       Endpoint (set null để tắt gọi)
 * @param options   method/body/headers cho fetch
 * @param config    Cấu hình SWR (revalidate, deduping, v.v.)
 */
export function useSWRFetch<T = unknown>(
  url: string | null,
  options?: FetchOptions,
  config?: SWRConfiguration<T>
): SWRResponse<T, Error> & { isLoading: boolean } {
  const key =
    url === null
      ? null
      : [
          url,
          options?.method ?? "GET",
          options?.body ? JSON.stringify(options.body) : null,
          options?.headers,
        ];

  const swr = useSWR<T, Error>(
    key,
    () => jsonFetcher<T>(url as string, options),
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

export type { FetchOptions };

