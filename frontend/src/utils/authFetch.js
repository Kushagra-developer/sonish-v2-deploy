import API from './api';

/**
 * Wrapper around fetch() that automatically attaches the JWT Bearer token
 * from localStorage to every request. Use this for all authenticated API calls.
 */
export const authFetch = (url, options = {}) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
  const token = userInfo?.token;

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
