import { motion } from 'framer-motion';
import Hero from '../components/home/Hero';
import Editorial from '../components/home/Editorial';
import ShopByCategory from '../components/home/ShopByCategory';
import TrendingNow from '../components/home/TrendingNow';

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
      <ShopByCategory />
      <TrendingNow />
      <Editorial />
    </motion.div>
  );
};

export default Home;