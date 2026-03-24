import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Shield, CreditCard, ChevronRight } from 'lucide-react';
import API from '../../utils/api';
import { authJsonFetch } from '../../utils/authFetch';

const SecureCheckout = ({ cartTotal, cartItems, shippingAddress, onCloseDrawer, onPaymentSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('online');

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

    const handleCODOrder = async () => {
        setIsLoading(true);
        try {
            const orderCreateRes = await authJsonFetch(`${API}/api/orders`, {
                method: 'POST',
                body: JSON.stringify({
                    orderItems: cartItems.map(item => ({
                        ...item,
                        qty: item.qty || 1,
                        product: item._id || item.product
                    })),
                    shippingAddress,
                    paymentMethod: 'COD',
                    itemsPrice: cartTotal,
                    taxPrice: 0,
                    shippingPrice: 0,
                    totalPrice: cartTotal,
                    isPaid: false,
                })
            });

            if (!orderCreateRes.ok) {
                const errorData = await orderCreateRes.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to place COD order');
            }

            setPaymentStatus('success');
            
            setTimeout(() => {
                const uid = JSON.parse(localStorage.getItem('userInfo'))?._id;
                if (uid) {
                    localStorage.removeItem(`sonish_cart_${uid}`);
                    window.dispatchEvent(new Event('cartUpdated'));
                }
                if (onCloseDrawer) onCloseDrawer();
                window.location.href = '/profile?tab=orders';
            }, 3000);

        } catch (error) {
            console.error('COD Flow Error:', error);
            alert(error.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayment = async () => {
        if (paymentMethod === 'cod') {
            return handleCODOrder();
        }

        if (!scriptLoaded) {
            alert('Payment gateway is still loading. Please try again.');
            return;
        }

        setIsLoading(true);

        try {
            // 1. Create a Razorpay Order on the backend
            const orderResponse = await authJsonFetch(`${API}/api/razorpay/create-order`, {
                method: 'POST',
                body: JSON.stringify({ totalAmount: cartTotal }),
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
                                        totalPrice: cartTotal,
                                        isPaid: true,
                                        paidAt: new Date(),
                                        paymentResult: {
                                            id: response.razorpay_payment_id,
                                            status: 'captured',
                                            update_time: new Date().toISOString(),
                                        }
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
                <h3 className="font-serif text-2xl text-charcoal mb-2">Order Successful!</h3>
                <p className="text-sm text-charcoal/60">
                    {paymentMethod === 'cod' 
                        ? "Your acquisition has been placed. Please have ₹" + cartTotal.toLocaleString() + " ready upon delivery." 
                        : "Thank you for your premium order. Your transaction has been securely processed."}
                </p>
            </motion.div>
        );
    }

    return (
        <div className="mt-8 border-t border-charcoal/10 pt-8">
            <div className="flex items-center gap-3 mb-6 relative">
                <Shield className="w-5 h-5 text-gold" />
                <h3 className="font-serif text-xl text-charcoal">Secure Checkout</h3>
            </div>

            {/* Payment Method Selector */}
            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setPaymentMethod('online')}
                    className={`flex-1 py-4 border transition-all duration-300 flex flex-col items-center gap-2 ${paymentMethod === 'online' ? 'border-gold bg-gold/5 text-gold' : 'border-charcoal/10 text-charcoal/40 hover:border-gold/30'}`}
                >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Pay Online</span>
                </button>
                <button
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex-1 py-4 border transition-all duration-300 flex flex-col items-center gap-2 ${paymentMethod === 'cod' ? 'border-gold bg-gold/5 text-gold' : 'border-charcoal/10 text-charcoal/40 hover:border-gold/30'}`}
                >
                    <ShoppingBag className="w-5 h-5" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Cash on Delivery</span>
                </button>
            </div>

            <p className="text-sm text-charcoal/60 mb-6 italic">
                {paymentMethod === 'online' 
                    ? "Encrypted transaction via Razorpay. Supports UPI, Cards, and Netbanking." 
                    : "Pay with cash directly to the courier upon receipt of your Sonish acquisition."}
            </p>

            <button
                onClick={handlePayment}
                disabled={isLoading || (paymentMethod === 'online' && !scriptLoaded) || cartTotal === 0}
                className="w-full relative overflow-hidden group py-4 flex items-center justify-center gap-3 bg-charcoal text-white rounded-md disabled:bg-charcoal/50 disabled:cursor-not-allowed transition-all duration-300 hover:bg-black hover:shadow-lg"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <span className="font-medium text-sm tracking-wide uppercase">
                            {paymentMethod === 'online' ? `Pay ₹${cartTotal.toLocaleString()} Securely` : "Place Order (COD)"}
                        </span>
                        <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                    </>
                )}
            </button>
        </div>
    );
};

export default SecureCheckout;