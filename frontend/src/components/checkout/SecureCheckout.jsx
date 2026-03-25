import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Shield, CreditCard, ChevronRight, Tag, X } from 'lucide-react';
import API from '../../utils/api';
import { authJsonFetch } from '../../utils/authFetch';

const SecureCheckout = ({ cartTotal, cartItems, shippingAddress, onCloseDrawer, onPaymentSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('idle');

    // Coupon states
    const [couponCode, setCouponCode] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');

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

                                setPaymentStatus('success');
                                if (onPaymentSuccess) onPaymentSuccess(response)
                            } catch (e) {
                                console.error('Order creation failed:', e);
                                alert(`Payment successful but order saving failed: ${e.message}. Please contact support with your Payment ID: ${response.razorpay_payment_id}`);
                                setPaymentStatus('failed');
                            }

                            setTimeout(() => {
                                try {
                                    const uid = JSON.parse(localStorage.getItem('userInfo'))?._id;
                                    if (uid) {
                                        localStorage.removeItem(`sonish_cart_${uid}`);
                                        window.dispatchEvent(new Event('cartUpdated'));
                                    }
                                } catch (e) {}
                                if (onCloseDrawer) onCloseDrawer();
                                window.location.href = '/profile?tab=orders';
                            }, 3000);

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
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="p-8 text-center bg-green-500/10 rounded-lg mt-8 border border-green-500/20"
            >
                <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-4 text-white">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl text-charcoal mb-2">Payment Successful!</h3>
                <p className="text-sm text-charcoal/60">Thank you for your premium order. Your transaction has been securely processed.</p>
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
                    <Ticket className="w-4 h-4 text-gold" />
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
                            <span className="text-[10px] text-gold/80 font-medium">(₹{appliedCoupon.discountValue.toLocaleString()} saved)</span>
                        </div>
                        <button onClick={handleRemoveCoupon} className="p-1 hover:bg-gold/20 rounded-full transition-colors">
                            <X className="w-4 h-4 text-gold" />
                        </button>
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