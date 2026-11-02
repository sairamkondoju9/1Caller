/**
 * Sarvam Voice AI — Authenticated API Helper
 *
 * Every request to a protected API endpoint includes the JWT token
 * stored in localStorage.
 */

/** Returns the Authorization header object if a token is present */
export function getAuthHeaders() {
  const token = typeof window !== 'undefined'
    ? (localStorage.getItem('auth_token') || localStorage.getItem('token') || '')
    : '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Authenticated fetch wrapper.
 * Automatically injects the Bearer token for every request.
 */
export async function apiFetch(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('auth_token') || localStorage.getItem('token') || '')
      : '';
    if (token) {
      console.warn(`[API Auth] 401 response for ${url}`);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sarvam:auth_expired'));
      }
    }
  }

  return response;
}
