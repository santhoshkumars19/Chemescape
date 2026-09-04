const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Reusable HTTP API Client for EduNova
 *
 * Security: On 401 (token expired / invalid) this client fires a custom DOM
 * event — 'chemescape:session-expired' — so AuthContext can immediately clear
 * ALL user state (token + in-memory game progress) regardless of which
 * component/service made the request.
 */
function buildUrl(endpoint, params) {
  if (!params || typeof params !== 'object' || Object.keys(params).length === 0) return endpoint;
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      searchParams.append(key, val);
    }
  });
  const queryString = searchParams.toString();
  if (!queryString) return endpoint;
  return endpoint.includes('?') ? `${endpoint}&${queryString}` : `${endpoint}?${queryString}`;
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('chemescape_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = { ...options, headers };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);

    // ── 401 — Token expired or tampered ────────────────────────────────────
    if (response.status === 401) {
      localStorage.removeItem('chemescape_token');
      // Fire a global event so AuthContext can wipe all user-specific state.
      window.dispatchEvent(new CustomEvent('chemescape:session-expired', {
        detail: { endpoint, reason: 'JWT invalid or expired' },
      }));
    }

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'API request failed');
      error.status = response.status;
      error.data   = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, error.message);
    throw error;
  }
}

export const apiClient = {
  get: (endpoint, options = {}) => {
    const isOptionsObj = options && typeof options === 'object' && ('params' in options || 'headers' in options);
    const params = isOptionsObj ? options.params : null;
    const headers = isOptionsObj ? options.headers : options;
    const url = buildUrl(endpoint, params);
    return request(url, { method: 'GET', headers });
  },
  post: (endpoint, body, options = {}) => {
    const isOptionsObj = options && typeof options === 'object' && ('params' in options || 'headers' in options);
    const params = isOptionsObj ? options.params : null;
    const headers = isOptionsObj ? options.headers : options;
    const url = buildUrl(endpoint, params);
    return request(url, { method: 'POST', body: JSON.stringify(body), headers });
  },
  put: (endpoint, body, options = {}) => {
    const isOptionsObj = options && typeof options === 'object' && ('params' in options || 'headers' in options);
    const params = isOptionsObj ? options.params : null;
    const headers = isOptionsObj ? options.headers : options;
    const url = buildUrl(endpoint, params);
    return request(url, { method: 'PUT', body: JSON.stringify(body), headers });
  },
  delete: (endpoint, options = {}) => {
    const isOptionsObj = options && typeof options === 'object' && ('params' in options || 'headers' in options);
    const params = isOptionsObj ? options.params : null;
    const headers = isOptionsObj ? options.headers : options;
    const url = buildUrl(endpoint, params);
    return request(url, { method: 'DELETE', headers });
  },
};

export default apiClient;
