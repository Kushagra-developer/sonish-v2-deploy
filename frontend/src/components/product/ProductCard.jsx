import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, isFeatured = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Dynamic height based on layout context
  const heightClass = isFeatured ? 'h-full min-h-[450px]' : 'h-[450px]';

  // --- FUNCTIONAL ADD TO CART ENGINE ---
  const handleQuickAdd = (e) => {
    e.preventDefault(); // Prevents routing to the product page

    const cart = JSON.parse(localStorage.getItem('sonish_cart')) || [];
    const cartItem = {
      ...product,
      selectedSize: 'S', // Default size for Quick Add
      cartQuantity: 1
    };

    // Update quantity if item exists, else push new
    const existingIndex = cart.findIndex(item => item._id === product._id && item.selectedSize === 'S');
    if (existingIndex >= 0) {
      cart[existingIndex].cartQuantity += 1;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem('sonish_cart', JSON.stringify(cart));

    // Trigger Global UI Events
    window.dispatchEvent(new Event('cartUpdated')); // Updates Navbar counter
    window.dispatchEvent(new Event('openCart'));    // Slides open the Cart Drawer
  };

  return (
    <div
      className="group relative flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container - Structural fix for the overlapping glitch */}
      <div className={`relative overflow-hidden bg-gray-100 dark:bg-charcoal/20 mb-4 block ${heightClass}`}>
        <Link to={`/product/${product._id || product.id}`} className="w-full h-full">
          {/* Primary Image */}
          <motion.img
            initial={false}
            animate={{
              scale: isHovered ? 1.05 : 1,
              opacity: isHovered && product.secondaryImage ? 0 : 1
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            src={product.image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover object-center z-10"
          />

          {/* Secondary Hover Image */}
          {product.secondaryImage && (
            <motion.img
              initial={{ opacity: 0, scale: 1 }}
              animate={{
                scale: isHovered ? 1.05 : 1,
                opacity: isHovered ? 1 : 0
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              src={product.secondaryImage}
              alt={`${product.name} Alternate View`}
              className="absolute inset-0 w-full h-full object-cover object-center z-20"
            />
          )}
        </Link>

        {/* QUICK ADD Button - Fixed within the Image Container bounds */}
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: isHovered ? 0 : "100%", opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-0 left-0 w-full z-30"
        >
          <button
            onClick={handleQuickAdd}
            className="w-full bg-white/90 dark:bg-charcoal/90 backdrop-blur-md text-charcoal dark:text-offwhite py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-gold hover:text-white dark:hover:bg-gold transition-colors duration-300 shadow-sm"
          >
            Quick Add
          </button>
        </motion.div>
      </div>

      {/* Product Details - Now protected from overlapping */}
      <div className="flex flex-col space-y-1 transition-colors duration-300">
        <span className="text-[10px] text-charcoal/40 dark:text-offwhite/40 uppercase tracking-widest font-medium">
          {product.brand || 'Sonish Collection'}
        </span>
        <Link
          to={`/product/${product._id || product.id}`}
          className="text-sm font-medium text-charcoal dark:text-offwhite hover:text-gold transition-colors line-clamp-1"
        >
          {product.name}
        </Link>
        <span className="text-sm text-charcoal dark:text-offwhite font-serif tracking-wide">
          ₹{(product?.price || 0).toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default ProductCard;