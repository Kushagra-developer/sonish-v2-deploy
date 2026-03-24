/**
 * Wrapper around fetch() that automatically attaches the JWT Bearer token
 * from localStorage to every request. Use this for all authenticated API calls.
 * Checks both 'userInfo' (customer) and 'adminInfo' (admin) in localStorage.
 */
export const authFetch = (url, options = {}) => {
  let token = null;

  try {
    // Try userInfo first, then adminInfo
    const userInfoStr = localStorage.getItem('userInfo');
    const adminInfoStr = localStorage.getItem('adminInfo');
    
    let userInfo = null;
    let adminInfo = null;

    try {
      if (userInfoStr && userInfoStr !== 'undefined' && userInfoStr !== 'null') {
        userInfo = JSON.parse(userInfoStr);
      }
      if (adminInfoStr && adminInfoStr !== 'undefined' && adminInfoStr !== 'null') {
        adminInfo = JSON.parse(adminInfoStr);
      }
    } catch (e) {
      console.error('Auth parse error:', e);
    }
    
    token = userInfo?.token || adminInfo?.token;
  } catch (err) {
    console.error('Error parsing auth info from localStorage:', err);
  }

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
