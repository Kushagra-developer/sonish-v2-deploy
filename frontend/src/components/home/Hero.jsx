import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useRef } from 'react';

const Hero = () => {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <div ref={ref} className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-charcoal">
      {/* Background Layer - Lower Z-index */}
      <motion.div
        style={{ y: yParallax }}
        className="absolute inset-0 w-full h-full transform-gpu z-0"
      >
        <div className="absolute inset-0 bg-black/40 z-10" />
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
          alt="Fashion Model"
          className="w-full h-full object-cover object-top"
        />
      </motion.div>

      {/* Hero Content Layer - High Z-index */}
      <div className="relative z-30 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
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
          className="relative z-40" // Extra safety for clickability
        >
          <Link
            to="/collections"
            className="group relative inline-flex items-center justify-center px-10 py-5 text-sm uppercase tracking-widest text-white overflow-hidden border border-white/50 backdrop-blur-sm transition-all duration-300 hover:border-white w-auto pointer-events-auto"
          >
            <span className="relative z-10 group-hover:text-charcoal transition-colors duration-500 font-bold">Shop The Collection</span>
            <div className="absolute inset-0 h-full w-full bg-white transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100 z-0"></div>
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30 flex flex-col items-center cursor-pointer bg-transparent border-none outline-none"
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