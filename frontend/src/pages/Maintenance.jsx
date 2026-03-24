import { motion } from 'framer-motion';
import { Instagram, Mail, MessageCircle } from 'lucide-react';

const Maintenance = () => {
    return (
        <div className="min-h-screen bg-charcoal flex flex-col items-center justify-center relative overflow-hidden px-6">
            {/* Animated Background Elements */}
            <motion.div 
                animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                    opacity: [0.3, 0.2, 0.3]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/10 rounded-full blur-[120px]"
            />
            <motion.div 
                animate={{ 
                    scale: [1, 1.5, 1],
                    rotate: [0, -120, 0],
                    opacity: [0.2, 0.1, 0.2]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[150px]"
            />

            {/* Content Container */}
            <div className="relative z-10 text-center max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <h1 className="font-serif text-5xl md:text-7xl text-white tracking-[0.2em] mb-8">SONISH</h1>
                    <div className="w-12 h-px bg-gold/50 mx-auto mb-12"></div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1.5 }}
                >
                    <h2 className="text-sand text-xs md:text-sm uppercase tracking-[0.4em] font-light mb-6 opacity-80">
                        Refining the Collection
                    </h2>
                    <p className="text-white/60 text-sm md:text-base font-light leading-relaxed mb-12 max-w-md mx-auto">
                        We are currently enhancing your shopping experience with new silhouettes and elevated craftsmanship. Sonish will return shortly.
                    </p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="flex items-center justify-center gap-8 text-white/40"
                >
                    <a href="https://instagram.com/sonish" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors duration-300">
                        <Instagram className="w-5 h-5" />
                    </a>
                    <a href="mailto:contact@sonish.co.in" className="hover:text-gold transition-colors duration-300">
                        <Mail className="w-5 h-5" />
                    </a>
                    <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors duration-300">
                        <MessageCircle className="w-5 h-5" />
                    </a>
                </motion.div>
            </div>

            {/* Bottom Footer Detail */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 2 }}
                className="absolute bottom-12 left-0 w-full text-center"
            >
                <p className="text-[10px] text-white/50 uppercase tracking-[0.3em] font-light">
                    Establishment of Elegance • {new Date().getFullYear()}
                </p>
            </motion.div>
        </div>
    );
};

export default Maintenance;
