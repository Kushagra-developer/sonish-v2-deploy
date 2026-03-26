import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import API from './utils/api';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CookieBanner from './components/layout/CookieBanner';
// Assuming you have these assistant components built!
import Assistant from './components/ui/Assistant';
import AdminAssistant from './components/ui/AdminAssistant';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Returns from './pages/Returns';
import Shipping from './pages/Shipping';
import Terms from './pages/Terms';
// Import your Pages
import Home from './pages/Home';
import Collections from './pages/Collections';
import Login from './pages/Login';
import FAQ from './pages/FAQ';
import ProductDetails from './pages/ProductDetails';
import Search from './pages/Search';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import Maintenance from './pages/Maintenance';
import { Navigate } from 'react-router-dom';

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

// Inner component to access the router's useLocation hook
const AppLayout = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  // Maintenance Mode Logic
  const envMaintenance = import.meta.env.VITE_MAINTENANCE_MODE === 'true';
  const [apiMaintenance, setApiMaintenance] = useState(false);
  const [isChecking, setIsChecking] = useState(!isAdminRoute);
  const [activeFont, setActiveFont] = useState("'Inter', sans-serif");

  useEffect(() => {
    // 1. Fetch Maintenance Status
    if (!isAdminRoute) {
      setIsChecking(true);
      fetch(`${API}/api/health`)
        .then(res => res.json())
        .then(data => {
          setApiMaintenance(data.maintenance);
          setIsChecking(false);
        })
        .catch(() => setIsChecking(false));
    } else {
      setIsChecking(false);
    }

    // 2. Fetch System Settings (Font)
    fetch(`${API}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.activeFont) {
          setActiveFont(data.activeFont);
          applyFont(data.activeFont);
        }
      })
      .catch(err => console.error('Error fetching settings:', err));
  }, [location.pathname, isAdminRoute]);

  const applyFont = (fontValue) => {
    // Extract font name for Google Fonts URL
    // e.g., "'Playfair Display', serif" -> "Playfair+Display"
    const fontName = fontValue.split(',')[0].replace(/'/g, '').trim();
    const googleFontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`;
    
    // Check if link already exists
    let link = document.getElementById('dynamic-font-link');
    if (!link) {
      link = document.createElement('link');
      link.id = 'dynamic-font-link';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = googleFontUrl;

    // Apply to root
    document.documentElement.style.setProperty('--font-primary', fontValue);
  };

  const isMaintenanceMode = envMaintenance || apiMaintenance;

  if (isChecking && !isMaintenanceMode) {
    return <div className="min-h-screen bg-offwhite dark:bg-charcoal transition-colors duration-300 flex items-center justify-center"></div>;
  }
  
  if (isMaintenanceMode && !isAdminRoute) {
    return <Maintenance />;
  }

  return (
    <div className="flex flex-col min-h-screen relative">
      {!isAdminRoute && <Navbar />}
      
      <main className="flex-grow">
        <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        {/* ADDED THE COLLECTIONS ROUTE HERE */}
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
      </main>

      {!isAdminRoute && (
        <>
          <Footer />
          <CookieBanner />
          <Assistant />
        </>
      )}
      
      {/* Admin Assistant should only show on Admin routes */}
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