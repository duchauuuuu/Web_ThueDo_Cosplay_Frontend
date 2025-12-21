import { useAuthStore } from '@/store/useAuthStore';
import { authAPI } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

/**
 * Fetch wrapper với auto-refresh token
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const { token, refreshToken, setAccessToken, logout } = useAuthStore.getState();

  // Add authorization header
  const headers = {
    ...options.headers,
    Authorization: token ? `Bearer ${token}` : '',
  };

  // Make request
  let response = await fetch(url, {
    ...options,
    headers,
  });

  // If 401 and we have refresh token, try to refresh
  if (response.status === 401 && refreshToken) {
    try {
      // Call refresh API
      const refreshResponse = await authAPI.refresh(refreshToken);
      
      // Update access token in store
      setAccessToken(refreshResponse.accessToken);

      // Retry original request with new token
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${refreshResponse.accessToken}`,
        },
      });
    } catch (error) {
      // Refresh failed, logout user
      console.error('Token refresh failed:', error);
      logout();
      
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      throw new Error('Phiên đăng nhập đã hết hạn');
    }
  }

  return response;
}

/**
 * Helper functions for common HTTP methods
 */
export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetchWithAuth(`${API_URL}${endpoint}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    return response.json();
  },

  post: async (endpoint: string, data: any) => {
    const response = await fetchWithAuth(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    return response.json();
  },

  put: async (endpoint: string, data: any) => {
    const response = await fetchWithAuth(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    return response.json();
  },

  delete: async (endpoint: string) => {
    const response = await fetchWithAuth(`${API_URL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    return response.json();
  },
};

