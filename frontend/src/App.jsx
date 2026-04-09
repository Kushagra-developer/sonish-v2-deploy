import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import API from './utils/api';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CookieBanner from './components/layout/CookieBanner';
import Assistant from './components/ui/Assistant';
import AdminAssistant from './components/ui/AdminAssistant';

// Lazy load pages for performance
const Home = lazy(() => import('./pages/Home'));
const Collections = lazy(() => import('./pages/Collections'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Returns = lazy(() => import('./pages/Returns'));
const Shipping = lazy(() => import('./pages/Shipping'));
const Terms = lazy(() => import('./pages/Terms'));
const Login = lazy(() => import('./pages/Login'));
const FAQ = lazy(() => import('./pages/FAQ'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Search = lazy(() => import('./pages/Search'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Maintenance = lazy(() => import('./pages/Maintenance'));

// Loading component for Suspense
const PageLoader = () => (
  <div className="min-h-screen bg-offwhite dark:bg-charcoal transition-colors duration-300 flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Protected Admin Route wrapper
const PrivateAdminRoute = ({ children }) => {
  const adminInfo = localStorage.getItem('adminInfo');
  if (adminInfo) {
    const user = JSON.parse(adminInfo);
    if (user.isAdmin) {
      return children;
    }
  }
  return <Navigate to="/admin/login" replace />;
};

const AppLayout = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  const envMaintenance = import.meta.env.VITE_MAINTENANCE_MODE === 'true';
  const [apiMaintenance, setApiMaintenance] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasFetchedGlobal, setHasFetchedGlobal] = useState(false);

  useEffect(() => {
    // Only fetch global settings and health once to prevent re-fetching on every route change
    if (hasFetchedGlobal) return;

    const fetchGlobalData = async () => {
      try {
        // 1. Fetch Maintenance Status
        const healthRes = await fetch(`${API}/api/health`);
        const healthData = await healthRes.json();
        setApiMaintenance(healthData.maintenance);

        // 2. Fetch System Settings (Font)
        const settingsRes = await fetch(`${API}/api/settings`);
        const settingsData = await settingsRes.json();
        if (settingsData.activeFont) {
          applyFont(settingsData.activeFont);
        }
      } catch (err) {
        console.error('Error fetching global data:', err);
      } finally {
        setIsChecking(false);
        setHasFetchedGlobal(true);
      }
    };

    fetchGlobalData();
  }, [hasFetchedGlobal]);

  const applyFont = (fontValue) => {
    const fontName = fontValue.split(',')[0].replace(/'/g, '').trim();
    const googleFontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`;
    
    let link = document.getElementById('dynamic-font-link');
    if (!link) {
      link = document.createElement('link');
      link.id = 'dynamic-font-link';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = googleFontUrl;
    document.documentElement.style.setProperty('--font-primary', fontValue);
  };

  const isMaintenanceMode = envMaintenance || apiMaintenance;

  if (isChecking && !isAdminRoute) {
    return <PageLoader />;
  }
  
  if (isMaintenanceMode && !isAdminRoute) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Maintenance />
      </Suspense>
    );
  }

  return (
    <div className="flex flex-col min-h-screen relative">
      {!isAdminRoute && <Navbar />}
      
      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/login" element={<Login />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/search" element={<Search />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={
                <PrivateAdminRoute>
                  <AdminDashboard />
                </PrivateAdminRoute>
              } />
              <Route path="/admin/login" element={<AdminLogin />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

      {!isAdminRoute && (
        <>
          <Footer />
          <CookieBanner />
          <Assistant />
        </>
      )}
      
      {isAdminRoute && <AdminAssistant />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;