/**
 * Wrapper around fetch() that automatically attaches the JWT Bearer token
 * from localStorage to every request. Use this for all authenticated API calls.
 * Checks both 'userInfo' (customer) and 'adminInfo' (admin) in localStorage.
 */
export const authFetch = (url, options = {}) => {
  // Try userInfo first, then adminInfo
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
  const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || 'null');
  const token = userInfo?.token || adminInfo?.token;

  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
};

/**
 * Shortcut for authenticated JSON POST/PUT requests.
 */
export const authJsonFetch = (url, options = {}) => {
  return authFetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};
