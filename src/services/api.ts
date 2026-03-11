// src/services/api.ts
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // NOTE: FormData 和 URLSearchParams 的 Content-Type 由浏览器自动处理，不要手动覆盖
  if (!(options.body instanceof FormData) && !(options.body instanceof URLSearchParams)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'API请求失败，请稍后重试');
  }

  return response.json();
};

export const api = {
  get: (endpoint: string, options?: RequestInit) => fetchApi(endpoint, { ...options, method: 'GET' }),
  post: (endpoint: string, data?: any, options?: RequestInit) => 
    fetchApi(endpoint, { 
      ...options, 
      method: 'POST', 
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined)
    }),
  put: (endpoint: string, data?: any, options?: RequestInit) => 
    fetchApi(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined)
    }),
  delete: (endpoint: string, options?: RequestInit) => fetchApi(endpoint, { ...options, method: 'DELETE' }),
};
