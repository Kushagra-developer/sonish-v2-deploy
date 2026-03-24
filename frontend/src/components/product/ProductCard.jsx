import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { loadCart, saveCart, loadWishlist, saveWishlist } from '../../utils/cartStorage';

const ProductCard = ({ product, isFeatured = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const navigate = useNavigate();

  // If there's no product data, don't crash the app
  if (!product) return null;

  const heightClass = isFeatured ? 'h-[600px]' : 'h-[450px]';

  // Build gallery from images array or fallback to single image
  const gallery = (product.images && product.images.length > 0)
    ? product.images
    : [product.image].filter(Boolean);

  // Check wishlist status on mount
  useEffect(() => {
    const wishlist = loadWishlist();
    setIsWishlisted(wishlist.some(item => item._id === product._id));
  }, [product._id]);

  // Auto-slideshow on hover
  useEffect(() => {
    if (!isHovered || gallery.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % gallery.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isHovered, gallery.length]);

  // Reset slide when not hovered
  useEffect(() => {
    if (!isHovered) setCurrentSlide(0);
  }, [isHovered]);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      alert('Please log in to add items to your cart.');
      navigate('/login');
      return;
    }

    const cart = loadCart();
    const cartItem = { ...product, selectedSize: 'S', qty: 1 };

    const existingIndex = cart.findIndex(item => item._id === product._id && item.selectedSize === 'S');
    if (existingIndex >= 0) {
      cart[existingIndex].qty += 1;
    } else {
      cart.push(cartItem);
    }

    saveCart(cart);
    window.dispatchEvent(new Event('cartUpdated'));
    window.dispatchEvent(new Event('openCart'));
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      alert('Please log in to add items to your wishlist.');
      navigate('/login');
      return;
    }

    let wishlist = loadWishlist();
    if (isWishlisted) {
      wishlist = wishlist.filter(item => item._id !== product._id);
      setIsWishlisted(false);
    } else {
      wishlist.push(product);
      setIsWishlisted(true);
    }
    saveWishlist(wishlist);
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  const nextSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide(prev => (prev + 1) % gallery.length);
  };

  const prevSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide(prev => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  // Calculate discount percentage
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div
      className="group relative flex flex-col w-full h-full bg-white dark:bg-charcoal/80 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Area */}
      <div className={`relative overflow-hidden bg-gray-100 dark:bg-charcoal/20 block w-full ${heightClass}`}>
        <Link to={`/product/${product._id || product.id}`} className="w-full h-full block">

          {/* Image Slideshow */}
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.6 }}
              transition={{ duration: 0.4 }}
              src={gallery[currentSlide] || '/images/placeholder.jpg'}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
          </AnimatePresence>

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 z-30 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1">
              -{discount}%
            </div>
          )}

          {/* Wishlist Heart */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-3 right-3 z-30 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
              isWishlisted
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-white/80 dark:bg-charcoal/80 text-charcoal dark:text-offwhite hover:bg-white dark:hover:bg-charcoal shadow-md'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

        </Link>

        {/* Slide Navigation Arrows (on hover, if multiple images) */}
        {isHovered && gallery.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-white/80 dark:bg-charcoal/80 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-charcoal transition-colors shadow-md"
            >
              <ChevronLeft className="w-4 h-4 text-charcoal dark:text-offwhite" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-white/80 dark:bg-charcoal/80 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-charcoal transition-colors shadow-md"
            >
              <ChevronRight className="w-4 h-4 text-charcoal dark:text-offwhite" />
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {gallery.length > 1 && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
            {gallery.slice(0, 5).map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentSlide(idx); }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx
                    ? 'bg-white w-4 shadow-sm'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
            {gallery.length > 5 && (
              <span className="text-white/50 text-[8px] leading-none self-center">+{gallery.length - 5}</span>
            )}
          </div>
        )}

        {/* Quick Add Overlay */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: isHovered ? 0 : "100%" }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-0 left-0 w-full z-30"
        >
          <button
            onClick={handleQuickAdd}
            className="w-full bg-white/95 dark:bg-charcoal/95 backdrop-blur-md text-charcoal dark:text-offwhite py-4 text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-gold hover:text-white transition-all duration-300"
          >
            Quick Add +
          </button>
        </motion.div>
      </div>

      {/* Product Info */}
      <div className="px-1 pt-4 pb-3 flex flex-col gap-1">
        <Link to={`/product/${product._id || product.id}`}>
          <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40 dark:text-offwhite/40">
            {product.category || product.brand || 'Sonish'}
          </p>
          <h3 className="text-sm font-medium text-charcoal dark:text-offwhite leading-snug line-clamp-1 mt-0.5">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-sm font-serif text-charcoal dark:text-offwhite font-medium">
              ₹{(product.price || 0).toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs font-serif text-charcoal/40 dark:text-offwhite/40 line-through">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;