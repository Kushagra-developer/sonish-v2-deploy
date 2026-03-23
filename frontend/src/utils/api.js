const API_URL = import.meta.env.MODE === 'production' ? '' : 'http://localhost:5001';

if (!import.meta.env.VITE_API_URL && window.location.hostname !== 'localhost') {
  console.warn('VITE_API_URL is not set in production. Falling back to localhost:5001 which likely will fail.');
}

export default API_URL;
