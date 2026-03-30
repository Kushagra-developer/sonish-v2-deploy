import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Shield, CreditCard, ChevronRight, Tag, X } from 'lucide-react';
import API from '../../utils/api';
import { authJsonFetch } from '../../utils/authFetch';

const SecureCheckout = ({ cartTotal, cartItems, shippingAddress, onCloseDrawer, onPaymentSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('idle');
    const [orderId, setOrderId] = useState(null);

    // Coupon states
    const [couponCode, setCouponCode] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [showOffers, setShowOffers] = useState(false);

    const discountValue = appliedCoupon ? appliedCoupon.discountValue : 0;
    const finalTotal = Math.max(0, cartTotal - discountValue);

    // Load Razorpay Script dynamically
    useEffect(() => {
        const loadScript = () => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => setScriptLoaded(true);
            script.onerror = () => console.error('Failed to load Razorpay script');
            document.body.appendChild(script);
        };
        
        loadScript();

        // Fetch Public Coupons
        fetch(`${API}/api/coupons/public`)
            .then(res => res.json())
            .then(data => setAvailableCoupons(data))
            .catch(err => console.error('Error fetching public coupons:', err));
    }, []);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsApplyingCoupon(true);
        setCouponError('');
        try {
            const res = await fetch(`${API}/api/coupons/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode, cartTotal })
            });
            const data = await res.json();
            if (res.ok) {
                setAppliedCoupon(data);
                setCouponCode('');
            } else {
                setCouponError(data.message || 'Invalid coupon');
            }
        } catch (err) {
            setCouponError('Error validating coupon');
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponError('');
    };

    const handlePayment = async () => {
        if (!scriptLoaded) {
            alert('Payment gateway is still loading. Please try again.');
            return;
        }

        setIsLoading(true);

        try {
            // 1. Create a Razorpay Order on the backend
            const orderResponse = await authJsonFetch(`${API}/api/razorpay/create-order`, {
                method: 'POST',
                body: JSON.stringify({ totalAmount: finalTotal }),
            });

            const orderData = await orderResponse.json();

            if (!orderResponse.ok) {
                throw new Error(orderData.message || 'Failed to initialize order');
            }

            // 2. Setup Razorpay options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Your specific LIVE Key ID
                amount: orderData.amount, // Amount in paise
                currency: orderData.currency,
                name: "SONISH",
                description: "Premium E-Commerce Checkout",
                image: "https://your-logo-url.com/logo.png", // Replace with actual logo URL
                order_id: orderData.id, 
                handler: async function (response) {
                    setPaymentStatus('verifying');
                    
                    // 3. Verify Payment
                    try {
                        const verifyRes = await authJsonFetch(`${API}/api/razorpay/verify`, {
                            method: 'POST',
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });
                        
                        const verifyData = await verifyRes.json();
                        
                        if (verifyData.success) {
                            try {
                                const orderCreateRes = await authJsonFetch(`${API}/api/orders`, {
                                    method: 'POST',
                                    body: JSON.stringify({
                                        orderItems: cartItems.map(item => ({
                                            ...item,
                                            qty: item.qty || item.cartQuantity || 1,
                                            product: item._id || item.product
                                        })),
                                        shippingAddress,
                                        paymentMethod: 'Razorpay',
                                        itemsPrice: cartTotal,
                                        taxPrice: 0,
                                        shippingPrice: 0,
                                        totalPrice: finalTotal,
                                        discountPrice: discountValue,
                                        couponCode: appliedCoupon?.code,
                                        razorpay_order_id: response.razorpay_order_id,
                                        razorpay_payment_id: response.razorpay_payment_id,
                                        razorpay_signature: response.razorpay_signature,
                                    })
                                });

                                if (!orderCreateRes.ok) {
                                    const errorData = await orderCreateRes.json().catch(() => ({}));
                                    throw new Error(errorData.message || 'Failed to save order to database');
                                }

                                const orderResult = await orderCreateRes.json();
                                setOrderId(orderResult._id);
                                setPaymentStatus('success');
                                if (onPaymentSuccess) onPaymentSuccess(response)
                            } catch (e) {
                                console.error('Order creation failed:', e);
                                alert(`Payment successful but order saving failed: ${e.message}. Please contact support with your Payment ID: ${response.razorpay_payment_id}`);
                                setPaymentStatus('failed');
                            }

                            setTimeout(() => {
                                try {
                                    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                                    const uid = userInfo?._id;
                                    
                                    // 1. Clear Guest Cart if applicable
                                    localStorage.removeItem('sonish_cart');
                                    
                                    // 2. Clear User-specific Cart
                                    if (uid) {
                                        localStorage.removeItem(`sonish_cart_${uid}`);
                                    }

                                    // 3. Notify all components to refresh
                                    window.dispatchEvent(new Event('cartUpdated'));
                                    
                                } catch (e) {
                                    console.error('Error clearing cart:', e);
                                }
                                
                                if (onCloseDrawer) onCloseDrawer();
                                // Optional: Keep them on success screen longer if they want to read the ID
                                // Or redirect to profile
                                window.location.href = '/profile?tab=orders';
                            }, 5000);

                        } else {
                            setPaymentStatus('failed');
                            alert('Payment Verification Failed!');
                        }
                    } catch (err) {
                        setPaymentStatus('failed');
                        alert('Payment Verification Error. Please contact support.');
                    }
                },
                prefill: {
                    name: "Customer Name",
                    email: "customer@example.com",
                    contact: "9999999999"
                },
                notes: {
                    address: "Sonish Headquarters"
                },
                theme: {
                    color: "#2C2C2C" // Charcoal
                }
            };

            const rzp = new window.Razorpay(options);
            
            rzp.on('payment.failed', function (response){
                setPaymentStatus('failed');
                alert(response.error.description);
            });

            rzp.open();

        } catch (error) {
            console.error('Payment Flow Error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (paymentStatus === 'success') {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="p-10 text-center bg-offwhite dark:bg-charcoal/50 rounded-xl mt-8 border-2 border-green-500/30 shadow-2xl"
            >
                <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-6 text-white shadow-lg shadow-green-500/20">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="font-serif text-3xl text-charcoal dark:text-offwhite mb-3">Order Placed!</h3>
                <p className="text-sm text-charcoal/60 dark:text-offwhite/60 mb-6 leading-relaxed">
                    Thank you for shopping with SONISH. Your order has been placed successfully and is being processed.
                </p>
                {orderId && (
                    <div className="bg-charcoal/5 dark:bg-white/5 p-4 rounded-lg mb-6 border border-charcoal/10">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40 dark:text-offwhite/40 mb-1 font-bold">Order Reference</p>
                        <p className="font-mono text-lg text-gold font-bold">#{orderId.toString().slice(-8).toUpperCase()}</p>
                    </div>
                )}
                <p className="text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 animate-pulse">
                    Redirecting to your orders...
                </p>
            </motion.div>
        );
    }

    return (
        <div className="mt-8 border-t border-charcoal/10 pt-8">
            <div className="flex items-center gap-3 mb-6 relative">
                <Shield className="w-5 h-5 text-gold" />
                <h3 className="font-serif text-xl text-charcoal">Secure Checkout</h3>
                <p className="absolute right-0 top-1 text-[10px] uppercase tracking-widest text-charcoal/40 font-bold border border-charcoal/10 px-2 py-0.5 rounded-sm bg-white">
                    Protected by Razorpay
                </p>
            </div>

            {/* Coupon Section */}
            <div className="mb-8 p-4 bg-charcoal/5 dark:bg-white/5 rounded-lg border border-charcoal/10">
                <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-gold" />
                    <span className="text-xs uppercase tracking-widest font-bold text-charcoal/70 dark:text-white/70">Have a Coupon?</span>
                </div>
                
                {!appliedCoupon ? (
                    <div className="flex gap-2">
                        <input 
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="Enter Code (e.g. SONISH10)"
                            className="flex-1 bg-white dark:bg-charcoal/20 border border-charcoal/10 px-4 py-2 text-sm rounded focus:border-gold outline-none transition-colors"
                        />
                        <button 
                            onClick={handleApplyCoupon}
                            disabled={isApplyingCoupon || !couponCode.trim()}
                            className="px-6 py-2 bg-charcoal text-white text-xs uppercase tracking-widest font-bold rounded hover:bg-gold transition-colors disabled:opacity-50"
                        >
                            {isApplyingCoupon ? '...' : 'Apply'}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between bg-gold/10 border border-gold/30 p-2 px-4 rounded animate-pulse">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gold uppercase tracking-widest">{appliedCoupon.code} Applied</span>
                        </div>
                        <button onClick={handleRemoveCoupon} className="text-gold hover:text-charcoal transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Available Coupons List */}
                {availableCoupons.length > 0 && (
                    <div className="mt-4">
                        <button 
                            onClick={() => setShowOffers(!showOffers)}
                            className="text-[10px] uppercase tracking-widest font-bold text-gold hover:text-charcoal transition-colors flex items-center gap-1 mb-2"
                        >
                            {showOffers ? 'Hide Offers' : 'View Available Offers'}
                            <ChevronRight className={`w-3 h-3 transition-transform ${showOffers ? 'rotate-90' : ''}`} />
                        </button>
                        
                        {showOffers && (
                            <div className="space-y-2 mt-2 max-h-40 overflow-y-auto no-scrollbar">
                                {availableCoupons.map(coupon => (
                                    <div 
                                        key={coupon._id}
                                        onClick={() => {
                                            setCouponCode(coupon.code);
                                            setShowOffers(false);
                                        }}
                                        className="p-3 bg-white dark:bg-charcoal/20 border border-gold/20 rounded cursor-pointer hover:border-gold transition-all"
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-bold text-charcoal dark:text-offwhite">{coupon.code}</span>
                                            <span className="text-[10px] bg-gold text-white px-2 py-0.5 rounded-full uppercase tracking-widest">
                                                {coupon.discountType === 'percentage' ? `${coupon.discountAmount}% OFF` : `₹${coupon.discountAmount} OFF`}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-charcoal/60 dark:text-offwhite/60">
                                            Min. purchase: ₹{coupon.minPurchase}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {couponError && <p className="text-[10px] text-red-500 mt-2 ml-1 font-bold uppercase tracking-tight">{couponError}</p>}
            </div>

            <p className="text-sm text-charcoal/60 mb-6">
                All transactions are encrypted and processed through military-grade infrastructure. We support all major UPI Apps, Credit/Debit Cards, and Netbanking.
            </p>

            {discountValue > 0 && (
                <div className="mb-4 flex flex-col gap-1 border-b border-charcoal/5 pb-4">
                    <div className="flex justify-between text-xs text-charcoal/50">
                        <span>Cart Total</span>
                        <span>₹{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-green-600 font-bold">
                        <span>Coupon Discount</span>
                        <span>-₹{discountValue.toLocaleString()}</span>
                    </div>
                </div>
            )}

            <button
                onClick={handlePayment}
                disabled={isLoading || !scriptLoaded || cartTotal === 0}
                className="w-full relative overflow-hidden group py-4 flex items-center justify-center gap-3 bg-charcoal text-white rounded-md disabled:bg-charcoal/50 disabled:cursor-not-allowed transition-all duration-300 hover:bg-black hover:shadow-lg"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <CreditCard className="w-5 h-5 group-hover:text-gold transition-colors" />
                        <span className="font-medium text-sm tracking-wide uppercase">
                            Pay ₹{finalTotal.toLocaleString()} Securely
                        </span>
                        <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                    </>
                )}
            </button>
        </div>
    );
};


export default SecureCheckout;