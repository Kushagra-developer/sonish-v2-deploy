import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const categories = [
  {
    title: 'Women',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop',
    link: '/collections?category=Women'
  },
  {
    title: 'Accessories',
    image: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?q=80&w=800&auto=format&fit=crop',
    link: '/collections?category=Accessories'
  }
];

const FeaturedCategories = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-offwhite dark:bg-charcoal transition-colors duration-300">
      <div className="flex justify-between items-end mb-12">
        <h2 className="text-3xl md:text-4xl font-serif text-charcoal dark:text-offwhite tracking-wide transition-colors duration-300">Explore Categories</h2>
        <Link to="/collections" className="hidden md:inline-block text-sm uppercase tracking-widest text-charcoal dark:text-offwhite border-b border-charcoal/30 dark:border-offwhite/30 hover:border-charcoal dark:hover:border-offwhite pb-1 transition-colors duration-300">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {categories.map((category, index) => (
          <Link
            key={index}
            to={category.link}
            className="group relative h-[600px] w-full overflow-hidden block"
          >
            {/* Image Container with Zoom Effect */}
            <motion.div
              className="absolute inset-0 w-full h-full"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <img
                src={category.image}
                alt={category.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-charcoal/20 group-hover:bg-charcoal/10 transition-colors duration-500" />
            </motion.div>

            {/* Title */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-4/5 text-center">
              <div className="bg-white/90 dark:bg-charcoal/90 backdrop-blur-sm py-4 px-6 shadow-sm overflow-hidden relative transition-colors duration-300">
                <span className="relative z-10 text-charcoal dark:text-offwhite font-serif text-xl tracking-wider transition-colors duration-300">{category.title}</span>
                {/* Button slide effect */}
                <div className="absolute inset-0 bg-charcoal dark:bg-offwhite transform scale-y-0 origin-bottom transition-transform duration-300 ease-out group-hover:scale-y-100 mix-blend-multiply opacity-5"></div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 text-center md:hidden">
        <Link to="/collections" className="inline-block text-sm uppercase tracking-widest text-charcoal dark:text-offwhite border-b border-charcoal/30 dark:border-offwhite/30 hover:border-charcoal dark:hover:border-offwhite pb-1 transition-colors duration-300">
          View All Collections
        </Link>
      </div>
    </section>
  );
};

export default FeaturedCategories;