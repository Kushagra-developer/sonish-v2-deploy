import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useRef } from 'react';

const Hero = () => {
  const ref = useRef(null);

  // Track scroll position for parallax
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  // Translate the background image downwards slightly as we scroll down
  const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div ref={ref} className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax effect */}
      <motion.div
        style={{ y: yParallax }}
        className="absolute inset-0 w-full h-full transform-gpu"
      >
        <div className="absolute inset-0 bg-charcoal/30 z-10" /> {/* Subtle overlay */}
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
          alt="Fashion Model"
          className="w-full h-[120%] object-cover object-top -mt-[10%]"
        />
      </motion.div>

      {/* Hero Content */}
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-white text-sm md:text-md uppercase tracking-[0.3em] font-light mb-6 block"
        >
          Autumn / Winter 2026
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-white text-5xl md:text-7xl lg:text-8xl font-serif mb-8 leading-tight tracking-wide"
        >
          Redefining <br /> Modern Elegance
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <Link
            to="/collections"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-sm uppercase tracking-widest text-white overflow-hidden border border-white/50 backdrop-blur-sm transition-all duration-300 hover:border-white w-auto"
          >
            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-white"></span>
            <span className="relative z-10 group-hover:text-charcoal transition-colors duration-500">Shop The Collection</span>
            {/* Background Hover Sweep */}
            <div className="absolute inset-0 h-full w-full bg-white transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100 z-0"></div>
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator - NOW A FUNCTIONAL BUTTON */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center cursor-pointer bg-transparent border-none"
      >
        <span className="text-white/70 text-xs tracking-widest uppercase mb-2">Scroll</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="w-[1px] h-10 bg-white/50"
        />
      </motion.button>
    </div>
  );
};

export default Hero;