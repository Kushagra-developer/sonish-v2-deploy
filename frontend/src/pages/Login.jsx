import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../utils/api';

const Login = () => {
    // Auth Modes: 'login', 'register', 'otp'
    const [authMode, setAuthMode] = useState('login');
    
    // Standard Auth State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    
    // Email OTP Auth State
    const [otpEmail, setOtpEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();

    const redirect = location.search ? location.search.split('=')[1] : '/profile';

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo && !JSON.parse(userInfo).isAdmin) {
            navigate(redirect);
        }
    }, [navigate, redirect]);

    const handleSuccessLogin = (data) => {
        localStorage.setItem('userInfo', JSON.stringify(data));
        if (data.cart) {
            localStorage.setItem(`sonish_cart_${data._id}`, JSON.stringify(data.cart));
            window.dispatchEvent(new Event('cartUpdated'));
        }
        if (data.wishlist) {
            localStorage.setItem(`sonish_wishlist_${data._id}`, JSON.stringify(data.wishlist));
            window.dispatchEvent(new Event('wishlistUpdated'));
        }
        navigate(redirect);
    };

    const submitStandardAuth = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const endpoint = authMode === 'login' ? '/api/users/login' : '/api/users';
        const payload = authMode === 'login' ? { email, password } : { name, email, password };

        try {
            const res = await fetch(`${API}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.isAdmin) {
                    setError('Admin accounts cannot log into the customer portal.');
                } else {
                    handleSuccessLogin(data);
                }
            } else {
                setError(data.message || 'Invalid Request');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const res = await fetch(`${API}/api/users/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: otpEmail }),
            });

            const data = await res.json();

            if (res.ok) {
                setOtpSent(true);
                // For development, show the mock OTP in the UI so the user can copy it
                setSuccessMsg(`OTP Sent! (Mock Code for Testing: ${data.mockOtp})`);
            } else {
                setError(data.message || 'Failed to send OTP');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API}/api/users/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: otpEmail, otp }),
            });

            const data = await res.json();

            if (res.ok) {
                handleSuccessLogin(data);
            } else {
                setError(data.message || 'Invalid OTP');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = (mode) => {
        setAuthMode(mode);
        setError(null);
        setSuccessMsg(null);
        setOtpSent(false); // Reset OTP state if switching around
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-offwhite dark:bg-charcoal transition-colors duration-300"
        >
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-16">

                {/* Left Side: Login/Register Form */}
                <div className="flex-1">
                    <h2 className="text-3xl font-serif text-charcoal dark:text-offwhite mb-8 transition-colors">
                        {authMode === 'login' ? 'Login' : authMode === 'register' ? 'Create Account' : 'Passwordless Login'}
                    </h2>
                    
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 mb-4 text-sm border border-red-200">
                            {error}
                        </div>
                    )}
                    {successMsg && (
                        <div className="bg-green-50 text-green-700 p-3 mb-4 text-sm border border-green-200">
                            {successMsg}
                        </div>
                    )}

                    {authMode === 'otp' ? (
                        <form className="space-y-6" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-2">Email Address *</label>
                                <input 
                                    type="email" 
                                    value={otpEmail} 
                                    onChange={(e) => setOtpEmail(e.target.value)} 
                                    disabled={otpSent}
                                    required 
                                    placeholder="hello@example.com"
                                    className="w-full bg-transparent border-b border-charcoal/20 dark:border-offwhite/20 py-2 outline-none focus:border-charcoal dark:focus:border-offwhite transition-colors text-charcoal dark:text-offwhite disabled:opacity-50" 
                                />
                            </div>

                            {otpSent && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                    <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-2 mt-6">6-Digit Code *</label>
                                    <input 
                                        type="text" 
                                        value={otp} 
                                        onChange={(e) => setOtp(e.target.value)} 
                                        required 
                                        maxLength="6"
                                        placeholder="••••••"
                                        className="w-full bg-transparent border-b border-charcoal/20 dark:border-offwhite/20 py-2 outline-none focus:border-charcoal dark:focus:border-offwhite transition-colors text-charcoal dark:text-offwhite tracking-[0.5em] font-medium" 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleSendOtp} 
                                        className="text-[10px] text-charcoal/50 dark:text-offwhite/50 mt-3 underline uppercase tracking-wider hover:text-gold"
                                    >
                                        Resend Code
                                    </button>
                                </motion.div>
                            )}

                            <button disabled={isLoading} type="submit" className="w-full bg-charcoal dark:bg-offwhite text-white dark:text-charcoal py-4 text-xs uppercase tracking-widest hover:bg-black dark:hover:bg-white transition-colors disabled:opacity-50">
                                {isLoading ? 'Processing...' : (otpSent ? 'Verify Code' : 'Email Me A Code')}
                            </button>
                            
                            <button 
                                type="button" 
                                onClick={() => toggleMode('login')} 
                                className="w-full text-xs text-charcoal/60 dark:text-offwhite/60 hover:text-charcoal dark:hover:text-offwhite tracking-widest uppercase transition-colors"
                            >
                                Use Password Instead
                            </button>
                        </form>
                    ) : (
                        <form className="space-y-6" onSubmit={submitStandardAuth}>
                            {authMode === 'register' && (
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-2">Full Name *</label>
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-transparent border-b border-charcoal/20 dark:border-offwhite/20 py-2 outline-none focus:border-charcoal dark:focus:border-offwhite transition-colors text-charcoal dark:text-offwhite" />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-2">Email address *</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-transparent border-b border-charcoal/20 dark:border-offwhite/20 py-2 outline-none focus:border-charcoal dark:focus:border-offwhite transition-colors text-charcoal dark:text-offwhite" />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-2">Password *</label>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-transparent border-b border-charcoal/20 dark:border-offwhite/20 py-2 outline-none focus:border-charcoal dark:focus:border-offwhite transition-colors text-charcoal dark:text-offwhite" />
                            </div>

                            {authMode === 'login' && (
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="accent-charcoal dark:accent-offwhite" />
                                        <span className="text-sm text-charcoal/70 dark:text-offwhite/70">Remember me</span>
                                    </label>
                                    <a href="#" className="text-sm text-charcoal/70 dark:text-offwhite/70 hover:text-gold transition-colors">Lost your password?</a>
                                </div>
                            )}

                            <button disabled={isLoading} type="submit" className="w-full bg-charcoal dark:bg-offwhite text-white dark:text-charcoal py-4 text-xs uppercase tracking-widest hover:bg-black dark:hover:bg-white transition-colors disabled:opacity-50 mb-3">
                                {isLoading ? 'Processing...' : (authMode === 'login' ? 'Log In' : 'Register')}
                            </button>
                            
                            <button 
                                type="button" 
                                onClick={() => toggleMode('otp')} 
                                className="w-full border border-charcoal/20 dark:border-offwhite/20 text-charcoal dark:text-offwhite py-4 text-xs uppercase tracking-widest hover:border-charcoal dark:hover:border-offwhite transition-colors"
                            >
                                Login via OTP
                            </button>
                        </form>
                    )}
                </div>

                {/* Right Side: Toggle UI */}
                <div className="flex-1 border-t md:border-t-0 md:border-l border-charcoal/10 dark:border-offwhite/10 pt-10 md:pt-0 md:pl-16">
                    <h2 className="text-3xl font-serif text-charcoal dark:text-offwhite mb-6 transition-colors">
                        {authMode !== 'register' ? "I'm new here" : "Already have an account?"}
                    </h2>
                    <p className="text-charcoal/70 dark:text-offwhite/70 font-light leading-relaxed mb-8 transition-colors">
                        {authMode !== 'register' 
                            ? "Sign up for early Sale access plus tailored new arrivals, trends and promotions. To opt out, click unsubscribe in our emails."
                            : "Log in to access your personal order history, save addresses for faster checkout, and manage your wishlist seamlessly."
                        }
                    </p>
                    <button
                        onClick={() => toggleMode(authMode === 'register' ? 'login' : 'register')}
                        className="w-full border border-charcoal dark:border-offwhite text-charcoal dark:text-offwhite py-4 text-xs uppercase tracking-widest hover:bg-charcoal hover:text-white dark:hover:bg-offwhite dark:hover:text-charcoal transition-all duration-300"
                    >
                        {authMode === 'register' ? 'Log In Instead' : 'Register'}
                    </button>
                </div>

            </div>
        </motion.div>
    );
};

export default Login;