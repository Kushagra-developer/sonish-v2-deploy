import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import API from '../../utils/api';

const Editorial = () => {
  const containerRef = useRef(null);
  const [editorialImage, setEditorialImage] = useState("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80\u0026w=1200\u0026auto=format\u0026fit=crop");
  
  useEffect(() => {
    fetch(`${API}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.editorialImage) setEditorialImage(data.editorialImage);
      })
      .catch(err => console.error('Error fetching editorial image:', err));
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section ref={containerRef} className="py-40 bg-white dark:bg-charcoal overflow-hidden px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        <div className="relative h-[800px] overflow-hidden group">
          <motion.div style={{ y }} className="absolute -inset-y-20 inset-x-0">
            <img 
              src={editorialImage} 
              alt="Editorial Lookbook" 
              className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
            />
          </motion.div>
          <div className="absolute inset-0 border-[20px] border-white dark:border-charcoal pointer-events-none" />
        </div>
        
        <div className="space-y-12 lg:pl-12">
          <div className="space-y-6">
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold font-bold">Studio Philosophy</span>
            <h3 className="text-5xl md:text-7xl font-serif text-charcoal dark:text-offwhite leading-tight italic">
              Where Art Meets <br /> Modern Silhouette
            </h3>
          </div>
          
          <p className="text-charcoal/60 dark:text-offwhite/60 leading-relaxed text-lg font-light max-w-lg italic">
            "Sonish is more than a boutique; it's a dialogue between traditional craftsmanship and the fluid nature of contemporary life. We believe in pieces that tell a story without saying a word."
          </p>
          
          <div className="pt-8">
            <div className="w-32 h-[1px] bg-gold/30 mb-8" />
            <p className="text-[10px] tracking-widest uppercase text-charcoal/40 dark:text-offwhite/40 font-bold">
              Established 2026 • New Delhi
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Editorial;
