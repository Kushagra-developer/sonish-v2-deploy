import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../utils/api';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState(null);
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

    const submitHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const endpoint = isLogin ? '/api/users/login' : '/api/users';
        const payload = isLogin ? { email, password } : { name, email, password };

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
                        {isLogin ? 'Login' : 'Create Account'}
                    </h2>
                    
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 mb-4 text-sm border border-red-200">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={submitHandler}>
                        {!isLogin && (
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

                        {isLogin && (
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="accent-charcoal dark:accent-offwhite" />
                                    <span className="text-sm text-charcoal/70 dark:text-offwhite/70">Remember me</span>
                                </label>
                                <a href="#" className="text-sm text-charcoal/70 dark:text-offwhite/70 hover:text-gold transition-colors">Lost your password?</a>
                            </div>
                        )}

                        <button disabled={isLoading} type="submit" className="w-full bg-charcoal dark:bg-offwhite text-white dark:text-charcoal py-4 text-xs uppercase tracking-widest hover:bg-black dark:hover:bg-white transition-colors disabled:opacity-50">
                            {isLoading ? 'Processing...' : (isLogin ? 'Log In' : 'Register')}
                        </button>
                    </form>
                </div>

                {/* Right Side: Toggle UI */}
                <div className="flex-1 border-t md:border-t-0 md:border-l border-charcoal/10 dark:border-offwhite/10 pt-10 md:pt-0 md:pl-16">
                    <h2 className="text-3xl font-serif text-charcoal dark:text-offwhite mb-6 transition-colors">
                        {isLogin ? "I'm new here" : "Already have an account?"}
                    </h2>
                    <p className="text-charcoal/70 dark:text-offwhite/70 font-light leading-relaxed mb-8 transition-colors">
                        {isLogin 
                            ? "Sign up for early Sale access plus tailored new arrivals, trends and promotions. To opt out, click unsubscribe in our emails."
                            : "Log in to access your personal order history, save addresses for faster checkout, and manage your wishlist seamlessly."
                        }
                    </p>
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="w-full border border-charcoal dark:border-offwhite text-charcoal dark:text-offwhite py-4 text-xs uppercase tracking-widest hover:bg-charcoal hover:text-white dark:hover:bg-offwhite dark:hover:text-charcoal transition-all duration-300"
                    >
                        {isLogin ? 'Register' : 'Log In Instead'}
                    </button>
                </div>

            </div>
        </motion.div>
    );
};

export default Login;