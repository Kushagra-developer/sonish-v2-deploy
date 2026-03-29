import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Heart, Moon, Sun, User } from 'lucide-react';
import CartDrawer from './CartDrawer';
import { motion, AnimatePresence } from 'framer-motion';
import { loadCart, loadWishlist } from '../../utils/cartStorage';
import API from '../../utils/api';
import { authFetch } from '../../utils/authFetch';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [categories, setCategories] = useState([]);
  const [comingSoonToast, setComingSoonToast] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (comingSoonToast) {
      const timer = setTimeout(() => setComingSoonToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [comingSoonToast]);

  // 1. Toggle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // 2. Sync Cart & Wishlist counters
  useEffect(() => {
    const updateCounts = () => {
      const cart = loadCart();
      const wishlist = loadWishlist();
      const totalItems = cart.reduce((acc, item) => acc + (item.qty || item.cartQuantity || 1), 0);
      setCartCount(totalItems);
      setWishlistCount(wishlist.length);
      setIsLoggedIn(!!localStorage.getItem('userInfo'));
    };

    const syncCloudData = async () => {
      try {
        const userInfoStr = localStorage.getItem('userInfo');
        if (!userInfoStr) return;
        const uid = JSON.parse(userInfoStr)._id;
        if (!uid) return;
        
        const res = await authFetch(`${API}/api/users/profile`);
        if (res.ok) {
          const data = await res.json();
          if (data.cart) localStorage.setItem(`sonish_cart_${uid}`, JSON.stringify(data.cart));
          if (data.wishlist) localStorage.setItem(`sonish_wishlist_${uid}`, JSON.stringify(data.wishlist));
          updateCounts();
        }
      } catch (e) {
        console.error('Silent sync failed');
      }
    };

    const handleOpenCart = () => setIsCartOpen(true);

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API}/api/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Failed to fetch categories');
      }
    };

    updateCounts();
    syncCloudData();
    fetchCategories();

    window.addEventListener('cartUpdated', updateCounts);
    window.addEventListener('wishlistUpdated', updateCounts);
    window.addEventListener('openCart', handleOpenCart);

    return () => {
      window.removeEventListener('cartUpdated', updateCounts);
      window.removeEventListener('wishlistUpdated', updateCounts);
      window.removeEventListener('openCart', handleOpenCart);
    };
  }, []);

  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isSolid = !isHomePage || isScrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 ease-in-out ${isSolid
          ? 'bg-offwhite/95 dark:bg-charcoal/95 backdrop-blur-md shadow-sm py-4 dark:border-b dark:border-offwhite/10'
          : 'bg-transparent py-6'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">

            {/* Left Navigation - Focused on Women */}
            {/* Left Navigation */}
            <nav className="hidden md:flex flex-1 space-x-8 items-center">
              {/* Women Dropdown */}
              <div className="relative group py-4">
                <Link 
                  to="/collections?category=Women" 
                  className={`text-[12px] uppercase tracking-[0.3em] font-medium hover:text-gold transition-all duration-300 relative text-charcoal dark:text-offwhite`}
                >
                  Women
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold transition-all duration-300 group-hover:w-full"></span>
                </Link>
                
                {/* Dropdown Menu */}
                <div className="absolute top-full left-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pt-2 min-w-[200px]">
                  <div className="bg-white dark:bg-charcoal shadow-xl border border-charcoal/5 dark:border-offwhite/5 py-2">
                    {categories.filter(c => c.parent === 'Women').map(cat => (
                      <div key={cat._id}>
                        {cat.productCount === 0 ? (
                          <button onClick={() => setComingSoonToast(true)} className="w-full text-left px-6 py-3 text-xs uppercase tracking-widest text-charcoal/60 dark:text-offwhite/60 hover:text-gold hover:bg-charcoal/5 dark:hover:bg-offwhite/5 transition-colors">
                            {cat.name} <span className="ml-2 text-[8px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded">Soon</span>
                          </button>
                        ) : (
                          <Link to={`/collections?category=${cat.name}`} className="block px-6 py-3 text-xs uppercase tracking-widest text-charcoal dark:text-offwhite hover:text-gold hover:bg-charcoal/5 dark:hover:bg-offwhite/5 transition-colors">
                            {cat.name}
                          </Link>
                        )}
                      </div>
                    ))}
                    {categories.filter(c => c.parent === 'Women').length === 0 && (
                      <div className="px-6 py-3 text-xs text-charcoal/40 tracking-widest uppercase">More coming soon</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Men Dropdown */}
              <div className="relative group py-4">
                <Link 
                  to="/collections?category=Men" 
                  className={`text-[12px] uppercase tracking-[0.3em] font-medium hover:text-gold transition-all duration-300 relative text-charcoal dark:text-offwhite`}
                >
                  Men
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold transition-all duration-300 group-hover:w-full"></span>
                </Link>
                
                {/* Dropdown Menu */}
                <div className="absolute top-full left-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pt-2 min-w-[200px]">
                  <div className="bg-white dark:bg-charcoal shadow-xl border border-charcoal/5 dark:border-offwhite/5 py-2">
                    {categories.filter(c => c.parent === 'Men').map(cat => (
                      <div key={cat._id}>
                        {cat.productCount === 0 ? (
                          <button onClick={() => setComingSoonToast(true)} className="w-full text-left px-6 py-3 text-xs uppercase tracking-widest text-charcoal/60 dark:text-offwhite/60 hover:text-gold hover:bg-charcoal/5 dark:hover:bg-offwhite/5 transition-colors">
                            {cat.name} <span className="ml-2 text-[8px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded">Soon</span>
                          </button>
                        ) : (
                          <Link to={`/collections?category=${cat.name}`} className="block px-6 py-3 text-xs uppercase tracking-widest text-charcoal dark:text-offwhite hover:text-gold hover:bg-charcoal/5 dark:hover:bg-offwhite/5 transition-colors">
                            {cat.name}
                          </Link>
                        )}
                      </div>
                    ))}
                    {categories.filter(c => c.parent === 'Men').length === 0 && (
                      <div className="px-6 py-3 text-xs text-charcoal/40 tracking-widest uppercase">More coming soon</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="py-4">
                <Link 
                  to="/collections" 
                  className={`text-[12px] uppercase tracking-[0.3em] font-medium hover:text-gold transition-all duration-300 relative group text-charcoal dark:text-offwhite`}
                >
                  New Arrivals
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </div>
            </nav>

            {/* Center Logo */}
            <div className="flex-shrink-0 text-center">
              <Link to="/" className={`font-serif text-3xl md:text-5xl font-bold tracking-[0.25em] transition-all duration-500 text-charcoal dark:text-offwhite`}>
                SONISH
              </Link>
            </div>

            {/* Right Icons */}
            <div className="hidden md:flex flex-1 justify-end items-center space-x-8">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className={`transition-colors duration-300 text-charcoal dark:text-offwhite hover:text-gold`}>
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <Link to="/search" className={`transition-colors duration-300 text-charcoal dark:text-offwhite hover:text-gold`}>
                <Search className="h-5 w-5" />
              </Link>

              <Link to="/wishlist" className={`relative transition-colors duration-300 text-charcoal dark:text-offwhite hover:text-gold`}>
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-lg">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <button onClick={() => setIsCartOpen(true)} className={`relative transition-colors duration-300 text-charcoal dark:text-offwhite hover:text-gold`}>
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-charcoal dark:bg-gold text-white dark:text-charcoal text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-lg">
                    {cartCount}
                  </span>
                )}
              </button>

              {isLoggedIn ? (
                <Link to="/profile" className={`text-[10px] bg-charcoal dark:bg-offwhite text-white dark:text-charcoal px-5 py-2.5 uppercase tracking-[0.2em] font-bold transition-all duration-300 hover:bg-gold hover:text-white flex items-center gap-2 rounded-full`}>
                  <User className="w-3.5 h-3.5" /> Account
                </Link>
              ) : (
                <Link to="/login" className={`text-[11px] uppercase tracking-[0.25em] font-bold transition-colors duration-300 text-charcoal dark:text-offwhite hover:text-gold`}>
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-4">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className={'text-charcoal dark:text-offwhite'}>
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button onClick={() => setIsCartOpen(true)} className={`relative text-charcoal dark:text-offwhite`}>
                <ShoppingBag className="h-6 w-6" />
                <span className="absolute -top-1 -right-2 bg-gold text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">{cartCount}</span>
              </button>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={'text-charcoal dark:text-offwhite'}>
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-offwhite dark:bg-charcoal border-t border-gray-100 dark:border-offwhite/10 overflow-hidden"
            >
              <div className="px-6 py-12 space-y-8 flex flex-col items-center h-[80vh] overflow-y-auto">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-charcoal dark:text-offwhite text-lg uppercase tracking-[0.3em] font-serif hover:text-gold">Home</Link>
                
                <div className="w-full text-center space-y-4">
                  <Link to="/collections?category=Women" onClick={() => setIsMobileMenuOpen(false)} className="block text-charcoal dark:text-offwhite text-lg uppercase tracking-[0.3em] font-serif hover:text-gold">Women</Link>
                  <div className="flex flex-col gap-4">
                    {categories.filter(c => c.parent === 'Women').map(cat => (
                      <div key={cat._id} className="text-center">
                        {cat.productCount === 0 ? (
                          <button onClick={() => { setComingSoonToast(true); setIsMobileMenuOpen(false); }} className="text-charcoal/60 dark:text-offwhite/60 text-xs uppercase tracking-widest">
                            {cat.name} <span className="text-[8px] bg-amber-500/10 text-amber-600 px-1 py-0.5 rounded ml-1">Soon</span>
                          </button>
                        ) : (
                          <Link to={`/collections?category=${cat.name}`} onClick={() => setIsMobileMenuOpen(false)} className="text-charcoal/80 dark:text-offwhite/80 text-xs uppercase tracking-widest hover:text-gold">
                            {cat.name}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full text-center space-y-4">
                  <Link to="/collections?category=Men" onClick={() => setIsMobileMenuOpen(false)} className="block text-charcoal dark:text-offwhite text-lg uppercase tracking-[0.3em] font-serif hover:text-gold">Men</Link>
                  <div className="flex flex-col gap-4">
                    {categories.filter(c => c.parent === 'Men').map(cat => (
                      <div key={cat._id} className="text-center">
                        {cat.productCount === 0 ? (
                          <button onClick={() => { setComingSoonToast(true); setIsMobileMenuOpen(false); }} className="text-charcoal/60 dark:text-offwhite/60 text-xs uppercase tracking-widest">
                            {cat.name} <span className="text-[8px] bg-amber-500/10 text-amber-600 px-1 py-0.5 rounded ml-1">Soon</span>
                          </button>
                        ) : (
                          <Link to={`/collections?category=${cat.name}`} onClick={() => setIsMobileMenuOpen(false)} className="text-charcoal/80 dark:text-offwhite/80 text-xs uppercase tracking-widest hover:text-gold">
                            {cat.name}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Link to="/collections" onClick={() => setIsMobileMenuOpen(false)} className="text-charcoal dark:text-offwhite text-lg uppercase tracking-[0.3em] font-serif hover:text-gold">New Arrivals</Link>
                <div className="h-[1px] bg-charcoal/10 dark:bg-offwhite/10 w-1/4"></div>
                {isLoggedIn ? (
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-charcoal dark:text-offwhite text-sm uppercase tracking-widest font-bold hover:text-gold">Account</Link>
                ) : (
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-charcoal dark:text-offwhite text-sm uppercase tracking-widest font-bold hover:text-gold">Login</Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Coming Soon Toast */}
      <AnimatePresence>
        {comingSoonToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-charcoal dark:bg-offwhite text-white dark:text-charcoal px-6 py-3 rounded-full text-xs uppercase tracking-widest font-bold shadow-2xl flex items-center gap-3"
          >
            <span>Coming Soon! We're crafting something special.</span>
            <button onClick={() => setComingSoonToast(false)} className="opacity-50 hover:opacity-100"><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;