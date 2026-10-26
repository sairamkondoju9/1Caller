/**
 * Sarvam Voice AI — Authenticated API Helper
 *
 * Every request to a protected API endpoint must include the JWT token
 * stored in localStorage after login. Use these helpers for all fetch calls.
 */

/** Returns the Authorization header object if a token is present */
export function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Authenticated fetch wrapper.
 * Automatically injects the Bearer token for every request.
 * On 401 responses, clears the stored token and reloads to show the auth modal.
 */
export async function apiFetch(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Token expired or invalid — force re-login
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    window.location.reload();
  }

  return response;
}
