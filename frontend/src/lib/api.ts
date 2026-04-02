import { ResearchRequest, ResearchResponse, UploadResponse } from '@/types';

const API_BASE =
  process.env.NODE_ENV === 'development'
    ? process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'
    : '/api';

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new APIError(response.status, errorText);
  }

  return response.json();
}

export const api = {
  async research(request: ResearchRequest): Promise<ResearchResponse> {
    return fetchWithErrorHandling(`${API_BASE}/research`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new APIError(response.status, errorText);
    }

    return response.json();
  },

  async health(): Promise<{ status: string; service: string }> {
    return fetchWithErrorHandling(`${API_BASE}/health`);
  },

  async clearCache(): Promise<{ message: string }> {
    return fetchWithErrorHandling(`${API_BASE}/cache/clear`, {
      method: 'POST',
    });
  },

  async getCacheStats(): Promise<any> {
    return fetchWithErrorHandling(`${API_BASE}/cache/stats`);
  },
};

export { APIError };