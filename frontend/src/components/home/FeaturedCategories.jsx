import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const categories = [
  {
    title: 'New Arrivals',
    subtitle: 'The Latest Edit',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0610917c1?q=80&w=800&auto=format&fit=crop',
    link: '/collections'
  },
  {
    title: 'Evening Wear',
    subtitle: 'Timeless Elegance',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop',
    link: '/collections?category=Women'
  },
  {
    title: 'The Day Boutique',
    subtitle: 'Urban Sophistication',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
    link: '/collections?category=Women'
  }
];

const FeaturedCategories = () => {
  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-offwhite dark:bg-charcoal transition-colors duration-500">
      <div className="flex flex-col items-center mb-20 text-center">
        <h2 className="text-4xl md:text-6xl font-serif text-charcoal dark:text-offwhite tracking-tight mb-4">Curated Boutiques</h2>
        <div className="w-24 h-[1px] bg-gold/50 mb-6"></div>
        <p className="text-charcoal/60 dark:text-offwhite/60 text-sm md:text-lg max-w-xl font-light tracking-wide uppercase">
          Explore our handpicked selections for every occasion.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {categories.map((category, index) => (
          <Link
            key={index}
            to={category.link}
            className="group relative h-[700px] w-full overflow-hidden block"
          >
            {/* Image Container with Zoom Effect */}
            <motion.div
              className="absolute inset-0 w-full h-full"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 1.5, ease: [0.33, 1, 0.68, 1] }}
            >
              <img
                src={category.image}
                alt={category.title}
                className="w-full h-full object-cover object-center grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-charcoal/30 group-hover:bg-charcoal/10 transition-colors duration-1000" />
            </motion.div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-8 text-center bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <span className="text-white/70 text-[10px] uppercase tracking-[0.4em] mb-2">{category.subtitle}</span>
              <h3 className="text-white font-serif text-3xl tracking-wide mb-6">{category.title}</h3>
              <div className="flex justify-center">
                <span className="text-white text-[10px] uppercase tracking-widest border-b border-white/50 pb-1 group-hover:border-white transition-colors">Shop Selection</span>
              </div>
            </div>

            {/* Static Content (Always visible) */}
             <div className="absolute inset-0 flex flex-col justify-end p-8 pointer-events-none group-hover:hidden transition-all duration-500">
                <h3 className="text-white font-serif text-3xl tracking-wide text-center drop-shadow-lg">{category.title}</h3>
             </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCategories;