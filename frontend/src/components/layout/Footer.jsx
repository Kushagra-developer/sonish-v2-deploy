import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, ShieldCheck, Lock, CreditCard } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-charcoal text-sand py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand & Mission */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="font-serif text-2xl mb-4 tracking-wider text-white">SONISH</h3>
            <p className="text-sm font-light leading-relaxed opacity-80 mb-6">
              Redefining modern elegance through timeless silhouettes and uncompromising craftsmanship.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-gold transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="hover:text-gold transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="hover:text-gold transition-colors"><Facebook className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Links: Shop */}
          <div>
            <h4 className="text-xs tracking-[0.3em] uppercase mb-8 font-bold text-white">Boutique</h4>
            <ul className="space-y-4 text-xs font-light tracking-widest opacity-60">
              <li><Link to="/collections" className="hover:text-gold hover:opacity-100 transition-all duration-300">The Seasonal Edit</Link></li>
              <li><Link to="/collections?category=Women" className="hover:text-gold hover:opacity-100 transition-all duration-300">Women's Collection</Link></li>
              <li><Link to="/search" className="hover:text-gold hover:opacity-100 transition-all duration-300">Search Boutique</Link></li>
            </ul>
          </div>

          {/* Links: Support & Company */}
          <div>
            <h4 className="text-sm tracking-widest uppercase mb-6 font-semibold text-white">Company</h4>
            <ul className="space-y-3 text-sm font-light opacity-80">
              <li><Link to="/about" className="hover:text-gold hover:opacity-100 transition">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-gold hover:opacity-100 transition">Contact Us</Link></li>
              <li><Link to="/returns" className="hover:text-gold hover:opacity-100 transition">Returns + Exchanges</Link></li>
              <li><Link to="/shipping" className="hover:text-gold hover:opacity-100 transition">Shipping Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter & Trust Badges */}
          <div>
            <h4 className="text-sm tracking-widest uppercase mb-6 font-semibold text-white">Newsletter</h4>
            <p className="text-sm font-light opacity-80 mb-4">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form className="flex border-b border-sand/30 focus-within:border-gold transition-colors pb-2 mb-8">
              <input
                type="email"
                placeholder="Enter your email address"
                className="bg-transparent border-none outline-none text-sm w-full placeholder-sand/50 text-white"
              />
              <button type="submit" className="text-xs uppercase tracking-wider hover:text-gold transition-colors ml-2">
                Subscribe
              </button>
            </form>

            <h4 className="text-xs tracking-widest uppercase mb-4 font-semibold text-white/50">Secure Shopping</h4>
            <div className="flex items-center space-x-4 text-white/50">
              <div className="flex flex-col items-center group hover:text-white transition-colors">
                <ShieldCheck className="w-6 h-6 mb-1" />
                <span className="text-[10px] tracking-wider uppercase">Authentic</span>
              </div>
              <div className="flex flex-col items-center group hover:text-white transition-colors">
                <Lock className="w-6 h-6 mb-1" />
                <span className="text-[10px] tracking-wider uppercase">256-bit SSL</span>
              </div>
              <div className="flex flex-col items-center group hover:text-white transition-colors">
                <CreditCard className="w-6 h-6 mb-1" />
                <span className="text-[10px] tracking-wider uppercase">Secure Pay</span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-sand/10 flex flex-col md:flex-row justify-between items-center text-xs font-light opacity-60">
          <p>&copy; {new Date().getFullYear()} Sonish Studios. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-gold transition">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gold transition">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;