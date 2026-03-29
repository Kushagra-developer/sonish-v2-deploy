import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, Truck, RefreshCw, Star, Minus, Plus, ShieldCheck, X, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductSkeleton from '../components/product/ProductSkeleton';
import DOMPurify from 'dompurify';
import { loadCart, saveCart, loadWishlist, saveWishlist } from '../utils/cartStorage';
import API from '../utils/api';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Image Carousel State
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Interactive States
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('S');
    const [activeTab, setActiveTab] = useState('description');
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [showNotifyMe, setShowNotifyMe] = useState(false);
    const [notifyEmail, setNotifyEmail] = useState('');
    const [isNotifying, setIsNotifying] = useState(false);
    const [notifySuccess, setNotifySuccess] = useState(false);

    // Zoom Effect States
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${API}/api/products/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setProduct(data);

                    // Check if already in wishlist
                    const wishlist = loadWishlist();
                    if (wishlist.some(item => item._id === data._id)) {
                        setIsWishlisted(true);
                    }

                    // Pre-fill notify email if user is logged in
                    const userInfo = localStorage.getItem('userInfo');
                    if (userInfo) {
                        setNotifyEmail(JSON.parse(userInfo).email);
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
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            alert('Please log in to add items to your cart.');
            navigate('/login');
            return;
        }

        const cart = loadCart();
        const cartItem = {
            ...product,
            selectedSize,
            qty: quantity
        };

        const existingIndex = cart.findIndex(item => item._id === product._id && item.selectedSize === selectedSize);
        if (existingIndex >= 0) {
            cart[existingIndex].qty += quantity;
        } else {
            cart.push(cartItem);
        }

        saveCart(cart);

        window.dispatchEvent(new Event('cartUpdated'));
        window.dispatchEvent(new Event('openCart'));
    };

    const handleToggleWishlist = () => {
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

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: product.name, url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Product link copied to clipboard!');
        }
    };

    const handleNotifyMe = async (e) => {
        e.preventDefault();
        setIsNotifying(true);
        try {
            const res = await fetch(`${API}/api/notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product._id,
                    email: notifyEmail,
                    size: selectedSize
                })
            });
            const data = await res.json();
            if (res.ok) {
                setNotifySuccess(true);
                setTimeout(() => {
                    setShowNotifyMe(false);
                    setNotifySuccess(false);
                }, 3000);
            } else {
                alert(data.message || 'Error setting up notification');
            }
        } catch (error) {
            alert('Something went wrong. Please try again.');
        } finally {
            setIsNotifying(false);
        }
    };

    // --- ZOOM EFFECT HANDLERS ---
    const handleMouseMove = (e) => {
        if (!isZoomed) return;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomPosition({ x, y });
    };

    const handleMouseLeave = () => {
        setIsZoomed(false);
    };

    const toggleZoom = () => {
        setIsZoomed(!isZoomed);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-offwhite dark:bg-charcoal">
                <div className="w-full md:w-1/2 h-[600px]"><ProductSkeleton /></div>
            </div>
        );
    }

    if (!product) return <div className="text-center pt-40 dark:text-white">Product not found.</div>;

    // =========================================================
    // --- MANUAL IMAGE ADDITION (BY PRODUCT) ---
    // FIXED: Added missing commas between all product entries!
    // =========================================================
    const manualExtraImages = {
        "Maroon Muse": [
            "/images/mm1.webp",
            "/images/mm2.webp",
            "/images/mm3.webp",
            "/images/mm4.webp"
        ],
        "Midnight Bloom": [
            "/images/mb1.webp",
            "/images/mb2.webp",
            "/images/mb3.webp",
            "/images/mb4.webp",
            "/images/m.webp"
        ],
        "Sunlit corset": [
            "/images/sc1.webp",
            "/images/sc2.webp",
            "/images/sc3.webp",
            "/images/sc4.webp",
            "/images/sc5.webp"
        ],
        "Emerald Botanical V neck Top": [
            "/images/ebvnt1.webp",
            "/images/ebvnt2.webp",
            "/images/ebvnt3.webp",
            "/images/ebvnt4.webp"
        ],
        "Ombré Gradient Shirt": [
            "/images/ogs1.webp",
            "/images/ogs2.webp",
            "/images/ogs3.webp",
            "/images/ogs4.webp"
        ],
        "Green Ripple Shirt": [
            "/images/grs1.webp",
            "/images/grs2.webp",
            "/images/grs3.webp",
            "/images/grs4.webp",
            "/images/grs5.webp"
        ],
        "Jade Jumble Shirt": [
            "/images/jjs1.webp",
            "/images/jjs2.webp",
            "/images/jjs3.webp",
            "/images/jjs4.webp",
            "/images/jjs5.webp"
        ],
        "blosom fusion co-ord": [
            "/images/bfc1.webp",
            "/images/bfc2.webp",
            "/images/bfc3.webp",
            "/images/bfc4.webp",
            "/images/bfc5.webp"
        ],
        "Ribbed Tank Top": [
            "/images/rtt1.webp",
            "/images/rtt2.webp",
            "/images/rtt3.webp",
            "/images/rtt4.webp",
            "/images/rtt5.webp",
            "/images/rtt6.webp",
            "/images/rtt7.webp"
        ],
        "Black Heritage Co-ord Set": [
            "/images/bhcs1.webp",
            "/images/bhcs2.webp",
            "/images/bhcs3.webp",
            "/images/bhcs4.webp",
            "/images/bhcs5.webp"
        ],
        "Mosaic Mustard Set": [
            "/images/mms1.webp",
            "/images/mms2.webp",
            "/images/mms3.webp"
        ],
        "Floral Fusion Co-ords Set": [
            "/images/ffcs1.webp",
            "/images/ffcs2.webp",
            "/images/ffcs3.webp",
            "/images/ffcs4.webp",
            "/images/ffcs5.webp",
            "/images/ffcs6.webp",
            "/images/ffcs7.webp",
            "/images/ffcs8.webp",
            "/images/ffcs9.webp",
            "/images/ffcs10.webp"
        ],
        "Monochrome Mirage Co-ord Set": [
            "/images/mmcs1.webp",
            "/images/mmcs2.webp",
            "/images/mmcs3.webp",
            "/images/mmcs4.webp",
            "/images/mmcs5.webp",
            "/images/mmcs6.webp",
            "/images/mmcs7.webp"
        ],
        "Azure Marble Button-Down": [
            "/images/ambd1.webp",
            "/images/ambd2.webp",
            "/images/ambd3.webp",
            "/images/ambd4.webp"
        ]
    };

    const extraImagesForThisProduct = manualExtraImages[product.name] || [];

    const displayImages = [
        product.image,
        ...extraImagesForThisProduct
    ].filter(Boolean);


    // Carousel Handlers
    const nextImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
    };

    const displaySizes = product?.sizes?.length > 0 ? product.sizes : [
        {size: 'S', stock: Math.floor((product?.countInStock || 0)/4) || 10}, 
        {size: 'M', stock: Math.floor((product?.countInStock || 0)/4) || 10}, 
        {size: 'L', stock: Math.floor((product?.countInStock || 0)/4) || 10}, 
        {size: 'XL', stock: Math.floor((product?.countInStock || 0)/4) || 10}
    ];

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

                    {/* Left: Image Slider */}
                    <div className="flex-1 flex gap-4 md:gap-6 flex-col-reverse md:flex-row">
                        <div
                            className={`flex-1 aspect-[3/4] bg-gray-100 relative overflow-hidden group ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                            onClick={toggleZoom}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                        >
                            <img
                                src={displayImages[currentImageIndex]}
                                alt={product.name}
                                className="w-full h-full object-cover object-top transition-transform duration-200 ease-out pointer-events-none"
                                style={{
                                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                    transform: isZoomed ? 'scale(2.2)' : 'scale(1)'
                                }}
                            />

                            {!isZoomed && displayImages.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-charcoal/80 p-2 rounded-full hover:bg-white dark:hover:bg-charcoal text-charcoal dark:text-offwhite z-40 transition-colors shadow-md"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-charcoal/80 p-2 rounded-full hover:bg-white dark:hover:bg-charcoal text-charcoal dark:text-offwhite z-40 transition-colors shadow-md"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}
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
                            <span className="text-lg text-charcoal/50 dark:text-offwhite/50 line-through font-serif">₹{((product?.price || 0) * 1.3).toFixed(2)}</span>
                            <span className="text-2xl text-red-600 dark:text-red-400 font-serif font-medium">₹{(product?.price || 0).toFixed(2)}</span>
                        </div>

                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm text-charcoal dark:text-offwhite tracking-wide">Select Size</span>
                                <button onClick={() => setShowSizeGuide(true)} className="text-xs text-charcoal/60 dark:text-offwhite/60 underline hover:text-gold">Size Guide</button>
                            </div>
                            <div className="flex gap-3">
                                {displaySizes.map(s => {
                                    const isOutOfStock = s.stock <= 0;
                                    return (
                                        <button
                                            key={s.size}
                                            disabled={isOutOfStock}
                                            onClick={() => setSelectedSize(s.size)}
                                            className={`relative w-12 h-12 flex items-center justify-center text-xs tracking-widest transition-all ${isOutOfStock ? 'opacity-40 cursor-not-allowed border-dashed border-charcoal/20 dark:border-offwhite/20' : selectedSize === s.size ? 'border-2 border-charcoal dark:border-offwhite text-charcoal dark:text-offwhite font-bold' : 'border border-charcoal/20 dark:border-offwhite/20 text-charcoal/60 dark:text-offwhite/60 hover:border-charcoal dark:hover:border-offwhite'}`}
                                        >
                                            {s.size}
                                            {isOutOfStock && <div className="absolute inset-0 w-full h-full pointer-events-none opacity-50"><svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none"><line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="2" /></svg></div>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mb-10">
                            <div className="flex items-center border border-charcoal/20 dark:border-offwhite/20 px-4 h-16 w-full sm:w-32 justify-between">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-charcoal/50 dark:text-offwhite/50 hover:text-charcoal dark:hover:text-offwhite"><Minus className="w-4 h-4" /></button>
                                <span className="text-charcoal dark:text-offwhite font-medium">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="text-charcoal/50 dark:text-offwhite/50 hover:text-charcoal dark:hover:text-offwhite"><Plus className="w-4 h-4" /></button>
                            </div>

                            {displaySizes.find(s => s.size === selectedSize)?.stock > 0 ? (
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-charcoal dark:bg-offwhite text-white dark:text-charcoal h-16 text-sm uppercase tracking-widest font-bold hover:bg-black dark:hover:bg-white transition-colors flex items-center justify-center gap-2"
                                >
                                    Add to Cart <span className="text-white/50 dark:text-charcoal/50 text-xs font-normal">- ₹{((product?.price || 0) * quantity).toFixed(2)}</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowNotifyMe(true)}
                                    className="flex-1 border-2 border-charcoal dark:border-offwhite text-charcoal dark:text-offwhite h-16 text-sm uppercase tracking-widest font-bold hover:bg-charcoal hover:text-white dark:hover:bg-offwhite dark:hover:text-charcoal transition-all flex items-center justify-center gap-2"
                                >
                                    Notify Me
                                </button>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={handleToggleWishlist}
                                    className={`h-16 w-16 border border-charcoal/20 dark:border-offwhite/20 flex items-center justify-center transition-colors ${isWishlisted ? 'text-red-500 border-red-500' : 'text-charcoal dark:text-offwhite hover:border-charcoal dark:hover:border-offwhite'}`}
                                >
                                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="h-16 w-16 border border-charcoal/20 dark:border-offwhite/20 flex items-center justify-center text-charcoal dark:text-offwhite hover:border-charcoal dark:hover:border-offwhite transition-colors"
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

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

                <div className="mt-24">
                    <div className="flex border-b border-charcoal/10 dark:border-offwhite/10 gap-8 mb-8 overflow-x-auto no-scrollbar">
                        {['description', 'additional information', `reviews (${product.reviews?.length || 0})`].map((tab) => (
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
                                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }} className="space-y-4 [&>p]:mb-4" />
                                ) : (
                                    <p>Upgrade your wardrobe with this fashion-forward item, designed for effortless style and comfort.</p>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'additional information' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold mb-2">Size & Fit</h4>
                                            <p className="text-sm font-light leading-relaxed text-charcoal/70 dark:text-offwhite/70">
                                                {product.sizeAndFit || "Regular fit. Designed for a comfortable and stylish silhouette. True to size."}
                                            </p>
                                        </div>
                                        
                                        <div>
                                            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold mb-2">Material & Care</h4>
                                            <p className="text-sm font-light leading-relaxed text-charcoal/70 dark:text-offwhite/70">
                                                {product.materialAndCare || "Premium quality fabric. Handle with care for long-lasting wear. Dry clean recommended or machine wash cold."}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold mb-4">Specifications</h4>
                                        <div className="border border-charcoal/10 dark:border-offwhite/10 rounded overflow-hidden">
                                            {product.specifications?.length > 0 ? (
                                                <table className="w-full text-left text-xs border-collapse">
                                                    <tbody className="divide-y divide-charcoal/5 dark:divide-offwhite/5 text-charcoal dark:text-offwhite">
                                                        {product.specifications.map((spec, idx) => (
                                                            <tr key={idx} className={idx % 2 === 0 ? 'bg-charcoal/[0.02] dark:bg-white/[0.02]' : ''}>
                                                                <th className="py-3 px-4 font-medium text-charcoal/50 dark:text-offwhite/50 w-1/3 lowercase tracking-wide">{spec.label}</th>
                                                                <td className="py-3 px-4 font-light">{spec.value || "N/A"}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div className="p-8 text-center text-charcoal/30 dark:text-offwhite/30 italic text-xs uppercase tracking-widest">
                                                    No specific details available
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab.startsWith('reviews') && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                                {product.reviews && product.reviews.length > 0 ? (
                                    product.reviews.map((review) => (
                                        <div key={review._id} className="flex gap-4 border-b border-charcoal/10 dark:border-offwhite/10 pb-8">
                                            <div className="w-12 h-12 bg-charcoal/10 dark:bg-offwhite/10 rounded-full flex items-center justify-center font-serif text-xl text-charcoal dark:text-offwhite">
                                                {review.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-medium text-charcoal dark:text-offwhite">{review.name}</h4>
                                                    <div className="flex text-gold">
                                                        {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                                                    </div>
                                                </div>
                                                <span className="text-xs text-charcoal/50 dark:text-offwhite/50 block mb-3">
                                                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Verified Buyer'}
                                                </span>
                                                <p className="text-charcoal/80 dark:text-offwhite/80">{review.comment}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-charcoal/60 dark:text-offwhite/60">No reviews yet. Be the first to review this product!</p>
                                )}

                                <div className="bg-white dark:bg-charcoal/50 p-6 md:p-8 border border-charcoal/10 dark:border-offwhite/10">
                                    <h3 className="text-xl font-serif text-charcoal dark:text-offwhite mb-6">Leave a Review</h3>
                                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Review submitted for moderation!"); }}>
                                        <div>
                                            <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-2">Your Rating</label>
                                            <div className="flex text-charcoal/20 dark:text-offwhite/20 hover:text-gold cursor-pointer transition-colors w-max"><Star className="w-5 h-5" /><Star className="w-5 h-5" /><Star className="w-5 h-5" /><Star className="w-5 h-5" /><Star className="w-5 h-5" /></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><input type="text" placeholder="Name *" required className="w-full bg-transparent border-b border-charcoal/20 dark:border-offwhite/20 py-2 outline-none focus:border-charcoal dark:focus:border-offwhite text-charcoal dark:text-offwhite placeholder:text-charcoal/40 dark:placeholder:text-offwhite/40" /></div>
                                            <div><input type="email" placeholder="Email *" required className="w-full bg-transparent border-b border-charcoal/20 dark:border-offwhite/20 py-2 outline-none focus:border-charcoal dark:focus:border-offwhite text-charcoal dark:text-offwhite placeholder:text-charcoal/40 dark:placeholder:text-offwhite/40" /></div>
                                        </div>
                                        <div><textarea placeholder="Your Review *" required rows="4" className="w-full bg-transparent border-b border-charcoal/20 dark:border-offwhite/20 py-2 outline-none focus:border-charcoal dark:focus:border-offwhite text-charcoal dark:text-offwhite placeholder:text-charcoal/40 dark:placeholder:text-offwhite/40 resize-none"></textarea></div>
                                        <button type="submit" className="bg-charcoal dark:bg-offwhite text-white dark:text-charcoal px-8 py-3 text-xs uppercase tracking-widest hover:bg-black dark:hover:bg-white transition-colors mt-2">Submit Review</button>
                                    </form>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-charcoal border-t border-charcoal/10 dark:border-offwhite/10 p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40 hidden md:flex justify-between items-center transition-colors">
                <div className="flex items-center gap-4 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                    <img src={displayImages[currentImageIndex]} alt="thumbnail" className="w-14 h-14 object-cover rounded-sm" />
                    <div>
                        <h4 className="text-base font-medium text-charcoal dark:text-offwhite truncate max-w-xs">{product.name}</h4>
                        <span className="text-sm text-red-600 dark:text-red-400 font-bold">₹{(product?.price || 0).toFixed(2)}</span>
                    </div>
                    <div className="ml-auto flex items-center gap-4">
                        {displaySizes.find(s => s.size === selectedSize)?.stock > 0 ? (
                            <button onClick={handleAddToCart} className="bg-charcoal dark:bg-offwhite text-white dark:text-charcoal px-10 h-14 text-sm font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-white transition-colors">Add to Cart</button>
                        ) : (
                            <button onClick={() => setShowNotifyMe(true)} className="border border-charcoal dark:border-offwhite text-charcoal dark:text-offwhite px-10 h-14 text-sm font-bold uppercase tracking-widest hover:bg-charcoal hover:text-white dark:hover:bg-white dark:hover:text-charcoal transition-all">Notify Me</button>
                        )}
                    </div>
                </div>
            </div>

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
                                {product.sizeChart ? (
                                    <div className="flex justify-center">
                                        <img 
                                            src={product.sizeChart} 
                                            alt="Size Chart" 
                                            className="max-w-full h-auto rounded shadow-sm border border-charcoal/5 dark:border-offwhite/5" 
                                        />
                                    </div>
                                ) : (
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
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showNotifyMe && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-charcoal p-8 max-w-md w-full relative shadow-2xl border border-charcoal/10"
                        >
                            <button onClick={() => setShowNotifyMe(false)} className="absolute top-4 right-4 text-charcoal/50 dark:text-offwhite/50 hover:text-charcoal dark:hover:text-offwhite transition-colors"><X className="w-5 h-5" /></button>
                            
                            <div className="text-center">
                                <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Truck className="w-6 h-6 text-gold" />
                                </div>
                                <h2 className="text-2xl font-serif text-charcoal dark:text-offwhite mb-2">Back in Stock Notification</h2>
                                <p className="text-xs text-charcoal/60 dark:text-offwhite/60 mb-6 uppercase tracking-widest">Size: {selectedSize}</p>
                                
                                {notifySuccess ? (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-4">
                                        <div className="text-green-600 dark:text-green-400 font-medium mb-1">Great choice!</div>
                                        <p className="text-sm text-charcoal/70 dark:text-offwhite/70">We'll email you at <span className="font-bold">{notifyEmail}</span> as soon as this is back in stock.</p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleNotifyMe} className="space-y-4">
                                        <p className="text-sm text-charcoal/70 dark:text-offwhite/70 mb-4">Leave your email and we'll let you know the moment {product.name} is available in your size.</p>
                                        <input 
                                            type="email" 
                                            required
                                            value={notifyEmail}
                                            onChange={(e) => setNotifyEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            className="w-full bg-charcoal/5 dark:bg-white/5 border border-charcoal/10 dark:border-offwhite/10 px-4 py-3 text-sm focus:border-gold outline-none transition-colors dark:text-white"
                                        />
                                        <button 
                                            type="submit"
                                            disabled={isNotifying}
                                            className="w-full bg-charcoal dark:bg-offwhite text-white dark:text-charcoal py-4 text-xs uppercase tracking-widest font-bold hover:bg-black dark:hover:bg-white transition-colors disabled:opacity-50"
                                        >
                                            {isNotifying ? 'Setting up...' : 'Notify Me When Available'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ProductDetails;