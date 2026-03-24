import { useState, useEffect } from 'react';
import ProductCard from '../product/ProductCard';
import ProductSkeleton from '../product/ProductSkeleton';
import { motion } from 'framer-motion';
import API from '../../utils/api';

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API}/api/products`);
        if (res.ok) {
          const data = await res.json();
          // Using 5 items to showcase the asymmetric grid perfectly
          setProducts(data.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Add a slight delay just for visual effect
    setTimeout(() => {
      fetchProducts();
    }, 500);
  }, []);

  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col items-center justify-center text-center mb-20">
        <span className="text-[10px] tracking-[0.4em] uppercase text-charcoal/40 dark:text-offwhite/40 mb-4 block font-bold">Curated Selection</span>
        <h2 className="text-4xl md:text-6xl font-serif text-charcoal dark:text-offwhite tracking-tight mb-8">The Seasonal Edit</h2>
        <div className="w-16 h-[1px] bg-gold/50 mb-12"></div>
        
        {/* Featured Section Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="w-full h-[400px] mb-20 overflow-hidden relative group"
        >
          <img 
            src="/Users/kushagrasachdeva/.gemini/antigravity/brain/e8db3940-bdd8-4f8b-96cb-5591e2fa4061/new_arrivals_featured_1774360000000_1774360060135.png" 
            alt="New Arrivals Featured" 
            className="w-full h-full object-cover object-center grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-charcoal/20 group-hover:bg-transparent transition-colors duration-1000" />
          <div className="absolute bottom-10 left-10 text-left">
            <p className="text-white text-[10px] uppercase tracking-[0.5em] font-bold mb-2">Summer '26</p>
            <h3 className="text-white text-4xl font-serif italic">Modern Minimalist</h3>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 auto-rows-[450px]"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, staggerChildren: 0.2 }}
      >
        {isLoading
          ? // Render skeletons. First one spans 2 cols & 2 rows on large screens
            Array.from({ length: 5 }).map((_, idx) => (
              <div 
                key={idx} 
                className={idx === 0 ? "lg:col-span-2 lg:row-span-2" : "col-span-1 row-span-1"}
              >
                <ProductSkeleton isFeatured={idx === 0} />
              </div>
            ))
          : // Render actual products
            products.map((product, index) => (
              <motion.div
                key={product._id || product.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={index === 0 ? "lg:col-span-2 lg:row-span-2" : "col-span-1 row-span-1"}
              >
                <ProductCard product={product} isFeatured={index === 0} />
              </motion.div>
            ))}
      </motion.div>
      
      <div className="mt-20 text-center">
        <button className="px-10 py-4 bg-charcoal text-white text-xs uppercase tracking-widest hover:bg-black transition-colors duration-300">
          Shop The Collection
        </button>
      </div>
    </section>
  );
};

export default NewArrivals;
