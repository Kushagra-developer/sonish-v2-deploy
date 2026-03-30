import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import API from '../../utils/api';

const Hero = () => {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${API}/api/banners`);
        if (res.ok) {
          const data = await res.json();
          setSlides(data || []);
        }
      } catch (err) {
        console.error('Failed to fetch banners:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  if (loading) return <div className="h-[85vh] lg:h-screen bg-charcoal animate-pulse" />;
  if (slides.length === 0) return null; // Or a default banner

  return (
    <div className="relative h-[85vh] lg:h-screen w-full flex items-center justify-center overflow-hidden bg-charcoal">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full"
        >
          <div className="absolute inset-0 bg-black/40 z-10" />
          <motion.img
            initial={{ scale: 1.02 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: 'linear' }}
            src={slides[currentSlide]?.image}
            alt={slides[currentSlide]?.title}
            className="w-full h-full object-cover object-top lg:object-[center_10%]"
          />
        </motion.div>
      </AnimatePresence>

      {/* Hero Content Layer */}
      <div className="relative z-30 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <span className="text-white text-sm md:text-md uppercase tracking-[0.4em] font-light mb-6 block border-b border-white/30 pb-2">
              {slides[currentSlide]?.subtitle}
            </span>
            <h1 className="text-white text-5xl md:text-8xl lg:text-9xl font-serif mb-8 leading-tight tracking-tight drop-shadow-2xl">
              {slides[currentSlide]?.title}
            </h1>
            <p className="text-white/80 text-lg md:text-xl font-light mb-10 max-w-2xl tracking-wide italic">
              {slides[currentSlide]?.description}
            </p>
            <Link
              to={slides[currentSlide]?.link || '/collections'}
              className="group relative inline-flex items-center justify-center px-12 py-5 text-xs uppercase tracking-[0.3em] text-white overflow-hidden border border-white/50 backdrop-blur-sm transition-all duration-500 hover:border-white w-auto"
            >
              <span className="relative z-10 group-hover:text-charcoal transition-colors duration-500 font-bold">Discover The Edit</span>
              <div className="absolute inset-0 h-full w-full bg-white transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100 z-0"></div>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Navigation */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 flex items-center gap-8">
        <button onClick={prevSlide} className="text-white/50 hover:text-white transition-colors duration-300">
          <ChevronLeft className="w-8 h-8" />
        </button>
        <div className="flex gap-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${currentSlide === i ? 'bg-white w-12' : 'bg-white/30'}`}
            />
          ))}
        </div>
        <button onClick={nextSlide} className="text-white/50 hover:text-white transition-colors duration-300">
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        className="absolute bottom-10 right-10 z-30 hidden lg:flex flex-col items-center cursor-pointer opacity-40 hover:opacity-100 transition-opacity"
      >
        <div className="w-[1px] h-20 bg-white/50 relative overflow-hidden">
          <motion.div
            animate={{ y: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="w-full h-1/2 bg-white"
          />
        </div>
      </motion.button>
    </div>
  );
};

export default Hero;