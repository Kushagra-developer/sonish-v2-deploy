import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, ChevronDown, Heart, Moon, Sun, User } from 'lucide-react';
import CartDrawer from './CartDrawer';
import { motion, AnimatePresence } from 'framer-motion';
import { loadCart, loadWishlist } from '../../utils/cartStorage';
import API from '../../utils/api';
import { authFetch } from '../../utils/authFetch';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // 1. Toggle dark mode class on the HTML document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // 2. Sync Cart & Wishlist counters + Listen for auto-open trigger
  useEffect(() => {
    const updateCounts = () => {
      const cart = loadCart();
      const wishlist = loadWishlist();
      const totalItems = cart.reduce((acc, item) => acc + (item.cartQuantity || 1), 0);
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

    updateCounts();
    syncCloudData(); // Pull down the latest from MongoDB on mount

    // Custom Event Listeners for real-time updates without refresh
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

  const isSolid = !isHomePage || isScrolled || activeMegaMenu;

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ease-in-out ${isSolid
          ? 'bg-offwhite/95 dark:bg-charcoal/95 backdrop-blur-md shadow-sm py-4 dark:border-b dark:border-offwhite/10'
          : 'bg-transparent py-6'
          }`}
        onMouseLeave={() => setActiveMegaMenu(false)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">

            {/* Left Navigation */}
            <nav className="hidden md:flex flex-1 space-x-8 items-center">
              <Link to="/collections?category=Women" className={`text-[11px] uppercase tracking-[0.2em] hover:text-gold transition-colors duration-200 ${isSolid ? 'text-charcoal dark:text-offwhite' : 'text-white'}`}>Women</Link>
              <div className="h-full py-4 flex items-center cursor-pointer" onMouseEnter={() => setActiveMegaMenu(true)}>
                <span className={`flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] hover:text-gold transition-colors duration-200 ${isSolid ? 'text-charcoal dark:text-offwhite' : 'text-white'}`}>
                  Collections <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${activeMegaMenu ? 'rotate-180' : ''}`} />
                </span>
              </div>
            </nav>

            {/* Center Logo */}
            <div className="flex-shrink-0 text-center">
              <Link to="/" className={`font-serif text-3xl md:text-4xl font-bold tracking-[0.2em] transition-colors duration-200 ${isSolid ? 'text-charcoal dark:text-offwhite' : 'text-white'}`}>
                SONISH
              </Link>
            </div>

            {/* Right Icons */}
            <div className="hidden md:flex flex-1 justify-end items-center space-x-6">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className={`transition-colors duration-200 ${isSolid ? 'text-charcoal dark:text-offwhite' : 'text-white'} hover:text-gold`}>
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <Link to="/search" className={`transition-colors duration-200 ${isSolid ? 'text-charcoal dark:text-offwhite' : 'text-white'} hover:text-gold`}>
                <Search className="h-5 w-5" />
              </Link>

              <Link to="/wishlist" className={`relative transition-colors duration-200 ${isSolid ? 'text-charcoal dark:text-offwhite' : 'text-white'} hover:text-gold`}>
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <button onClick={() => setIsCartOpen(true)} className={`relative transition-colors duration-200 ${isSolid ? 'text-charcoal dark:text-offwhite' : 'text-white'} hover:text-gold`}>
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-charcoal dark:bg-gold text-white dark:text-charcoal text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>

              {isLoggedIn ? (
                <Link to="/profile" className={`text-[11px] uppercase tracking-[0.2em] font-medium transition-colors duration-200 ${isSolid ? 'text-charcoal dark:text-offwhite' : 'text-white'} hover:text-gold flex items-center gap-1`}>
                  <User className="w-4 h-4" /> Account
                </Link>
              ) : (
                <Link to="/login" className={`text-[11px] uppercase tracking-[0.2em] font-medium transition-colors duration-200 ${isSolid ? 'text-charcoal dark:text-offwhite' : 'text-white'} hover:text-gold`}>
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-4">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className={isSolid ? 'text-charcoal dark:text-offwhite' : 'text-white'}>
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button onClick={() => setIsCartOpen(true)} className={`relative ${isSolid ? 'text-charcoal dark:text-offwhite' : 'text-white'}`}>
                <ShoppingBag className="h-6 w-6" />
                <span className="absolute -top-1 -right-2 bg-gold text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">{cartCount}</span>
              </button>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={isSolid ? 'text-charcoal dark:text-offwhite' : 'text-white'}>
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Editorial Mega Menu Panel */}
        <AnimatePresence>
          {activeMegaMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 w-full bg-offwhite/95 dark:bg-charcoal/95 backdrop-blur-xl border-t border-charcoal/10 dark:border-offwhite/10 shadow-xl"
              onMouseLeave={() => setActiveMegaMenu(false)}
            >
              <div className="max-w-7xl mx-auto px-8 py-12 flex gap-16">
                <div className="flex-1 grid grid-cols-3 gap-8">
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 mb-6">Ready to Wear</h3>
                    <ul className="space-y-4 text-sm text-charcoal dark:text-offwhite">
                      <li><Link to="/collections?category=Outerwear" className="hover:text-gold transition-colors">Outerwear</Link></li>
                      <li><Link to="/collections?category=Knitwear" className="hover:text-gold transition-colors">Knitwear</Link></li>
                      <li><Link to="/collections?category=Dresses" className="hover:text-gold transition-colors">Dresses</Link></li>
                      <li><Link to="/collections?category=Tailoring" className="hover:text-gold transition-colors">Tailoring</Link></li>
                      <li><Link to="/collections?category=Denim" className="hover:text-gold transition-colors">Denim</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 mb-6">Accessories</h3>
                    <ul className="space-y-4 text-sm text-charcoal dark:text-offwhite">
                      <li><Link to="/collections?category=Bags" className="hover:text-gold transition-colors">Bags</Link></li>
                      <li><Link to="/collections?category=Shoes" className="hover:text-gold transition-colors">Shoes</Link></li>
                      <li><Link to="/collections?category=Jewelry" className="hover:text-gold transition-colors">Jewelry</Link></li>
                      <li><Link to="/collections?category=Sunglasses" className="hover:text-gold transition-colors">Sunglasses</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 mb-6">Curated</h3>
                    <ul className="space-y-4 text-sm text-charcoal dark:text-offwhite">
                      <li><Link to="/collections" className="hover:text-gold transition-colors flex items-center gap-2">New Arrivals <span className="bg-gold text-white text-[9px] px-1.5 py-0.5 rounded-sm">NEW</span></Link></li>
                      <li><Link to="/collections" className="hover:text-gold transition-colors">Bestsellers</Link></li>
                      <li><Link to="/collections" className="hover:text-gold transition-colors">The Gift Guide</Link></li>
                    </ul>
                  </div>
                </div>
                <div className="w-[400px] h-[300px] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-charcoal/20 group-hover:bg-charcoal/30 transition-colors duration-500 z-10" />
                  <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop" alt="The Winter Edit" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  <div className="absolute bottom-6 left-6 z-20">
                    <span className="text-white text-[10px] uppercase tracking-widest mb-1 block">Featured</span>
                    <h4 className="text-white font-serif text-2xl tracking-wide mb-2">The Winter Edit</h4>
                    <Link to="/collections" className="text-white text-xs border-b border-white/50 hover:border-white pb-0.5 transition-colors">Explore</Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-offwhite dark:bg-charcoal absolute top-full left-0 w-full shadow-lg border-t border-gray-100 dark:border-offwhite/10">
            <div className="px-4 py-8 space-y-6 flex flex-col items-center">
              <Link to="/collections?category=Women" className="text-charcoal dark:text-offwhite text-lg uppercase tracking-widest w-full text-center hover:text-gold">Women</Link>
              <Link to="/collections" className="text-charcoal dark:text-offwhite text-lg uppercase tracking-widest w-full text-center hover:text-gold">Collections</Link>
              <div className="h-px bg-gray-200 dark:bg-offwhite/20 w-1/3 my-2"></div>
              {isLoggedIn ? (
                <Link to="/profile" className="text-charcoal dark:text-offwhite text-sm uppercase tracking-widest hover:text-gold">Account</Link>
              ) : (
                <Link to="/login" className="text-charcoal dark:text-offwhite text-sm uppercase tracking-widest hover:text-gold">Login</Link>
              )}
            </div>
          </div>
        )}
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;