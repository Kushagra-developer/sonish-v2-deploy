import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Lock, Trash2, Plus, Minus } from 'lucide-react';
import SecureCheckout from '../checkout/SecureCheckout';
import { loadCart, saveCart } from '../../utils/cartStorage';
import API from '../../utils/api';

const CartDrawer = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState([]);
  const [userInfo, setUserInfo] = useState(null);

  // Dynamically load cart from LocalStorage whenever the drawer opens
  const refreshCart = () => {
    setCartItems(loadCart());
    const storedUser = JSON.parse(localStorage.getItem('userInfo'));
    if (storedUser) {
      setUserInfo(storedUser);
    }
  };

  useEffect(() => {
    refreshCart();
    // Sync cart instantly when "Add to Cart" is clicked on any product page
    window.addEventListener('cartUpdated', refreshCart);
    return () => window.removeEventListener('cartUpdated', refreshCart);
  }, [isOpen]);

  const updateQuantity = (index, delta) => {
    const newCart = [...cartItems];
    newCart[index].qty += delta;
    if (newCart[index].qty < 1) newCart[index].qty = 1;
    setCartItems(newCart);
    saveCart(newCart);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (index) => {
    const newCart = cartItems.filter((_, i) => i !== index);
    setCartItems(newCart);
    saveCart(newCart);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Calculate the real subtotal based on items actually in the cart
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.qty), 0);

  const hasAddress =
    userInfo?.shippingAddress?.address?.trim().length > 0 &&
    userInfo?.shippingAddress?.city?.trim().length > 0 &&
    userInfo?.shippingAddress?.postalCode?.trim().length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-charcoal/40 dark:bg-black/60 backdrop-blur-sm z-[60]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-offwhite dark:bg-charcoal shadow-2xl z-[70] flex flex-col transition-colors duration-300"
          >
            {/* Functional Header */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-charcoal/10 dark:border-offwhite/10">
              <h2 className="font-serif text-2xl text-charcoal dark:text-offwhite flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" /> Your Cart
              </h2>
              <button onClick={onClose} className="text-charcoal/60 dark:text-offwhite/60 hover:text-charcoal transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Dynamic Cart Items Area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 no-scrollbar">
              {cartItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center mt-20">
                  <p className="text-charcoal dark:text-offwhite font-medium text-lg mb-2">Your cart is empty</p>
                  <button onClick={onClose} className="px-8 py-3 bg-charcoal dark:bg-offwhite text-white dark:text-charcoal text-xs uppercase tracking-widest hover:bg-black transition-colors">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item, index) => (
                  <div key={index} className="flex gap-4 border-b border-charcoal/10 dark:border-offwhite/10 pb-6 last:border-0">
                    <img src={item.image} alt={item.name} className="w-20 h-24 object-cover bg-gray-100" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-medium text-charcoal dark:text-offwhite line-clamp-2 pr-4">{item.name}</h3>
                          <button onClick={() => removeItem(index)} className="text-charcoal/40 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-charcoal/60 dark:text-offwhite/60 mt-1">Size: {item.selectedSize}</p>
                        <p className="text-sm text-charcoal dark:text-offwhite mt-1 font-serif">₹{item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center border border-charcoal/20 dark:border-offwhite/20 w-24 h-8 justify-between px-2 mt-2">
                        <button onClick={() => updateQuantity(index, -1)} className="dark:text-offwhite"><Minus className="w-3 h-3" /></button>
                        <span className="text-xs dark:text-offwhite">{item.qty}</span>
                        <button onClick={() => updateQuantity(index, 1)} className="dark:text-offwhite"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Functional Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-charcoal/10 dark:border-offwhite/10 bg-white dark:bg-charcoal shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center mb-4 text-sm text-charcoal dark:text-offwhite font-medium tracking-wide">
                  <span>Subtotal</span>
                  <span className="font-serif text-lg">₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 mb-2">
                  <Lock className="w-3 h-3" />
                  <span>Secure 256-bit SSL Checkout</span>
                </div>

                {!hasAddress ? (
                  <div className="mt-4 p-6 border border-charcoal/10 dark:border-offwhite/10 text-center bg-charcoal/[0.02] dark:bg-offwhite/[0.02]">
                    <h3 className="text-xs uppercase tracking-widest text-charcoal dark:text-offwhite font-bold mb-2">Address Required</h3>
                    <p className="text-sm text-charcoal/60 dark:text-offwhite/60 mb-6 leading-relaxed">Please select a shipping address in your profile to proceed with checkout.</p>
                    <button
                      onClick={() => { onClose(); window.location.href = '/profile?tab=addresses'; }}
                      className="w-full bg-charcoal dark:bg-offwhite text-white dark:text-charcoal py-3 text-xs uppercase tracking-widest hover:bg-black transition-colors"
                    >
                      Go to Addresses
                    </button>
                  </div>
                ) : (
                  <SecureCheckout cartTotal={cartTotal} cartItems={cartItems} shippingAddress={userInfo?.shippingAddress} onCloseDrawer={onClose} />
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;