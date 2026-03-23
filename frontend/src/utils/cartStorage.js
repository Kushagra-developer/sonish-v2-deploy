import API from '../utils/api';

export const getUserId = () => {
  try {
    const info = JSON.parse(localStorage.getItem('userInfo'));
    return info?._id || null;
  } catch {
    return null;
  }
};

export const getCartKey = () => {
  const uid = getUserId();
  return uid ? `sonish_cart_${uid}` : null;
};

export const getWishlistKey = () => {
  const uid = getUserId();
  return uid ? `sonish_wishlist_${uid}` : null;
};

export const loadCart = () => {
  const key = getCartKey();
  if (!key) return [];
  return JSON.parse(localStorage.getItem(key)) || [];
};

export const syncWithServer = async (cart, wishlist) => {
  try {
    await fetch(`${API}/api/users/sync`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ cart, wishlist }),
    });
  } catch (error) {
    console.error('Failed to sync to server', error);
  }
};

export const saveCart = (cart) => {
  const key = getCartKey();
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(cart));
  syncWithServer(cart, undefined);
};

export const loadWishlist = () => {
  const key = getWishlistKey();
  if (!key) return [];
  return JSON.parse(localStorage.getItem(key)) || [];
};

export const saveWishlist = (wishlist) => {
  const key = getWishlistKey();
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(wishlist));
  syncWithServer(undefined, wishlist);
};
