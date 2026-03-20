import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, Truck, RefreshCw, Star, Minus, Plus, ShieldCheck, X } from 'lucide-react';
import ProductSkeleton from '../components/product/ProductSkeleton';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mainImage, setMainImage] = useState('');

    // Interactive States
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('S');
    const [activeTab, setActiveTab] = useState('description');
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showSizeGuide, setShowSizeGuide] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setProduct(data);
                    setMainImage(data.image);

                    // Check if already in wishlist
                    const wishlist = JSON.parse(localStorage.getItem('sonish_wishlist')) || [];
                    if (wishlist.some(item => item._id === data._id)) {
                        setIsWishlisted(true);
                    }
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    // --- FUNCTIONAL ACTIONS ---

    const handleAddToCart = () => {
        const cart = JSON.parse(localStorage.getItem('sonish_cart')) || [];
        const cartItem = {
            ...product,
            selectedSize,
            cartQuantity: quantity
        };

        const existingIndex = cart.findIndex(item => item._id === product._id && item.selectedSize === selectedSize);
        if (existingIndex >= 0) {
            cart[existingIndex].cartQuantity += quantity;
        } else {
            cart.push(cartItem);
        }

        localStorage.setItem('sonish_cart', JSON.stringify(cart));

        // Tell the whole app the cart updated
        window.dispatchEvent(new Event('cartUpdated'));
        // Tell the Navbar to slide the drawer open!
        window.dispatchEvent(new Event('openCart'));
    };

    const handleToggleWishlist = () => {
        let wishlist = JSON.parse(localStorage.getItem('sonish_wishlist')) || [];
        if (isWishlisted) {
            wishlist = wishlist.filter(item => item._id !== product._id);
            setIsWishlisted(false);
        } else {
            wishlist.push(product);
            setIsWishlisted(true);
        }
        localStorage.setItem('sonish_wishlist', JSON.stringify(wishlist));
        window.dispatchEvent(new Event('wishlistUpdated'));
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: product.name, url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Product link copied to clipboard!');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-offwhite dark:bg-charcoal">
                <div className="w-full md:w-1/2 h-[600px]"><ProductSkeleton /></div>
            </div>
        );
    }

    if (!product) return <div className="text-center pt-40 dark:text-white">Product not found.</div>;

    const galleryImages = [product.image, product.secondaryImage].filter(Boolean);
    const sizes = ['XS', 'S', 'M', 'L', 'XL'];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-offwhite dark:bg-charcoal min-h-screen pt-32 pb-32 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative"
        >
            <div className="max-w-7xl mx-auto">

                {/* Breadcrumbs */}
                <div className="text-xs tracking-wider text-charcoal/50 dark:text-offwhite/50 mb-8 flex gap-2">
                    <Link to="/" className="hover:text-gold">Home</Link> /
                    <Link to="/collections" className="hover:text-gold">Shop</Link> /
                    <span className="text-charcoal dark:text-offwhite">{product.name}</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">

                    {/* Left: Image Gallery */}
                    <div className="flex-1 flex gap-4 md:gap-6 flex-col-reverse md:flex-row">
                        <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible no-scrollbar w-full md:w-20 lg:w-24 shrink-0">
                            {galleryImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setMainImage(img)}
                                    className={`relative aspect-[3/4] overflow-hidden bg-gray-100 ${mainImage === img ? 'border border-charcoal dark:border-offwhite' : 'opacity-70 hover:opacity-100'} transition-all`}
                                >
                                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 aspect-[3/4] bg-gray-100 relative overflow-hidden group">
                            <img src={mainImage} alt={product.name} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                        </div>
                    </div>

                    {/* Right: Product Details */}
                    <div className="flex-1 flex flex-col pt-2 lg:pt-10">
                        <div className="flex items-center gap-4 mb-2">
                            <span className="text-xs uppercase tracking-widest text-charcoal/60 dark:text-offwhite/60">{product.category || 'Collection'}</span>
                            <div className="flex items-center text-gold">
                                {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                                <span className="text-charcoal/50 dark:text-offwhite/50 text-xs ml-2">(1 review)</span>
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-serif text-charcoal dark:text-offwhite mb-4">{product.name}</h1>

                        <div className="flex items-center gap-4 mb-8">
                            <span className="text-lg text-charcoal/50 dark:text-offwhite/50 line-through font-serif">₹{(product.price * 1.3).toFixed(2)}</span>
                            <span className="text-2xl text-red-600 dark:text-red-400 font-serif font-medium">₹{product.price.toFixed(2)}</span>
                        </div>

                        {/* Size Selector */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm text-charcoal dark:text-offwhite tracking-wide">Select Size</span>
                                <button onClick={() => setShowSizeGuide(true)} className="text-xs text-charcoal/60 dark:text-offwhite/60 underline hover:text-gold">Size Guide</button>
                            </div>
                            <div className="flex gap-3">
                                {sizes.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`w-12 h-12 flex items-center justify-center text-xs tracking-widest transition-all ${selectedSize === size ? 'border-2 border-charcoal dark:border-offwhite text-charcoal dark:text-offwhite font-bold' : 'border border-charcoal/20 dark:border-offwhite/20 text-charcoal/60 dark:text-offwhite/60 hover:border-charcoal dark:hover:border-offwhite'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-10">
                            <div className="flex items-center border border-charcoal/20 dark:border-offwhite/20 px-4 h-14 w-full sm:w-32 justify-between">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-charcoal/50 dark:text-offwhite/50 hover:text-charcoal dark:hover:text-offwhite"><Minus className="w-4 h-4" /></button>
                                <span className="text-charcoal dark:text-offwhite font-medium">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="text-charcoal/50 dark:text-offwhite/50 hover:text-charcoal dark:hover:text-offwhite"><Plus className="w-4 h-4" /></button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-charcoal dark:bg-offwhite text-white dark:text-charcoal h-14 text-xs uppercase tracking-widest hover:bg-black dark:hover:bg-white transition-colors flex items-center justify-center gap-2"
                            >
                                Add to Cart <span className="text-white/50 dark:text-charcoal/50">- ₹{(product.price * quantity).toFixed(2)}</span>
                            </button>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleToggleWishlist}
                                    className={`h-14 w-14 border border-charcoal/20 dark:border-offwhite/20 flex items-center justify-center transition-colors ${isWishlisted ? 'text-red-500 border-red-500' : 'text-charcoal dark:text-offwhite hover:border-charcoal dark:hover:border-offwhite'}`}
                                >
                                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="h-14 w-14 border border-charcoal/20 dark:border-offwhite/20 flex items-center justify-center text-charcoal dark:text-offwhite hover:border-charcoal dark:hover:border-offwhite transition-colors"
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="border border-charcoal/10 dark:border-offwhite/10 p-4 flex flex-col items-center justify-center text-center gap-2">
                                <Truck className="w-6 h-6 text-charcoal/70 dark:text-offwhite/70" />
                                <span className="text-xs text-charcoal/80 dark:text-offwhite/80">Estimate delivery: 7-8 days.</span>
                            </div>
                            <div className="border border-charcoal/10 dark:border-offwhite/10 p-4 flex flex-col items-center justify-center text-center gap-2">
                                <RefreshCw className="w-6 h-6 text-charcoal/70 dark:text-offwhite/70" />
                                <span className="text-xs text-charcoal/80 dark:text-offwhite/80">Return within 7 days.</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-charcoal/60 dark:text-offwhite/60">
                            <ShieldCheck className="w-4 h-4" /> <span>Guarantee Safe Checkout</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mt-24">
                    <div className="flex border-b border-charcoal/10 dark:border-offwhite/10 gap-8 mb-8 overflow-x-auto no-scrollbar">
                        {['description', 'additional information', 'reviews (1)'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-sm uppercase tracking-widest whitespace-nowrap transition-colors ${activeTab === tab ? 'border-b-2 border-charcoal dark:border-offwhite text-charcoal dark:text-offwhite font-medium' : 'text-charcoal/50 dark:text-offwhite/50 hover:text-charcoal dark:hover:text-offwhite'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="text-charcoal/80 dark:text-offwhite/80 font-light text-sm md:text-base leading-relaxed space-y-6 max-w-4xl min-h-[200px]">
                        {activeTab === 'description' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                {product.description ? (
                                    <div dangerouslySetInnerHTML={{ __html: product.description }} className="space-y-4 [&>p]:mb-4" />
                                ) : (
                                    <p>Upgrade your wardrobe with this fashion-forward item, designed for effortless style and comfort.</p>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'additional information' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <table className="w-full max-w-lg text-left text-sm border-collapse">
                                    <tbody>
                                        <tr className="border-b border-charcoal/10 dark:border-offwhite/10"><th className="py-3 font-medium">Weight</th><td className="py-3">0.5 kg</td></tr>
                                        <tr className="border-b border-charcoal/10 dark:border-offwhite/10"><th className="py-3 font-medium">Dimensions</th><td className="py-3">30 × 20 × 5 cm</td></tr>
                                        <tr className="border-b border-charcoal/10 dark:border-offwhite/10"><th className="py-3 font-medium">Materials</th><td className="py-3">Imported Premium Fabric</td></tr>
                                    </tbody>
                                </table>
                            </motion.div>
                        )}

                        {activeTab === 'reviews (1)' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                                {/* Existing Review */}
                                <div className="flex gap-4 border-b border-charcoal/10 dark:border-offwhite/10 pb-8">
                                    <div className="w-12 h-12 bg-charcoal/10 dark:bg-offwhite/10 rounded-full flex items-center justify-center font-serif text-xl text-charcoal dark:text-offwhite">S</div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium text-charcoal dark:text-offwhite">Sarah M.</h4>
                                            <div className="flex text-gold"><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /></div>
                                        </div>
                                        <span className="text-xs text-charcoal/50 dark:text-offwhite/50 block mb-3">Verified Buyer - March 15, 2026</span>
                                        <p className="text-charcoal/80 dark:text-offwhite/80">Absolutely love the fit and the material. True to size and looks extremely premium in person. The golden floral pattern catches the light beautifully. Highly recommend!</p>
                                    </div>
                                </div>

                                {/* Write a Review Form */}
                                <div className="bg-white dark:bg-charcoal/50 p-6 md:p-8 border border-charcoal/10 dark:border-offwhite/10">
                                    <h3 className="text-xl font-serif text-charcoal dark:text-offwhite mb-6">Leave a Review</h3>
                                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Review submitted for moderation!"); }}>
                                        <div>
                                            <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-2">Your Rating</label>
                                            <div className="flex text-charcoal/20 dark:text-offwhite/20 hover:text-gold cursor-pointer transition-colors w-max"><Star className="w-5 h-5" /><Star className="w-5 h-5" /><Star className="w-5 h-5" /><Star className="w-5 h-5" /><Star className="w-5 h-5" /></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <input type="text" placeholder="Name *" required className="w-full bg-transparent border-b border-charcoal/20 dark:border-offwhite/20 py-2 outline-none focus:border-charcoal dark:focus:border-offwhite text-charcoal dark:text-offwhite placeholder:text-charcoal/40 dark:placeholder:text-offwhite/40" />
                                            </div>
                                            <div>
                                                <input type="email" placeholder="Email *" required className="w-full bg-transparent border-b border-charcoal/20 dark:border-offwhite/20 py-2 outline-none focus:border-charcoal dark:focus:border-offwhite text-charcoal dark:text-offwhite placeholder:text-charcoal/40 dark:placeholder:text-offwhite/40" />
                                            </div>
                                        </div>
                                        <div>
                                            <textarea placeholder="Your Review *" required rows="4" className="w-full bg-transparent border-b border-charcoal/20 dark:border-offwhite/20 py-2 outline-none focus:border-charcoal dark:focus:border-offwhite text-charcoal dark:text-offwhite placeholder:text-charcoal/40 dark:placeholder:text-offwhite/40 resize-none"></textarea>
                                        </div>
                                        <button type="submit" className="bg-charcoal dark:bg-offwhite text-white dark:text-charcoal px-8 py-3 text-xs uppercase tracking-widest hover:bg-black dark:hover:bg-white transition-colors mt-2">
                                            Submit Review
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Add to Cart Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-charcoal border-t border-charcoal/10 dark:border-offwhite/10 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40 hidden md:flex justify-between items-center transition-colors">
                <div className="flex items-center gap-4 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                    <img src={mainImage} alt="thumbnail" className="w-12 h-12 object-cover rounded-sm" />
                    <div>
                        <h4 className="text-sm font-medium text-charcoal dark:text-offwhite truncate max-w-xs">{product.name}</h4>
                        <span className="text-xs text-red-600 dark:text-red-400">₹{product.price.toFixed(2)}</span>
                    </div>
                    <div className="ml-auto flex items-center gap-4">
                        <button onClick={handleAddToCart} className="bg-charcoal dark:bg-offwhite text-white dark:text-charcoal px-8 py-3 text-xs uppercase tracking-widest hover:bg-black dark:hover:bg-white transition-colors">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>

            {/* Size Guide Modal */}
            <AnimatePresence>
                {showSizeGuide && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm"
                    >
                        <div className="bg-white dark:bg-charcoal p-8 max-w-2xl w-full relative shadow-2xl">
                            <button onClick={() => setShowSizeGuide(false)} className="absolute top-4 right-4 text-charcoal/50 dark:text-offwhite/50 hover:text-charcoal dark:hover:text-offwhite"><X className="w-6 h-6" /></button>
                            <h2 className="text-2xl font-serif text-charcoal dark:text-offwhite mb-6">Size Guide</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-charcoal dark:text-offwhite">
                                    <thead className="bg-charcoal/5 dark:bg-offwhite/5 border-b border-charcoal/10 dark:border-offwhite/10">
                                        <tr><th className="p-3">Size</th><th className="p-3">Chest (in)</th><th className="p-3">Waist (in)</th><th className="p-3">Hips (in)</th></tr>
                                    </thead>
                                    <tbody>
                                        {['XS (34)', 'S (36)', 'M (38)', 'L (40)', 'XL (42)'].map((row, i) => (
                                            <tr key={i} className="border-b border-charcoal/10 dark:border-offwhite/10">
                                                <td className="p-3 font-medium">{row}</td>
                                                <td className="p-3">{32 + i * 2}-{34 + i * 2}</td>
                                                <td className="p-3">{26 + i * 2}-{28 + i * 2}</td>
                                                <td className="p-3">{36 + i * 2}-{38 + i * 2}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.div>
    );
};

export default ProductDetails;