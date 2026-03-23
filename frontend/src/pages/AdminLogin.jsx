import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import API from '../utils/api';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();


  // Check if already logged in and admin
  useEffect(() => {
    const adminInfo = localStorage.getItem('adminInfo');
    if (adminInfo) {
      const user = JSON.parse(adminInfo);
      if (user.isAdmin) {
        navigate(location.state?.from || '/admin');
      }
    }
  }, [navigate, location]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.isAdmin) {
          localStorage.setItem('adminInfo', JSON.stringify(data));
          navigate('/admin');
        } else {
          setError('Access Denied: You do not have admin permissions.');
        }
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-offwhite dark:bg-charcoal flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden">
      
      {/* Background aesthetic elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sand/20 dark:bg-black/20 rounded-full blur-3xl mix-blend-multiply opacity-50"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold/10 dark:bg-gold/5 rounded-full blur-3xl mix-blend-multiply opacity-50"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center mb-6 text-charcoal dark:text-offwhite"
        >
          <div className="w-16 h-16 bg-white dark:bg-black shadow-lg rounded-full flex items-center justify-center border border-charcoal/10 dark:border-offwhite/10">
            <Shield className="w-8 h-8" />
          </div>
        </motion.div>
        <h2 className="text-center text-3xl font-serif tracking-wide text-charcoal dark:text-offwhite">
          Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm text-charcoal/60 dark:text-offwhite/60 uppercase tracking-widest font-sans">
          Secure Access Required
        </p>
        <div className="w-12 h-px bg-gold mx-auto mt-6"></div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="bg-white dark:bg-black py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-charcoal/10 dark:border-offwhite/10"
        >
          <form className="space-y-6" onSubmit={submitHandler}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-4 flex items-start"
              >
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
              </motion.div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-2 font-medium">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-charcoal/40 dark:text-offwhite/40" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-charcoal/20 dark:border-offwhite/20 hover:border-charcoal/40 focus:border-charcoal dark:focus:border-gold transition-colors duration-300 bg-transparent text-charcoal dark:text-offwhite sm:text-sm focus:outline-none focus:ring-0"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-2 font-medium">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-charcoal/40 dark:text-offwhite/40" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-charcoal/20 dark:border-offwhite/20 hover:border-charcoal/40 focus:border-charcoal dark:focus:border-gold transition-colors duration-300 bg-transparent text-charcoal dark:text-offwhite sm:text-sm focus:outline-none focus:ring-0"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent shadow-sm text-xs uppercase tracking-widest font-medium text-white bg-charcoal hover:bg-black dark:bg-offwhite dark:text-charcoal dark:hover:bg-sand focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-charcoal transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 dark:border-charcoal/30 border-t-white dark:border-t-charcoal rounded-full animate-spin"></div>
                ) : (
                  <>
                    Authenticate <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;
