import { motion } from 'framer-motion';
import Hero from '../components/home/Hero';
import Hero from '../components/home/Hero';
import Editorial from '../components/home/Editorial';

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
      <Editorial />
    </motion.div>
  );
};

export default Home;