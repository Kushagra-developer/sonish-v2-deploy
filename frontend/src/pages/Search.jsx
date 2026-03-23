import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, X } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import API from '../utils/api';

const Search = () => {
    const [query, setQuery] = useState('');
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch all products on mount so we can filter them instantly
    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${API}/api/products`);
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Filter products based on the search query
    const filteredProducts = products.filter(product =>
        (product.name?.toLowerCase() || '').includes(query.toLowerCase()) ||
        (product.category?.toLowerCase() || '').includes(query.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen pt-40 pb-24 px-4 sm:px-6 lg:px-8 bg-offwhite dark:bg-charcoal transition-colors duration-300"
        >
            <div className="max-w-7xl mx-auto">

                {/* Search Input Area */}
                <div className="max-w-3xl mx-auto mb-16 relative">
                    <SearchIcon className="absolute left-0 top-1/2 transform -translate-y-1/2 w-8 h-8 text-charcoal/40 dark:text-offwhite/40" />
                    <input
                        type="text"
                        placeholder="Search for products, categories, or styles..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                        className="w-full bg-transparent border-b-2 border-charcoal/20 dark:border-offwhite/20 py-6 pl-12 pr-12 text-2xl md:text-4xl font-serif text-charcoal dark:text-offwhite outline-none focus:border-charcoal dark:focus:border-offwhite transition-colors placeholder:text-charcoal/20 dark:placeholder:text-offwhite/20"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 text-charcoal/40 dark:text-offwhite/40 hover:text-charcoal dark:hover:text-offwhite transition-colors"
                        >
                            <X className="w-8 h-8" />
                        </button>
                    )}
                </div>

                {/* Search Results */}
                {query.length > 0 && (
                    <div className="mb-8 text-sm text-charcoal/60 dark:text-offwhite/60 tracking-widest uppercase text-center">
                        {filteredProducts.length} Results Found
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {isLoading ? (
                        <div className="col-span-full text-center text-charcoal/60 dark:text-offwhite/60">Loading products...</div>
                    ) : query.length > 0 && filteredProducts.length === 0 ? (
                        <div className="col-span-full text-center py-20">
                            <p className="text-2xl font-serif text-charcoal dark:text-offwhite mb-4">No results found for "{query}"</p>
                            <p className="text-charcoal/60 dark:text-offwhite/60 font-light">Try checking your spelling or using more general terms.</p>
                        </div>
                    ) : query.length > 0 ? (
                        filteredProducts.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))
                    ) : null}
                </div>

            </div>
        </motion.div>
    );
};

export default Search;