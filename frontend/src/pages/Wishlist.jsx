import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import { loadWishlist as loadWishlistFromStorage, saveWishlist } from '../utils/cartStorage';

const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);

    const refreshWishlist = () => {
        setWishlistItems(loadWishlistFromStorage());
    };

    useEffect(() => {
        refreshWishlist();
        window.addEventListener('wishlistUpdated', refreshWishlist);
        return () => window.removeEventListener('wishlistUpdated', refreshWishlist);
    }, []);

    const clearWishlist = () => {
        saveWishlist([]);
        setWishlistItems([]);
        window.dispatchEvent(new Event('wishlistUpdated'));
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-offwhite dark:bg-charcoal min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 transition-colors duration-300"
        >
            <div className="max-w-7xl mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-serif text-charcoal dark:text-offwhite tracking-wide mb-4">My Wishlist</h1>
                    <div className="w-16 h-px bg-charcoal/30 dark:bg-offwhite/30 mx-auto"></div>
                </div>

                {wishlistItems.length > 0 ? (
                    <>
                        <div className="flex justify-end mb-8">
                            <button
                                onClick={clearWishlist}
                                className="text-xs uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 hover:text-red-500 transition-colors flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" /> Clear All
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {wishlistItems.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-charcoal/5 dark:bg-offwhite/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-10 h-10 text-charcoal/20 dark:text-offwhite/20" />
                        </div>
                        <p className="text-xl font-serif text-charcoal dark:text-offwhite mb-4">Your wishlist is empty</p>
                        <p className="text-charcoal/60 dark:text-offwhite/60 mb-8 max-w-md mx-auto">
                            Save your favorite pieces here to keep an eye on them.
                        </p>
                        <Link
                            to="/collections"
                            className="inline-block bg-charcoal dark:bg-offwhite text-white dark:text-charcoal px-10 py-4 text-xs uppercase tracking-widest hover:bg-black dark:hover:bg-white transition-colors"
                        >
                            Explore Collections
                        </Link>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Wishlist;