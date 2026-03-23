import { motion } from 'framer-motion';
import Hero from '../components/home/Hero';
import FeaturedCategories from '../components/home/FeaturedCategories';
import NewArrivals from '../components/home/NewArrivals';

const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-offwhite dark:bg-charcoal transition-colors duration-300 min-h-screen"
    >
      <Hero />
      <FeaturedCategories />
      {/* This is where your products are being rendered */}
      <NewArrivals />
    </motion.div>
  );
};

export default Home;