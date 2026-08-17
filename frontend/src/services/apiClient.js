const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Reusable HTTP API Client for ChemEscape
 *
 * Security: On 401 (token expired / invalid) this client fires a custom DOM
 * event — 'chemescape:session-expired' — so AuthContext can immediately clear
 * ALL user state (token + in-memory game progress) regardless of which
 * component/service made the request.
 */
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
  get:    (endpoint, headers)       => request(endpoint, { method: 'GET', headers }),
  post:   (endpoint, body, headers) => request(endpoint, { method: 'POST',   body: JSON.stringify(body), headers }),
  put:    (endpoint, body, headers) => request(endpoint, { method: 'PUT',    body: JSON.stringify(body), headers }),
  delete: (endpoint, headers)       => request(endpoint, { method: 'DELETE', headers }),
};

export default apiClient;
