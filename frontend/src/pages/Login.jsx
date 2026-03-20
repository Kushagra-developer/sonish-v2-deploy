import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-offwhite dark:bg-charcoal transition-colors duration-300"
        >
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-16">

                {/* Left Side: Login */}
                <div className="flex-1">
                    <h2 className="text-3xl font-serif text-charcoal dark:text-offwhite mb-8 transition-colors">Login</h2>
                    <form className="space-y-6">
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-2">Email address *</label>
                            <input type="email" required className="w-full bg-transparent border-b border-charcoal/20 dark:border-offwhite/20 py-2 outline-none focus:border-charcoal dark:focus:border-offwhite transition-colors text-charcoal dark:text-offwhite" />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-2">Password *</label>
                            <input type="password" required className="w-full bg-transparent border-b border-charcoal/20 dark:border-offwhite/20 py-2 outline-none focus:border-charcoal dark:focus:border-offwhite transition-colors text-charcoal dark:text-offwhite" />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="accent-charcoal dark:accent-offwhite" />
                                <span className="text-sm text-charcoal/70 dark:text-offwhite/70">Remember me</span>
                            </label>
                            <a href="#" className="text-sm text-charcoal/70 dark:text-offwhite/70 hover:text-gold transition-colors">Lost your password?</a>
                        </div>

                        <button type="submit" className="w-full bg-charcoal dark:bg-offwhite text-white dark:text-charcoal py-4 text-xs uppercase tracking-widest hover:bg-black dark:hover:bg-white transition-colors">
                            Log In
                        </button>
                    </form>
                </div>

                {/* Right Side: Register */}
                <div className="flex-1 border-t md:border-t-0 md:border-l border-charcoal/10 dark:border-offwhite/10 pt-10 md:pt-0 md:pl-16">
                    <h2 className="text-3xl font-serif text-charcoal dark:text-offwhite mb-6 transition-colors">I'm new here</h2>
                    <p className="text-charcoal/70 dark:text-offwhite/70 font-light leading-relaxed mb-8 transition-colors">
                        Sign up for early Sale access plus tailored new arrivals, trends and promotions. To opt out, click unsubscribe in our emails.
                    </p>
                    <button
                        className="w-full border border-charcoal dark:border-offwhite text-charcoal dark:text-offwhite py-4 text-xs uppercase tracking-widest hover:bg-charcoal hover:text-white dark:hover:bg-offwhite dark:hover:text-charcoal transition-all duration-300"
                    >
                        Register
                    </button>
                </div>

            </div>
        </motion.div>
    );
};

export default Login;