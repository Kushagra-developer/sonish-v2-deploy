import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '../components/product/ProductCard';
import ProductSkeleton from '../components/product/ProductSkeleton';
import API from '../utils/api';

const Collections = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const categoryFilter = searchParams.get('category');

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${API}/api/products`);
                if (res.ok) {
                    let data = await res.json();

                    // --- SMART FILTERING ENGINE ---
                    if (categoryFilter) {
                        const filterLower = categoryFilter.toLowerCase();

                        data = data.filter(item => {
                            const itemCat = (item.category || '').toLowerCase();
                            const itemName = (item.name || '').toLowerCase();
                            const itemTags = item.tags ? item.tags.map(t => t.toLowerCase()) : [];

                            // If filtering for "Women", broadly accept women's categories
                            if (filterLower === 'women') {
                                return itemCat.includes('women') ||
                                    itemTags.includes('women') ||
                                    ['dress', 'skirt', 'top', 'co-ord', 'kurti', 'women'].some(kw => itemCat.includes(kw) || itemName.includes(kw));
                            }

                            // Default strict matching for Accessories, Outerwear, etc.
                            return itemCat === filterLower || itemTags.includes(filterLower);
                        });
                    }

                    setProducts(data);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [categoryFilter]);

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
                    <h1 className="text-4xl md:text-5xl font-serif text-charcoal dark:text-offwhite tracking-wide mb-4 transition-colors">
                        {categoryFilter ? `${categoryFilter}'s Collection` : 'All Collections'}
                    </h1>
                    <div className="w-16 h-px bg-charcoal/30 dark:bg-offwhite/30 mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {isLoading ? (
                        Array.from({ length: 8 }).map((_, idx) => <ProductSkeleton key={idx} />)
                    ) : products.length > 0 ? (
                        products.map((product) => <ProductCard key={product._id || product.id} product={product} />)
                    ) : (
                        <div className="col-span-full text-center py-20 text-charcoal/60 dark:text-offwhite/60">
                            <p className="text-xl font-serif">No products found in this category.</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Collections;