import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setIsVisible(false);
    localStorage.setItem('cookieConsent', 'accepted');
  };

  const handleDecline = () => {
    setIsVisible(false);
    localStorage.setItem('cookieConsent', 'declined');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 w-full z-[100] p-4 md:p-6 pointer-events-none"
        >
          <div className="max-w-4xl mx-auto bg-charcoal text-white rounded-xl shadow-2xl p-6 pointer-events-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h4 className="font-serif text-lg mb-2">We value your privacy</h4>
              <p className="text-white/70 text-sm font-light leading-relaxed">
                We use cookies and similar technologies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
                <Link to="/privacy" className="ml-1 underline hover:text-gold transition-colors">Read Policy</Link>
              </p>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button 
                onClick={handleDecline}
                className="flex-1 md:flex-none px-6 py-3 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors"
              >
                Decline
              </button>
              <button 
                onClick={handleAccept}
                className="flex-1 md:flex-none px-8 py-3 bg-white text-charcoal text-xs uppercase tracking-widest hover:bg-gold hover:text-white transition-colors duration-300"
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
