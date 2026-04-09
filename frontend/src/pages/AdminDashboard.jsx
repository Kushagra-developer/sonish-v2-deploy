import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, DollarSign, TrendingUp, Eye, CheckCircle, Clock, ChevronDown, ChevronUp, LayoutDashboard, Tag, Truck, Image, Plus, Trash2, Edit2, ExternalLink, ShieldCheck, Lock, Save, Power, Layers, Upload, X, GripVertical, Users } from 'lucide-react';
import API from '../utils/api';
import { authFetch, authJsonFetch } from '../utils/authFetch';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    price: '', 
    originalPrice: '', 
    category: '', 
    countInStock: '', 
    image: '', 
    description: '', 
    sizeAndFit: '',
    materialAndCare: '',
    specifications: [
      { label: 'Type', value: '' },
      { label: 'Length', value: '' },
      { label: 'Hemline', value: '' },
      { label: 'Knit or Woven', value: '' },
      { label: 'Closure', value: '' },
      { label: 'Transparency', value: '' }
    ],
    sizes: [{size: 'S', stock: 0}, {size: 'M', stock: 0}, {size: 'L', stock: 0}, {size: 'XL', stock: 0}],
    sizeChart: ''
  });
  const [editFormData, setEditFormData] = useState(null);
  const [addLoading, setAddLoading] = useState(false);
  const [trackingAWBs, setTrackingAWBs] = useState({});
  const [isSavingTracking, setIsSavingTracking] = useState({});
  const [banners, setBanners] = useState([]);
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [newBanner, setNewBanner] = useState({ title: '', subtitle: '', description: '', image: '', link: '/collections', order: 0 });
  const [bannerLoading, setBannerLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  // Categories
  const [categories, setCategories] = useState([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', image: '', order: 0, parent: '', isComingSoon: false });
  const [categoryLoading, setCategoryLoading] = useState(false);
  // Maintenance
  const [siteOnline, setSiteOnline] = useState(true);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  // Multi-image for products
  const [productImages, setProductImages] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  // Coupons
  const [coupons, setCoupons] = useState([]);
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [newCoupon, setNewCoupon] = useState({ code: '', discountType: 'percentage', discountAmount: '', minPurchase: 0, expiryDate: '', usageLimit: '' });
  const [couponLoading, setCouponLoading] = useState(false);
  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);

  // Design / Settings States
  const [settings, setSettings] = useState({ activeFont: "'Inter', sans-serif", editorialImage: '' });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const FONT_OPTIONS = [
    { name: 'Inter (Default)', value: "'Inter', sans-serif" },
    { name: 'Playfair Display (Elegant)', value: "'Playfair Display', serif" },
    { name: 'Bodoni Moda (High-End)', value: "'Bodoni Moda', serif" },
    { name: 'Montserrat (Modern)', value: "'Montserrat', sans-serif" },
    { name: 'Cormorant Garamond (Sophisticated)', value: "'Cormorant Garamond', serif" },
    { name: 'Outfit (Minimalist)', value: "'Outfit', sans-serif" },
    { name: 'Prata (Editorial)', value: "'Prata', serif" },
    { name: 'Work Sans (Clean)', value: "'Work Sans', sans-serif" },
  ];

  const handleLogout = async () => {
    try {
      await authFetch(`${API}/api/users/logout`, { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('adminInfo');
    window.location.href = '/admin/login';
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const results = await Promise.allSettled([
          authFetch(`${API}/api/products/admin`),
          authFetch(`${API}/api/orders`),
          authFetch(`${API}/api/banners/admin`),
          authFetch(`${API}/api/categories/admin`),
           authFetch(`${API}/api/admin/maintenance`),
          authFetch(`${API}/api/coupons`),
          authFetch(`${API}/api/notifications`),
          fetch(`${API}/api/settings`),
          authFetch(`${API}/api/users`),
        ]);

        const [prodRes, orderRes, bannersRes, catRes, maintRes, couponsRes, notifRes, settingsRes, usersRes] = results;

        if (prodRes.status === 'fulfilled' && prodRes.value.ok) {
          setProducts(await prodRes.value.json());
        }
        
        if (orderRes.status === 'fulfilled' && orderRes.value.ok) {
          setOrders(await orderRes.value.json());
        }

        if (bannersRes && bannersRes.status === 'fulfilled' && bannersRes.value.ok) {
          setBanners(await bannersRes.value.json());
        }

        if (catRes && catRes.status === 'fulfilled' && catRes.value.ok) {
          setCategories(await catRes.value.json());
        }

        if (maintRes && maintRes.status === 'fulfilled' && maintRes.value.ok) {
          const mData = await maintRes.value.json();
          setSiteOnline(!mData.maintenance);
        }

        if (couponsRes && couponsRes.status === 'fulfilled' && couponsRes.value.ok) {
          setCoupons(await couponsRes.value.json());
        }

        if (settingsRes && settingsRes.status === 'fulfilled' && settingsRes.value.ok) {
          setSettings(await settingsRes.value.json());
        }

        if (notifRes && notifRes.status === 'fulfilled' && notifRes.value.ok) {
          setNotifications(await notifRes.value.json());
        }

        if (usersRes && usersRes.status === 'fulfilled' && usersRes.value.ok) {
          setUsers(await usersRes.value.json());
        }
      } catch (err) {
        console.error('Admin fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await authJsonFetch(`${API}/api/settings`, {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        // Apply immediately to local preview
        document.documentElement.style.setProperty('--font-primary', updated.activeFont);
        
        // Dynamically load font if not already loaded (matching App.jsx logic)
        const fontName = updated.activeFont.split(',')[0].replace(/'/g, '').trim();
        const googleFontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`;
        let link = document.getElementById('dynamic-font-link');
        if (!link) {
          link = document.createElement('link');
          link.id = 'dynamic-font-link';
          link.rel = 'stylesheet';
          document.head.appendChild(link);
        }
        link.href = googleFontUrl;
        
        alert('Site settings updated successfully!');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to update settings.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleUpdateNotificationStatus = async (id, status) => {
    try {
      const res = await authJsonFetch(`${API}/api/notifications/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setNotifications(notifications.map(n => n._id === id ? { ...n, status } : n));
      }
    } catch (err) {
      console.error('Error updating notification:', err);
    }
  };

  const totalRevenue = orders
    .filter(o => o.isPaid)
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const paidOrders = orders.filter(o => o.isPaid).length;
  const pendingOrders = orders.filter(o => !o.isPaid).length;
  const deliveredOrders = orders.filter(o => o.isDelivered).length;

  const handleBannerSave = async (e) => {
    e.preventDefault();
    setBannerLoading(true);
    try {
      const url = editingBanner 
        ? `${API}/api/banners/${editingBanner._id}` 
        : `${API}/api/banners`;
      const method = editingBanner ? 'PUT' : 'POST';
      
      const res = await authJsonFetch(url, {
        method,
        body: JSON.stringify(newBanner)
      });
      
      if (res.ok) {
        const saved = await res.json();
        if (editingBanner) {
          setBanners(banners.map(b => b._id === saved._id ? saved : b));
        } else {
          setBanners([...banners, saved]);
        }
        setIsAddingBanner(false);
        setEditingBanner(null);
        setNewBanner({ title: '', subtitle: '', description: '', image: '', link: '/collections', order: 0 });
      }
    } catch (err) {
      console.error('Banner save error:', err);
    } finally {
      setBannerLoading(false);
    }
  };

  const handleBannerDelete = async (id) => {
    if (window.confirm('Delete this banner?')) {
      try {
        const res = await authFetch(`${API}/api/banners/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setBanners(banners.filter(b => b._id !== id));
        }
      } catch (err) {
        console.error('Banner delete error:', err);
      }
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return alert('Passwords do not match');
    }
    setPasswordLoading(true);
    try {
      const res = await authJsonFetch(`${API}/api/users/profile`, {
        method: 'PUT',
        body: JSON.stringify({
          password: passwordData.newPassword
        })
      });
      if (res.ok) {
        alert('Password Updated Successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to update password');
      }
    } catch (err) {
      alert('Error updating password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleToggleMaintenance = async () => {
    setMaintenanceLoading(true);
    try {
      const res = await authJsonFetch(`${API}/api/admin/maintenance`, {
        method: 'PUT',
        body: JSON.stringify({ maintenance: siteOnline })
      });
      if (res.ok) {
        const data = await res.json();
        setSiteOnline(!data.maintenance);
      }
    } catch (err) {
      alert('Failed to toggle maintenance mode');
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const handleCategorySave = async (e) => {
    e.preventDefault();
    setCategoryLoading(true);
    try {
      const url = editingCategory ? `${API}/api/categories/${editingCategory._id}` : `${API}/api/categories`;
      const method = editingCategory ? 'PUT' : 'POST';
      const res = await authJsonFetch(url, { method, body: JSON.stringify(newCategory) });
      if (res.ok) {
        const saved = await res.json();
        if (editingCategory) {
          setCategories(categories.map(c => c._id === saved._id ? saved : c));
        } else {
          setCategories([...categories, saved]);
        }
        setIsAddingCategory(false);
        setEditingCategory(null);
        setNewCategory({ name: '', description: '', image: '', order: 0 });
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Failed to save category');
      }
    } catch (err) {
      alert('Error saving category');
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleCategoryDelete = async (id) => {
    if (window.confirm('Delete this category?')) {
      try {
        const res = await authFetch(`${API}/api/categories/${id}`, { method: 'DELETE' });
        if (res.ok) setCategories(categories.filter(c => c._id !== id));
      } catch (err) { alert('Failed to delete category'); }
    }
  };

  const handleProductDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        const res = await authFetch(`${API}/api/products/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setProducts(products.filter(p => p._id !== id));
        } else {
          const err = await res.json().catch(() => ({}));
          alert(err.message || 'Failed to delete product');
        }
      } catch (err) {
        alert('Error deleting product');
      }
    }
  };

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setProductImages([...productImages, imageUrlInput.trim()]);
      setImageUrlInput('');
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.size > 50 * 1024 * 1024) { alert(`${file.name} is too large (max 50MB)`); return; }
      const reader = new FileReader();
      reader.onloadend = () => setProductImages(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleCouponSave = async (e) => {
    e.preventDefault();
    setCouponLoading(true);
    try {
      const url = editingCoupon ? `${API}/api/coupons/${editingCoupon._id}` : `${API}/api/coupons`;
      const method = editingCoupon ? 'PUT' : 'POST';
      const res = await authJsonFetch(url, { method, body: JSON.stringify(newCoupon) });
      if (res.ok) {
        const saved = await res.json();
        if (editingCoupon) {
          setCoupons(coupons.map(c => c._id === saved._id ? saved : c));
        } else {
          setCoupons([saved, ...coupons]);
        }
        setIsAddingCoupon(false);
        setEditingCoupon(null);
        setNewCoupon({ code: '', discountType: 'percentage', discountAmount: '', minPurchase: 0, expiryDate: '', usageLimit: '' });
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Failed to save coupon');
      }
    } catch (err) {
      alert('Error saving coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCouponDelete = async (id) => {
    if (window.confirm('Delete this coupon?')) {
      try {
        const res = await authFetch(`${API}/api/coupons/${id}`, { method: 'DELETE' });
        if (res.ok) setCoupons(coupons.filter(c => c._id !== id));
      } catch (err) { alert('Failed to delete coupon'); }
    }
  };

  const handleRemoveImage = (idx) => setProductImages(prev => prev.filter((_, i) => i !== idx));

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'products', label: 'Products', icon: Tag },
    { id: 'orders', label: 'Orders', icon: Truck },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'banners', label: 'Banners', icon: Image },
    { id: 'design', label: 'Design', icon: Layers },
    { id: 'security', label: 'Security', icon: ShieldCheck },
  ];

  const statCards = [
    { label: 'Total Products', value: products.length, icon: Package, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'bg-green-500/10 text-green-600 dark:text-green-400' },
    { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-gold/10 text-gold' },
    { label: 'Paid Orders', value: paidOrders, icon: CheckCircle, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    { label: 'Pending', value: pendingOrders, icon: Clock, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    { label: 'Delivered', value: deliveredOrders, icon: TrendingUp, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-offwhite dark:bg-charcoal pt-32 pb-24 px-4 flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-charcoal/20 dark:border-offwhite/20 border-t-gold rounded-full animate-spin" />
          <p className="text-sm text-charcoal/60 dark:text-offwhite/60 tracking-widest uppercase">Loading Dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-offwhite dark:bg-charcoal pt-28 pb-24 px-4 sm:px-6 lg:px-8 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10 flex justify-between items-start">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-charcoal dark:text-offwhite tracking-wide mb-2">
              Admin Dashboard
            </h1>
            <p className="text-sm text-charcoal/50 dark:text-offwhite/50 tracking-wider">
              Manage your products, orders, and business analytics
            </p>
            <div className="w-16 h-px bg-gold mt-4" />
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-charcoal dark:bg-offwhite text-white dark:text-charcoal text-xs uppercase tracking-widest font-medium rounded hover:bg-black dark:hover:bg-sand transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 bg-white dark:bg-charcoal/50 p-1 rounded-lg border border-charcoal/5 dark:border-offwhite/5 w-full overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-xs uppercase tracking-widest font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-charcoal dark:bg-offwhite text-white dark:text-charcoal shadow-sm'
                  : 'text-charcoal/60 dark:text-offwhite/60 hover:text-charcoal dark:hover:text-offwhite hover:bg-charcoal/5 dark:hover:bg-offwhite/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
              {statCards.map((card, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-charcoal/50 border border-charcoal/5 dark:border-offwhite/5 rounded-lg p-5 flex flex-col gap-3"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-serif text-charcoal dark:text-offwhite font-medium">{card.value}</p>
                    <p className="text-[10px] uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 mt-1">{card.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Site Online/Offline Toggle */}
            <div className="mb-10 bg-white dark:bg-charcoal/50 border border-charcoal/5 dark:border-offwhite/5 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${siteOnline ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                    <Power className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-charcoal dark:text-offwhite">Website Status</h3>
                    <p className="text-xs text-charcoal/50 dark:text-offwhite/50 mt-0.5">
                      {siteOnline ? 'Your site is live and accessible to customers' : 'Your site is in maintenance mode — customers see an offline page'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleToggleMaintenance}
                  disabled={maintenanceLoading}
                  className={`relative flex items-center gap-3 px-6 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all shadow-lg disabled:opacity-50 ${
                    siteOnline
                      ? 'bg-green-600 text-white hover:bg-red-600'
                      : 'bg-red-600 text-white hover:bg-green-600'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${siteOnline ? 'bg-green-200 animate-pulse' : 'bg-red-200'}`} />
                  {maintenanceLoading ? 'Switching...' : siteOnline ? 'Take Offline' : 'Bring Online'}
                </button>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white dark:bg-charcoal/50 border border-charcoal/5 dark:border-offwhite/5 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-charcoal/5 dark:border-offwhite/5">
                <h3 className="font-serif text-lg text-charcoal dark:text-offwhite">Recent Orders</h3>
              </div>
              {orders.length > 0 ? (
                <div className="divide-y divide-charcoal/5 dark:divide-offwhite/5">
                  {orders.slice(0, 5).map(order => (
                    <div key={order._id} className="px-6 py-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-charcoal dark:text-offwhite font-medium">#{order._id?.slice(-8)}</p>
                        <p className="text-xs text-charcoal/50 dark:text-offwhite/50 mt-0.5">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-serif text-charcoal dark:text-offwhite">₹{(order.totalPrice || 0).toLocaleString()}</span>
                        <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-medium ${
                          order.isPaid
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          {order.isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-12 text-center text-charcoal/50 dark:text-offwhite/50 text-sm">
                  No orders yet
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white dark:bg-charcoal/50 border border-charcoal/5 dark:border-offwhite/5 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-charcoal/5 dark:border-offwhite/5 flex justify-between items-center">
                <h3 className="font-serif text-lg text-charcoal dark:text-offwhite">Registered Customers ({users.length})</h3>
              </div>
              {users.length === 0 ? (
                <div className="p-12 text-center text-charcoal/40 dark:text-offwhite/40">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No customers registered yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-charcoal/5 dark:border-offwhite/5 bg-charcoal/[0.02] dark:bg-offwhite/[0.02]">
                        <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 font-medium whitespace-nowrap">Customer Info</th>
                        <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 font-medium">Joined Date</th>
                        <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 font-medium text-center">Cart Items</th>
                        <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 font-medium text-center">Wishlist Items</th>
                        <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal/5 dark:divide-offwhite/5">
                      {users.map((user) => {
                        const cartTotal = user.cart?.reduce((acc, c) => acc + (c.price * (c.cartQuantity || 1)), 0) || 0;
                        return (
                        <React.Fragment key={user._id}>
                          <tr className={`hover:bg-charcoal/[0.02] dark:hover:bg-offwhite/[0.02] transition-colors ${expandedUser === user._id ? 'bg-charcoal/[0.02] dark:bg-offwhite/[0.02]' : ''}`}>
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium text-charcoal dark:text-offwhite">{user.name || 'Guest'}</p>
                              <p className="text-xs text-charcoal/50 dark:text-offwhite/50">{user.email || user.phone}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-charcoal/70 dark:text-offwhite/70">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-charcoal/5 dark:bg-offwhite/5 text-xs font-bold text-charcoal dark:text-offwhite">
                                {user.cart?.length || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gold/10 text-xs font-bold text-gold">
                                {user.wishlist?.length || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}
                                className="p-2 hover:bg-charcoal/5 dark:hover:bg-offwhite/5 rounded-full transition-colors"
                              >
                                {expandedUser === user._id ? <ChevronUp className="w-4 h-4 text-charcoal/50 dark:text-offwhite/50" /> : <ChevronDown className="w-4 h-4 text-charcoal/50 dark:text-offwhite/50" />}
                              </button>
                            </td>
                          </tr>
                          {expandedUser === user._id && (
                            <tr className="bg-charcoal/[0.01] dark:bg-offwhite/[0.01]">
                              <td colSpan="5" className="p-0">
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-8 py-6 border-b border-charcoal/5 dark:border-offwhite/5">
                                  <div className="grid md:grid-cols-2 gap-8">
                                    {/* Cart Section */}
                                    <div>
                                      <h4 className="text-xs uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 mb-4 font-bold flex items-center gap-2">
                                        <ShoppingCart className="w-3 h-3" /> Current Cart
                                      </h4>
                                      {(!user.cart || user.cart.length === 0) ? (
                                        <p className="text-xs text-charcoal/40 dark:text-offwhite/40 italic">Cart is empty</p>
                                      ) : (
                                        <div className="space-y-3">
                                          {user.cart.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 bg-white dark:bg-charcoal/40 p-2 rounded shadow-sm border border-charcoal/5 dark:border-offwhite/5">
                                              <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded bg-gray-100" />
                                              <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-charcoal dark:text-offwhite truncate">{item.name}</p>
                                                <p className="text-[10px] text-charcoal/50 mt-0.5">Size: {item.selectedSize || 'N/A'}</p>
                                                <div className="flex justify-between items-center mt-1">
                                                  <span className="text-[10px] font-bold text-charcoal/50">Qty: {item.cartQuantity || 1}</span>
                                                  <span className="text-xs font-medium text-gold">₹{(item.price * (item.cartQuantity || 1)).toLocaleString()}</span>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                          <div className="pt-2 mt-2 border-t border-charcoal/10 flex justify-between items-center px-1">
                                            <span className="text-xs uppercase tracking-widest font-bold">Cart Value</span>
                                            <span className="text-sm font-bold text-charcoal dark:text-offwhite">₹{cartTotal.toLocaleString()}</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    {/* Wishlist Section */}
                                    <div>
                                      <h4 className="text-xs uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 mb-4 font-bold flex items-center gap-2">
                                        <Tag className="w-3 h-3" /> Wishlist
                                      </h4>
                                      {(!user.wishlist || user.wishlist.length === 0) ? (
                                        <p className="text-xs text-charcoal/40 dark:text-offwhite/40 italic">Wishlist is empty</p>
                                      ) : (
                                        <div className="space-y-3">
                                          {user.wishlist.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 bg-white dark:bg-charcoal/40 p-2 rounded shadow-sm border border-charcoal/5 dark:border-offwhite/5">
                                              <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded bg-gray-100" />
                                              <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-charcoal dark:text-offwhite truncate">{item.name}</p>
                                                <p className="text-[10px] text-charcoal/50 mt-0.5">{item.brand}</p>
                                                <p className="text-xs font-medium text-charcoal dark:text-offwhite mt-1">₹{item.price?.toLocaleString()}</p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      )})}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white dark:bg-charcoal/50 border border-charcoal/5 dark:border-offwhite/5 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-charcoal/5 dark:border-offwhite/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <h3 className="font-serif text-lg text-charcoal dark:text-offwhite">All Products ({products.length})</h3>
                  <input
                    type="text"
                    placeholder="Scan or type SKU / Name..."
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    className="px-3 py-1.5 text-xs tracking-wider border border-charcoal/10 dark:border-offwhite/10 rounded bg-transparent focus:border-gold outline-none w-full md:w-64 dark:text-offwhite transition-colors"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      if (!window.confirm('Generate SKUs for all products missing them?')) return;
                      try {
                        const res = await authJsonFetch(`${API}/api/products/backfill-skus`, { method: 'POST' });
                        if (res.ok) {
                          const data = await res.json();
                          alert(data.message);
                          window.location.reload();
                        }
                      } catch (err) { alert('Failed: ' + err.message); }
                    }}
                    className="px-4 py-2 bg-gold/10 text-gold text-xs uppercase tracking-widest font-medium rounded hover:bg-gold hover:text-white transition-colors"
                  >
                    Generate SKUs
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingProduct(!isAddingProduct);
                      setProductImages([]);
                    }}
                    className="px-4 py-2 bg-charcoal/5 dark:bg-offwhite/5 hover:bg-charcoal/10 dark:hover:bg-offwhite/10 text-charcoal dark:text-offwhite text-xs uppercase tracking-widest font-medium rounded transition-colors"
                  >
                    {isAddingProduct ? 'Cancel' : '+ Add Product'}
                  </button>
                </div>
              </div>

              {isAddingProduct ? (
                <div className="p-6">
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setAddLoading(true);
                    try {
                      const res = await authJsonFetch(`${API}/api/products`, {
                        method: 'POST',
                        body: JSON.stringify({
                          ...newProduct,
                          images: productImages.length > 0 ? productImages : [newProduct.image || '/images/sample.webp'],
                          image: productImages.length > 0 ? productImages[0] : (newProduct.image || '/images/sample.webp'),
                          sizeChart: newProduct.sizeChart
                        })
                      });
                        if (res.ok) {
                          const added = await res.json();
                          setProducts([...products, added]);
                          setIsAddingProduct(false);
                          setNewProduct({ name: '', price: '', category: '', countInStock: '', image: '', description: '', sizes: [{size: 'S', stock: 0}, {size: 'M', stock: 0}, {size: 'L', stock: 0}, {size: 'XL', stock: 0}] });
                          setProductImages([]);
                          alert('Product added successfully');
                        } else {
                          const errorData = await res.json().catch(() => ({}));
                          alert(`Failed to add product: ${errorData.message || 'Server error'}`);
                        }
                      } catch (err) {
                        alert(`Error adding product: ${err.message}`);
                      }
                    setAddLoading(false);
                  }} className="max-w-2xl mx-auto space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-1">Name</label>
                        <input required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-2 border border-charcoal/20 dark:border-offwhite/20 bg-transparent rounded" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-1">Category</label>
                        {categories.length > 0 ? (
                          <select required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full p-2 border border-charcoal/20 dark:border-offwhite/20 bg-transparent rounded">
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                          </select>
                        ) : (
                          <input required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full p-2 border border-charcoal/20 dark:border-offwhite/20 bg-transparent rounded" placeholder="e.g. Women" />
                        )}
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-1">Price (₹)</label>
                        <input required type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full p-2 border border-charcoal/20 dark:border-offwhite/20 bg-transparent rounded" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-1">Stock</label>
                        <input required type="number" value={newProduct.countInStock} onChange={e => setNewProduct({...newProduct, countInStock: e.target.value})} className="w-full p-2 border border-charcoal/20 dark:border-offwhite/20 bg-transparent rounded" />
                      </div>
                    </div>
                    <div className="border border-charcoal/10 dark:border-offwhite/10 p-4 rounded bg-white dark:bg-charcoal/20">
                      <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-3 font-bold">Product Media (First image is main)</label>
                      
                      {/* Upload Controls */}
                      <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="flex-1 flex gap-2">
                          <input type="text" value={imageUrlInput} onChange={e => setImageUrlInput(e.target.value)} placeholder="https://example.com/image.jpg" className="flex-1 p-2 text-sm border border-charcoal/20 bg-transparent rounded outline-none focus:border-gold" />
                          <button type="button" onClick={handleAddImageUrl} className="px-4 py-2 bg-charcoal/5 hover:bg-gold hover:text-white text-xs uppercase tracking-widest font-bold rounded transition-colors">Add URL</button>
                        </div>
                        <div className="relative">
                          <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          <div className="flex items-center gap-2 px-6 py-2 bg-charcoal dark:bg-offwhite text-white dark:text-charcoal text-xs uppercase tracking-widest font-bold rounded hover:bg-black transition-colors h-full cursor-pointer">
                            <Upload className="w-4 h-4" /> Upload Files
                          </div>
                        </div>
                      </div>

                      {/* Image Gallery */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {productImages.map((img, idx) => (
                          <div key={idx} className="relative group aspect-[3/4] rounded overflow-hidden border border-charcoal/10">
                            <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                            {idx === 0 && <span className="absolute top-2 left-2 bg-gold text-white text-[9px] uppercase tracking-widest px-2 py-0.5 font-bold shadow-md">Main</span>}
                            <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {productImages.length === 0 && (
                          <div className="col-span-full py-8 text-center text-charcoal/40 text-xs uppercase tracking-widest border-2 border-dashed border-charcoal/10 rounded">
                            No images added yet
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-1">Description</label>
                        <textarea required value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full p-2 border border-charcoal/20 dark:border-offwhite/20 bg-transparent rounded" rows="3"></textarea>
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-1">Size & Fit</label>
                        <textarea value={newProduct.sizeAndFit} onChange={e => setNewProduct({...newProduct, sizeAndFit: e.target.value})} className="w-full p-2 border border-charcoal/20 dark:border-offwhite/20 bg-transparent rounded" rows="3" placeholder="Model (height 5'8) is wearing size 28"></textarea>
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-1">Material & Care</label>
                        <textarea value={newProduct.materialAndCare} onChange={e => setNewProduct({...newProduct, materialAndCare: e.target.value})} className="w-full p-2 border border-charcoal/20 dark:border-offwhite/20 bg-transparent rounded" rows="3" placeholder="Polyester / Machine-wash"></textarea>
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-1">Size Chart (Image URL)</label>
                        <input type="text" value={newProduct.sizeChart} onChange={e => setNewProduct({...newProduct, sizeChart: e.target.value})} className="w-full p-2 border border-charcoal/20 dark:border-offwhite/20 bg-transparent rounded" placeholder="https://example.com/size-guide.jpg" />
                      </div>
                      <div className="border border-charcoal/5 p-4 rounded bg-gray-50/50">
                        <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 mb-3 font-bold">Specifications</label>
                        <div className="space-y-3">
                          {newProduct.specifications.map((spec, sidx) => (
                            <div key={sidx} className="flex gap-2 items-center">
                              <span className="text-[10px] w-24 opacity-50">{spec.label}</span>
                              <input 
                                type="text" value={spec.value} 
                                onChange={(e) => {
                                  const updatedSpecs = [...newProduct.specifications];
                                  updatedSpecs[sidx].value = e.target.value;
                                  setNewProduct({...newProduct, specifications: updatedSpecs});
                                }}
                                className="flex-1 p-1.5 text-xs border-b border-charcoal/10 bg-transparent outline-none focus:border-gold"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button type="submit" disabled={addLoading} className="w-full py-3 bg-charcoal dark:bg-offwhite text-white dark:text-charcoal text-xs uppercase tracking-widest font-medium rounded hover:bg-black transition-colors disabled:opacity-50">
                      {addLoading ? 'Saving...' : 'Save Product'}
                    </button>
                  </form>
                </div>
              ) : editingProduct ? (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-serif text-2xl text-charcoal dark:text-offwhite italic">Edit Product</h2>
                    <button onClick={() => { setEditingProduct(null); setProductImages([]); }} className="text-charcoal/50 hover:text-charcoal uppercase text-[10px] tracking-widest font-bold">Cancel</button>
                  </div>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setAddLoading(true);
                    try {
                      const res = await authJsonFetch(`${API}/api/products/${editingProduct._id}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                          ...editFormData,
                          images: productImages.length > 0 ? productImages : [editFormData.image || '/images/placeholder.jpg'],
                          image: productImages.length > 0 ? productImages[0] : (editFormData.image || '/images/placeholder.jpg'),
                          sizeChart: editFormData.sizeChart
                        })
                      });
                        if (res.ok) {
                          const updated = await res.json();
                          setProducts(products.map(p => p._id === updated._id ? updated : p));
                          setEditingProduct(null);
                          setEditFormData(null);
                          setProductImages([]);
                          alert('Product updated successfully');
                        } else {
                          const errorData = await res.json().catch(() => ({}));
                          alert(`Failed to update product: ${errorData.message || 'Server error'}`);
                        }
                      } catch (err) {
                        alert(`Error updating product: ${err.message}`);
                      }
                    setAddLoading(false);
                  }} className="max-w-2xl mx-auto space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-1">Name</label>
                        <input required value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="w-full p-2 border border-charcoal/20 dark:border-offwhite/20 bg-transparent rounded text-charcoal dark:text-offwhite" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-1">Category</label>
                        {categories.length > 0 ? (
                          <select required value={editFormData.category} onChange={e => setEditFormData({...editFormData, category: e.target.value})} className="w-full p-2 border border-charcoal/20 dark:border-offwhite/20 bg-transparent rounded text-charcoal dark:text-offwhite">
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                          </select>
                        ) : (
                          <input required value={editFormData.category} onChange={e => setEditFormData({...editFormData, category: e.target.value})} className="w-full p-2 border border-charcoal/20 dark:border-offwhite/20 bg-transparent rounded text-charcoal dark:text-offwhite" />
                        )}
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-1">Sale Price (₹)</label>
                        <input required type="number" value={editFormData.price} onChange={e => setEditFormData({...editFormData, price: e.target.value})} className="w-full p-2 border border-charcoal/20 dark:border-offwhite/20 bg-transparent rounded text-charcoal dark:text-offwhite" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-1">Original Price (₹)</label>
                        <input type="number" value={editFormData.originalPrice || 0} onChange={e => setEditFormData({...editFormData, originalPrice: e.target.value})} className="w-full p-2 border border-charcoal/20 dark:border-offwhite/20 bg-transparent rounded text-charcoal dark:text-offwhite" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-2 font-bold">Size & Stock Inventory</label>
                        <div className="grid grid-cols-4 gap-4 p-4 border border-charcoal/10 dark:border-offwhite/10 rounded bg-charcoal/[0.02] dark:bg-white/[0.02]">
                          {(editFormData.sizes || []).map((sizeObj, idx) => (
                            <div key={idx} className="flex flex-col gap-1">
                              <span className="text-sm font-bold text-center text-charcoal dark:text-offwhite">{sizeObj.size}</span>
                              <input 
                                type="number" 
                                placeholder="Stock"
                                value={sizeObj.stock} 
                                onChange={e => {
                                  const newSizes = [...editFormData.sizes];
                                  newSizes[idx].stock = Number(e.target.value);
                                  setEditFormData({...editFormData, sizes: newSizes, countInStock: newSizes.reduce((a, b) => a + b.stock, 0) });
                                }} 
                                className="w-full p-1 text-center border border-charcoal/20 bg-white dark:bg-charcoal/50 text-charcoal dark:text-offwhite" 
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="border border-charcoal/10 dark:border-offwhite/10 p-4 rounded bg-white dark:bg-charcoal/20 text-charcoal dark:text-offwhite">
                      <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-3 font-bold">Product Media</label>
                      <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="flex-1 flex gap-2">
                          <input type="text" value={imageUrlInput} onChange={e => setImageUrlInput(e.target.value)} placeholder="Image URL" className="flex-1 p-2 text-sm border border-charcoal/20 bg-transparent rounded outline-none focus:border-gold text-charcoal dark:text-offwhite" />
                          <button type="button" onClick={handleAddImageUrl} className="px-4 py-2 bg-charcoal/5 dark:bg-offwhite/5 hover:bg-gold hover:text-white text-xs uppercase tracking-widest font-bold rounded transition-colors text-charcoal dark:text-offwhite">Add URL</button>
                        </div>
                        <div className="relative">
                          <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          <div className="flex items-center gap-2 px-6 py-2 bg-charcoal dark:bg-offwhite text-white dark:text-charcoal text-xs uppercase tracking-widest font-bold rounded hover:bg-black transition-colors h-full cursor-pointer">
                            <Upload className="w-4 h-4" /> Upload Files
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {productImages.map((img, idx) => (
                          <div key={idx} className="relative group aspect-[3/4] rounded overflow-hidden border border-charcoal/10">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-1">Description</label>
                        <textarea required value={editFormData.description} onChange={e => setEditFormData({...editFormData, description: e.target.value})} className="w-full p-2 border border-charcoal/20 dark:border-offwhite/20 bg-transparent rounded text-charcoal dark:text-offwhite" rows="3"></textarea>
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-1">Size & Fit</label>
                        <textarea value={editFormData.sizeAndFit} onChange={e => setEditFormData({...editFormData, sizeAndFit: e.target.value})} className="w-full p-2 border border-charcoal/20 dark:border-offwhite/20 bg-transparent rounded text-charcoal dark:text-offwhite" rows="3" placeholder="Model info..."></textarea>
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-1">Material & Care</label>
                        <textarea value={editFormData.materialAndCare} onChange={e => setEditFormData({...editFormData, materialAndCare: e.target.value})} className="w-full p-2 border border-charcoal/20 dark:border-offwhite/20 bg-transparent rounded text-charcoal dark:text-offwhite" rows="3" placeholder="Fabric info..."></textarea>
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-1">Size Chart (Image URL)</label>
                        <input type="text" value={editFormData.sizeChart} onChange={e => setEditFormData({...editFormData, sizeChart: e.target.value})} className="w-full p-2 border border-charcoal/20 dark:border-offwhite/20 bg-transparent rounded text-charcoal dark:text-offwhite" placeholder="https://example.com/size-guide.jpg" />
                      </div>
                      <div className="md:col-span-2 border border-charcoal/10 p-4 rounded bg-gray-50/50 dark:bg-charcoal/10">
                        <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 mb-3 font-bold">Specifications</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                          {editFormData.specifications?.map((spec, sidx) => (
                            <div key={sidx} className="flex gap-2 items-center">
                              <span className="text-[10px] w-24 opacity-50 text-charcoal dark:text-offwhite">{spec.label}</span>
                              <input 
                                type="text" value={spec.value} 
                                onChange={(e) => {
                                  const updatedSpecs = [...editFormData.specifications];
                                  updatedSpecs[sidx].value = e.target.value;
                                  setEditFormData({...editFormData, specifications: updatedSpecs});
                                }}
                                className="flex-1 p-1.5 text-xs border-b border-charcoal/10 dark:border-offwhite/10 bg-transparent outline-none focus:border-gold text-charcoal dark:text-offwhite"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button type="submit" disabled={addLoading} className="w-full py-3 bg-charcoal dark:bg-offwhite text-white dark:text-charcoal text-xs uppercase tracking-widest font-medium rounded hover:bg-black transition-colors disabled:opacity-50">
                      {addLoading ? 'Applying Changes...' : 'Save Changes'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-charcoal/5 dark:border-offwhite/5 bg-charcoal/[0.02] dark:bg-offwhite/[0.02]">
                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 font-medium">Product</th>
                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 font-medium">SKU</th>
                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 font-medium">Category</th>
                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 font-medium">Price</th>
                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 font-medium">Stock</th>
                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 font-medium">Trending</th>
                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 font-medium whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/5 dark:divide-offwhite/5">
                    {products.filter(p => p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(productSearchTerm.toLowerCase()))).map((product) => (
                      <tr key={product._id} className="hover:bg-charcoal/[0.02] dark:hover:bg-offwhite/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-14 object-cover rounded-sm bg-gray-100"
                            />
                            <div>
                              <p className="text-sm text-charcoal dark:text-offwhite font-medium">{product.name}</p>
                              <p className="text-xs text-charcoal/50 dark:text-offwhite/50">{product.brand}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <code className="text-[11px] font-mono text-gold bg-gold/10 px-2 py-0.5 rounded inline-block">
                              {product.sku || '—'}
                            </code>
                            <button
                              onClick={async () => {
                                try {
                                  const res = await fetch(`${API}/api/products/${product._id}/qrcode`);
                                  if (res.ok) {
                                    const data = await res.json();
                                    const w = window.open('', '_blank', 'width=400,height=500');
                                    w.document.write(`<html><head><title>QR: ${product.sku || 'Product'}</title></head><body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:Georgia,serif;margin:0;background:#fafafa;"><h2 style="letter-spacing:3px;margin-bottom:4px;">SONISH</h2><p style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:4px;margin-top:0;">Product QR Code</p><img src="${data.qrCode}" style="width:250px;height:250px;margin:20px 0;"/>${data.sku ? `<code style="background:#f0f0f0;padding:8px 16px;border-radius:4px;font-size:14px;letter-spacing:2px;">${data.sku}</code>` : ''}<p style="font-size:12px;color:#888;margin-top:12px;">${product.name}</p><button onclick="window.print()" style="margin-top:20px;padding:10px 30px;background:#111;color:#fff;border:none;cursor:pointer;text-transform:uppercase;letter-spacing:2px;font-size:10px;">Print / Save</button></body></html>`);
                                  }
                                } catch (err) { alert('QR failed: ' + err.message); }
                              }}
                              className="text-[9px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 hover:text-gold transition-colors text-left"
                            >
                              View QR ↗
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-charcoal/70 dark:text-offwhite/70 bg-charcoal/5 dark:bg-offwhite/5 px-2.5 py-1 rounded-full">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-charcoal dark:text-offwhite font-serif">₹{(product.price || 0).toLocaleString()}</p>
                          {product.originalPrice > product.price && (
                            <p className="text-xs text-charcoal/40 dark:text-offwhite/40 line-through">₹{product.originalPrice?.toLocaleString()}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-medium ${
                            product.countInStock > 10
                              ? 'text-green-600 dark:text-green-400'
                              : product.countInStock > 0
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-red-600 dark:text-red-400'
                          }`}>
                            {product.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer"
                              checked={product.isTrending || false}
                              onChange={async () => {
                                try {
                                  // Send the full product with the toggled trending flag
                                  const res = await authJsonFetch(`${API}/api/products/${product._id}`, {
                                    method: 'PUT',
                                    body: JSON.stringify({ ...product, isTrending: !product.isTrending })
                                  });
                                  if (res.ok) {
                                    setProducts(products.map(p => p._id === product._id ? { ...p, isTrending: !product.isTrending } : p));
                                  } else {
                                    alert('Failed to update trending status');
                                  }
                                } catch (err) {
                                  console.error(err);
                                  alert('Error updating trending status');
                                }
                              }}
                            />
                            <div className="w-9 h-5 bg-charcoal/20 dark:bg-white/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold"></div>
                          </label>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setEditingProduct(product);
                                // Load images array into productImages state
                                setProductImages(product.images && product.images.length > 0 ? product.images : [product.image].filter(Boolean));
                                // Ensure sizes array exists for legacy products
                                const initSizes = product.sizes?.length > 0 ? product.sizes : [{size: 'S', stock: Math.floor((product.countInStock||0)/4)}, {size: 'M', stock: Math.floor((product.countInStock||0)/4)}, {size: 'L', stock: Math.floor((product.countInStock||0)/4)}, {size: 'XL', stock: Math.floor((product.countInStock||0)/4)}];
                                
                                // Ensure specifications array exists for legacy products
                                const defaultSpecs = [
                                  { label: 'Type', value: '' }, { label: 'Length', value: '' },
                                  { label: 'Hemline', value: '' }, { label: 'Knit or Woven', value: '' },
                                  { label: 'Closure', value: '' }, { label: 'Transparency', value: '' }
                                ];
                                const initSpecs = product.specifications?.length > 0 ? product.specifications : defaultSpecs;

                                setEditFormData({
                                  ...product, 
                                  sizes: initSizes, 
                                  originalPrice: product.originalPrice || 0,
                                  sizeAndFit: product.sizeAndFit || '',
                                  sizeChart: product.sizeChart || '',
                                  materialAndCare: product.materialAndCare || '',
                                  specifications: initSpecs
                                });
                              }}
                              className="bg-charcoal/5 dark:bg-offwhite/5 text-charcoal dark:text-offwhite px-4 py-2 rounded text-xs uppercase tracking-widest hover:bg-charcoal hover:text-white transition-colors whitespace-nowrap"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleProductDelete(product._id)}
                              className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-2 rounded hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white dark:bg-charcoal/50 border border-charcoal/5 dark:border-offwhite/5 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-charcoal/5 dark:border-offwhite/5">
                <h3 className="font-serif text-lg text-charcoal dark:text-offwhite">All Orders ({orders.length})</h3>
              </div>
              {orders.length > 0 ? (
                <div className="divide-y divide-charcoal/5 dark:divide-offwhite/5">
                  {orders.map(order => (
                    <div key={order._id}>
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-charcoal/[0.02] dark:hover:bg-offwhite/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-6">
                          <div className="text-left">
                            <p className="text-sm text-charcoal dark:text-offwhite font-medium">Order #{order._id?.slice(-8)}</p>
                            <p className="text-xs text-charcoal/50 dark:text-offwhite/50 mt-0.5">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-serif text-charcoal dark:text-offwhite">
                            ₹{(order.totalPrice || 0).toLocaleString()}
                          </span>
                          <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-medium ${
                            order.isPaid
                              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}>
                            {order.isPaid ? 'Paid' : 'Pending'}
                          </span>
                          <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-medium ${
                            order.isDelivered
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : order.isShipped
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'bg-charcoal/5 dark:bg-offwhite/5 text-charcoal/50 dark:text-offwhite/50'
                          }`}>
                            {order.isDelivered ? 'Delivered' : order.isShipped ? 'Shipped' : 'Processing'}
                          </span>
                          {expandedOrder === order._id ? <ChevronUp className="w-4 h-4 text-charcoal/40 dark:text-offwhite/40" /> : <ChevronDown className="w-4 h-4 text-charcoal/40 dark:text-offwhite/40" />}
                        </div>
                      </button>

                      {/* Expanded Order Details */}
                      {expandedOrder === order._id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="px-6 pb-6 bg-charcoal/[0.01] dark:bg-offwhite/[0.01]"
                        >
                          <div className="grid md:grid-cols-3 gap-6">
                            <div>
                              <h4 className="text-xs uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 mb-3 font-bold">Customer Info</h4>
                              <div className="text-sm text-charcoal/80 dark:text-offwhite/80 space-y-1">
                                <p className="font-medium">{order.user?.name || 'Guest User'}</p>
                                <p className="text-xs text-charcoal/50">{order.user?.email || 'No email provided'}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 mb-3 font-bold">Shipping Address</h4>
                              <div className="text-sm text-charcoal/80 dark:text-offwhite/80 space-y-1">
                                <p>{order.shippingAddress?.address}</p>
                                <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                                <p>{order.shippingAddress?.country}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 mb-3 font-bold">Order Items</h4>
                              <div className="space-y-3">
                                {order.orderItems?.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-3">
                                    <img src={item.image} alt={item.name} className="w-10 h-12 object-cover rounded-sm bg-gray-100" />
                                    <div className="flex-1">
                                      <p className="text-[13px] text-charcoal dark:text-offwhite leading-tight font-medium mb-1">{item.name}</p>
                                      {item.sku && <code className="text-[9px] bg-gold/10 text-gold px-1.5 py-0.5 rounded tracking-widest block w-max mb-1">SKU: {item.sku}</code>}
                                      <p className="text-[10px] text-charcoal/50 dark:text-offwhite/50">Size: {item.size || 'N/A'} | Qty: {item.qty || item.cartQuantity} × ₹{item.price}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                                <h4 className="text-xs uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 mb-3 font-bold">Financial Summary</h4>
                                <div className="text-sm text-charcoal/80 dark:text-offwhite/80 space-y-2 bg-charcoal/5 dark:bg-white/5 p-4 rounded">
                                    <div className="flex justify-between">
                                        <span className="text-xs">Items Total</span>
                                        <span>₹{(order.itemsPrice || 0).toLocaleString()}</span>
                                    </div>
                                    {order.discountPrice > 0 && (
                                        <div className="flex justify-between text-green-600 font-bold">
                                            <span className="text-xs flex flex-col">
                                                <span>Discount</span>
                                                <span className="text-[9px] uppercase tracking-tighter opacity-70">Code: {order.couponCode}</span>
                                            </span>
                                            <span>-₹{(order.discountPrice || 0).toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-t border-charcoal/10 pt-2 font-bold text-base">
                                        <span>Net Total</span>
                                        <span className="text-gold">₹{(order.totalPrice || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                          </div>


                          <div className="mt-8 pt-8 border-t border-charcoal/5">
                            <h4 className="text-[10px] uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 mb-4 font-bold">Shipment Tracking (Delhivery)</h4>
                            <div className="flex flex-col sm:flex-row gap-4 max-w-xl">
                              <div className="flex-1 relative">
                                <input 
                                  type="text" 
                                  placeholder="Enter AWB Number" 
                                  defaultValue={order.trackingNumber || ''}
                                  onChange={(e) => setTrackingAWBs({ ...trackingAWBs, [order._id]: e.target.value })}
                                  className="w-full bg-white dark:bg-charcoal/20 border border-charcoal/10 dark:border-offwhite/10 px-4 py-2.5 rounded text-sm outline-none focus:border-gold transition-colors"
                                />
                                {order.trackingNumber && (
                                  <a 
                                    href={`https://www.delhivery.com/track/package/${order.trackingNumber}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="absolute right-3 top-3 text-[9px] uppercase tracking-widest text-gold hover:underline font-bold"
                                  >
                                    Verify Portal
                                  </a>
                                )}
                              </div>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const awb = trackingAWBs[order._id] || order.trackingNumber;
                                  if (!awb) return alert('Please enter an AWB number');
                                  
                                  setIsSavingTracking({ ...isSavingTracking, [order._id]: true });
                                  try {
                                    const res = await authJsonFetch(`${API}/api/orders/${order._id}/tracking`, {
                                      method: 'PUT',
                                      body: JSON.stringify({ trackingNumber: awb, carrier: 'Delhivery' })
                                    });
                                    if (res.ok) {
                                        const updatedOrderData = await res.json();
                                        // --- EmailJS Shipping Notification ---
                                        try {
                                          await emailjs.send('service_hsgqo7b', 'template_fux05vt', {
                                            to_email: order.user?.email,
                                            customer_name: order.user?.name || 'Customer',
                                            order_id: order._id.toString().slice(-8).toUpperCase(),
                                            order_status: 'SHIPPED',
                                            tracking_number: awb,
                                            order_items: order.orderItems?.map(i => i.name).join(', ')
                                          }, 'LZKrldXS6tjD8FAgK');
                                        } catch (e) { console.error('Shipping email failed', e); }
                                        // ------------------------------------
                                        
                                        alert('Tracking Information Saved & Customer Notified');
                                        setOrders(orders.map(o => o._id === order._id ? { ...o, trackingNumber: awb, trackingStatus: 'Shipped', isShipped: true, shippedAt: updatedOrderData.shippedAt } : o));
                                    }
                                  } catch (err) {
                                    alert('Failed to save tracking');
                                  }
                                  setIsSavingTracking({ ...isSavingTracking, [order._id]: false });
                                }}
                                disabled={isSavingTracking[order._id]}
                                className="px-6 py-2.5 bg-charcoal dark:bg-offwhite text-white dark:text-charcoal text-[10px] uppercase tracking-widest font-bold rounded hover:bg-gold hover:text-white transition-all disabled:opacity-50"
                              >
                                {isSavingTracking[order._id] ? 'Saving...' : 'Save Tracking'}
                              </button>
                            </div>
                          </div>

                          <div className="mt-8 pt-6 border-t border-charcoal/5 flex flex-wrap gap-4 items-center justify-between">
                            <div className="flex gap-4">
                              {!order.isPaid && (
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if(window.confirm('Mark this order as PAID?')) {
                                      try {
                                        const res = await authJsonFetch(`${API}/api/orders/${order._id}/pay`, {
                                          method: 'PUT',
                                          body: JSON.stringify({ id: 'MANUAL_ADMIN', status: 'COMPLETED' })
                                        });
                                        if (res.ok) window.location.reload();
                                      } catch (err) {}
                                    }
                                  }}
                                  className="px-4 py-2 bg-green-600 text-white text-[10px] uppercase tracking-widest font-bold rounded hover:bg-green-700 transition-colors"
                                >
                                  Mark as Paid
                                </button>
                              )}
                              {!order.isShipped && (
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if(window.confirm('Mark this order as SHIPPED?')) {
                                      try {
                                        const res = await authJsonFetch(`${API}/api/orders/${order._id}/shipped`, {
                                          method: 'PUT'
                                        });
                                        if (res.ok) {
                                          setOrders(orders.map(o => o._id === order._id ? { ...o, isShipped: true } : o));
                                          alert('Order marked as SHIPPED');
                                        }
                                      } catch (err) {}
                                    }
                                  }}
                                  className="px-4 py-2 bg-amber-600 text-white text-[10px] uppercase tracking-widest font-bold rounded hover:bg-amber-700 transition-colors"
                                >
                                  Mark as Shipped
                                </button>
                              )}
                              {!order.isDelivered && order.isShipped && (
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if(window.confirm('Mark this order as DELIVERED?')) {
                                      try {
                                        const res = await authJsonFetch(`${API}/api/orders/${order._id}/deliver`, {
                                          method: 'PUT'
                                        });
                                        if (res.ok) {
                                          // --- EmailJS Delivery Notification ---
                                          try {
                                            await emailjs.send('service_hsgqo7b', 'template_fux05vt', {
                                              to_email: order.user?.email,
                                              customer_name: order.user?.name || 'Customer',
                                              order_id: order._id.toString().slice(-8).toUpperCase(),
                                              order_status: 'DELIVERED',
                                              order_items: order.orderItems?.map(i => i.name).join(', ')
                                            }, 'LZKrldXS6tjD8FAgK');
                                          } catch (e) { console.error('Delivery email failed', e); }
                                          // ------------------------------------

                                          setOrders(orders.map(o => o._id === order._id ? { ...o, isDelivered: true } : o));
                                          alert('Order marked as DELIVERED & Customer Notified');
                                        }
                                      } catch (err) {}
                                    }
                                  }}
                                  className="px-4 py-2 bg-blue-600 text-white text-[10px] uppercase tracking-widest font-bold rounded hover:bg-blue-700 transition-colors"
                                >
                                  Mark as Delivered
                                </button>
                              )}
                            </div>
                            <div className="text-[10px] text-charcoal/30 uppercase tracking-widest font-mono">
                              ID: {order._id}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-16 text-center">
                  <ShoppingCart className="w-12 h-12 text-charcoal/10 dark:text-offwhite/10 mx-auto mb-4" />
                  <p className="text-charcoal/50 dark:text-offwhite/50 text-sm">No orders received yet</p>
                  <p className="text-charcoal/30 dark:text-offwhite/30 text-xs mt-1">Orders will appear here when customers make purchases</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-serif text-charcoal dark:text-offwhite italic">Categories</h2>
                <p className="text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 font-bold mt-1">Organize your product collections</p>
              </div>
              <button 
                onClick={() => {
                  setEditingCategory(null);
                  setNewCategory({ name: '', description: '', image: '', order: categories.length, parent: '', isComingSoon: false });
                  setIsAddingCategory(!isAddingCategory);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-charcoal dark:bg-offwhite text-white dark:text-charcoal text-[10px] uppercase tracking-widest font-bold rounded-full hover:bg-gold hover:text-white transition-all shadow-lg"
              >
                {isAddingCategory ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Category</>}
              </button>
            </div>

            {isAddingCategory && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mb-12 overflow-hidden">
                <div className="bg-white dark:bg-charcoal/30 border border-charcoal/5 dark:border-offwhite/5 p-8 rounded-xl shadow-xl">
                  <h3 className="text-sm uppercase tracking-[0.2em] font-bold mb-8 text-gold flex items-center gap-3">
                    {editingCategory ? 'Edit Category' : 'Create New Category'}
                  </h3>
                  <form onSubmit={handleCategorySave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 mb-2 font-bold">Category Name</label>
                        <input 
                          type="text" 
                          required
                          value={newCategory.name}
                          onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                          placeholder="Women's Collection"
                          className="w-full bg-transparent border-b border-charcoal/10 dark:border-offwhite/10 py-3 text-sm focus:border-gold outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 mb-2 font-bold">Description Text</label>
                        <textarea 
                          value={newCategory.description}
                          onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                          placeholder="A brief description of this category..."
                          className="w-full bg-transparent border-b border-charcoal/10 dark:border-offwhite/10 py-3 text-sm focus:border-gold outline-none transition-colors h-20 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 mb-2 font-bold">Base Category (Parent)</label>
                        <select
                          value={newCategory.parent || ''}
                          onChange={(e) => setNewCategory({...newCategory, parent: e.target.value})}
                          className="w-full bg-transparent border-b border-charcoal/10 dark:border-offwhite/10 py-3 text-sm focus:border-gold outline-none transition-colors"
                        >
                          <option value="" className="text-charcoal bg-white">None (Top Level Category)</option>
                          <option value="Women" className="text-charcoal bg-white">Women</option>
                          <option value="Men" className="text-charcoal bg-white">Men</option>
                        </select>
                        <p className="text-[9px] text-charcoal/40 dark:text-offwhite/40 mt-1 uppercase tracking-widest">Subcategories with 0 products display as "Coming Soon".</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 mb-2 font-bold">Category Cover Image</label>
                        <div className="flex flex-col gap-4">
                          <input 
                            type="text" 
                            value={newCategory.image}
                            onChange={(e) => setNewCategory({...newCategory, image: e.target.value})}
                            placeholder="Add via URL (https://...)"
                            className="w-full bg-transparent border-b border-charcoal/10 dark:border-offwhite/10 py-3 text-sm focus:border-gold outline-none transition-colors font-mono"
                          />
                          <div className="relative">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                if (file.size > 50 * 1024 * 1024) { alert('Image must be under 50MB'); return; }
                                const reader = new FileReader();
                                reader.onloadend = () => setNewCategory({...newCategory, image: reader.result});
                                reader.readAsDataURL(file);
                                e.target.value = '';
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-charcoal/20 dark:border-offwhite/20 rounded-lg hover:border-gold hover:text-gold transition-colors text-xs uppercase tracking-widest font-bold text-charcoal/60 dark:text-offwhite/60">
                              <Upload className="w-4 h-4" /> Upload from Computer
                            </div>
                          </div>
                        </div>
                        {newCategory.image && (
                          <div className="mt-4 relative group w-24 h-24 rounded-lg overflow-hidden border border-charcoal/10">
                             <img src={newCategory.image} alt="Preview" className="w-full h-full object-cover" />
                             <button type="button" onClick={() => setNewCategory({...newCategory, image: ''})} className="absolute top-1 right-1 p-1 bg-white/90 rounded-md text-red-500 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-6 items-center pt-2">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 mb-2 font-bold">Display Order</label>
                          <input 
                            type="number" 
                            required
                            value={newCategory.order}
                            onChange={(e) => setNewCategory({...newCategory, order: parseInt(e.target.value)})}
                            className="w-full bg-transparent border-b border-charcoal/10 dark:border-offwhite/10 py-3 text-sm focus:border-gold outline-none transition-colors"
                          />
                        </div>
                        <div className="flex items-center gap-3 pt-4">
                           <input 
                             type="checkbox" 
                             id="isActiveCat"
                             checked={newCategory.isActive !== false}
                             onChange={(e) => setNewCategory({...newCategory, isActive: e.target.checked})}
                             className="w-4 h-4 accent-gold"
                           />
                           <label htmlFor="isActiveCat" className="text-xs uppercase tracking-widest font-bold text-charcoal dark:text-offwhite">Active (Visible)</label>
                        </div>
                     </div>
                      <div className="flex gap-4 pt-4">
                        <button type="submit" disabled={categoryLoading} className="flex-1 px-6 py-4 bg-charcoal dark:bg-offwhite text-white dark:text-charcoal text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-gold hover:text-white transition-all">
                          {categoryLoading ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat, index) => (
                <motion.div 
                  key={cat._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-charcoal/20 border border-charcoal/5 dark:border-offwhite/5 rounded-lg overflow-hidden flex"
                >
                  <div className="w-1/3 bg-gray-100 flex-shrink-0">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-charcoal/5 dark:bg-offwhite/5">
                        <Layers className="w-8 h-8 text-charcoal/20 dark:text-offwhite/20" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col justify-between w-full">
                     <div>
                       <div className="flex justify-between items-start mb-1">
                         <div>
                           <h3 className="font-serif text-lg text-charcoal dark:text-offwhite leading-tight">{cat.name}</h3>
                           {cat.parent && <span className="text-[9px] uppercase tracking-widest font-bold text-gold">Parent: {cat.parent}</span>}
                         </div>
                         <div className="flex flex-col gap-1 items-end">
                           <div className={`w-2 h-2 rounded-full mt-1.5 ${cat.isActive !== false ? 'bg-green-500' : 'bg-red-500'}`} title={cat.isActive !== false ? "Active" : "Inactive"} />
                           {(cat.parent && cat.productCount === 0) && <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[8px] uppercase tracking-widest font-bold rounded">Soon</span>}
                         </div>
                       </div>
                       <p className="text-[10px] text-charcoal/50 dark:text-offwhite/50 line-clamp-2 leading-relaxed mb-4">{cat.description || 'No description provided.'}</p>
                     </div>
                     <div className="flex items-center justify-between mt-auto">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-gold">Order: {cat.order}</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setEditingCategory(cat);
                              setNewCategory(cat);
                              setIsAddingCategory(true);
                            }}
                            className="p-1.5 text-charcoal/40 hover:text-gold transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleCategoryDelete(cat._id)}
                            className="p-1.5 text-charcoal/40 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                     </div>
                  </div>
                </motion.div>
              ))}
              {categories.length === 0 && !isAddingCategory && (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-charcoal/10 dark:border-offwhite/10 rounded-xl">
                   <Layers className="w-10 h-10 text-charcoal/10 dark:text-offwhite/10 mx-auto mb-4" />
                   <p className="text-charcoal/60 dark:text-offwhite/60 text-sm font-serif">No categories found</p>
                   <p className="text-charcoal/40 dark:text-offwhite/40 text-[10px] uppercase tracking-widest mt-2">Create categories to organize products</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Coupons Tab */}
        {activeTab === 'coupons' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-serif text-charcoal dark:text-offwhite italic">Coupon Codes</h2>
                <p className="text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 font-bold mt-1">Manage discounts and promotions</p>
              </div>
              <button 
                onClick={() => {
                  setEditingCoupon(null);
                  setNewCoupon({ code: '', discountType: 'percentage', discountAmount: '', minPurchase: 0, expiryDate: '', usageLimit: '' });
                  setIsAddingCoupon(!isAddingCoupon);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-charcoal dark:bg-offwhite text-white dark:text-charcoal text-[10px] uppercase tracking-widest font-bold rounded-full hover:bg-gold hover:text-white transition-all shadow-lg"
              >
                {isAddingCoupon ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Coupon</>}
              </button>
            </div>

            {isAddingCoupon && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mb-12 overflow-hidden">
                <div className="bg-white dark:bg-charcoal/30 border border-charcoal/5 dark:border-offwhite/5 p-8 rounded-xl shadow-xl">
                  <h3 className="text-sm uppercase tracking-[0.2em] font-bold mb-8 text-gold">
                    {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                  </h3>
                  <form onSubmit={handleCouponSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 mb-2 font-bold">Coupon Code</label>
                        <input 
                          type="text" required value={newCoupon.code}
                          onChange={(e) => setNewCoupon({...newCoupon, code: (e.target.value||'').toUpperCase()})}
                          placeholder="WELCOME10"
                          className="w-full bg-transparent border-b border-charcoal/10 dark:border-offwhite/10 py-3 text-sm focus:border-gold outline-none transition-colors uppercase font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 mb-2 font-bold">Discount Type</label>
                        <select 
                          value={newCoupon.discountType}
                          onChange={(e) => setNewCoupon({...newCoupon, discountType: e.target.value})}
                          className="w-full bg-transparent border-b border-charcoal/10 dark:border-offwhite/10 py-3 text-sm focus:border-gold outline-none transition-colors"
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount (₹)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 mb-2 font-bold">Discount Value</label>
                        <input 
                          type="number" required value={newCoupon.discountAmount}
                          onChange={(e) => setNewCoupon({...newCoupon, discountAmount: e.target.value})}
                          placeholder="10"
                          className="w-full bg-transparent border-b border-charcoal/10 dark:border-offwhite/10 py-3 text-sm focus:border-gold outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 mb-2 font-bold">Min Purchase Requirement (₹)</label>
                        <input 
                          type="number" value={newCoupon.minPurchase}
                          onChange={(e) => setNewCoupon({...newCoupon, minPurchase: e.target.value})}
                          placeholder="500"
                          className="w-full bg-transparent border-b border-charcoal/10 dark:border-offwhite/10 py-3 text-sm focus:border-gold outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 mb-2 font-bold">Expiry Date (Optional)</label>
                        <input 
                          type="date" value={newCoupon.expiryDate ? new Date(newCoupon.expiryDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                          className="w-full bg-transparent border-b border-charcoal/10 dark:border-offwhite/10 py-3 text-sm focus:border-gold outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 mb-2 font-bold">Usage Limit (Optional)</label>
                        <input 
                          type="number" value={newCoupon.usageLimit || ''}
                          onChange={(e) => setNewCoupon({...newCoupon, usageLimit: e.target.value})}
                          placeholder="100"
                          className="w-full bg-transparent border-b border-charcoal/10 dark:border-offwhite/10 py-3 text-sm focus:border-gold outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <button 
                        type="submit" disabled={couponLoading}
                        className="w-full bg-gold text-white py-4 rounded-lg text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors shadow-lg disabled:opacity-50"
                      >
                        {couponLoading ? 'Applying...' : (editingCoupon ? 'Update Coupon' : 'Create Coupon')}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            <div className="bg-white dark:bg-charcoal/30 border border-charcoal/5 dark:border-offwhite/5 rounded-xl shadow-xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-charcoal/5 dark:border-offwhite/5 bg-charcoal/[0.02] dark:bg-offwhite/[0.02]">
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 font-bold">Code</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 font-bold">Discount</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 font-bold">Requirement</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 font-bold">Status</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal/5 dark:divide-offwhite/5">
                  {coupons.map((coupon) => (
                    <tr key={coupon._id} className="hover:bg-charcoal/[0.01] transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-sm text-gold">{coupon.code}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-charcoal dark:text-offwhite">
                          {coupon.discountType === 'percentage' ? `${coupon.discountAmount}%` : `₹${coupon.discountAmount}`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] text-charcoal/60 dark:text-offwhite/60">Min Order: ₹{coupon.minPurchase}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full w-fit ${coupon.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {coupon.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {coupon.expiryDate && (
                            <span className="text-[9px] text-charcoal/40">Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => {
                              setEditingCoupon(coupon);
                              setNewCoupon(coupon);
                              setIsAddingCoupon(true);
                            }}
                            className="p-2 hover:bg-gold/10 text-charcoal/40 hover:text-gold transition-colors rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleCouponDelete(coupon._id)}
                            className="p-2 hover:bg-red-50 text-charcoal/40 hover:text-red-500 transition-colors rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {coupons.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-charcoal/30 text-xs uppercase tracking-widest italic">No coupons found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-serif text-charcoal">Back in Stock Requests</h2>
                <div className="bg-gold/10 px-4 py-2 rounded-full border border-gold/20">
                  <span className="text-xs font-bold text-gold uppercase tracking-widest">
                    {notifications.filter(n => n.status === 'pending').length} Pending
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-charcoal/5 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-charcoal/5 border-b border-charcoal/10">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-charcoal/50">Product</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-charcoal/50">Customer Email</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-charcoal/50">Size</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-charcoal/50">Date</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-charcoal/50">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-charcoal/50">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/5">
                    {notifications.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-charcoal/40 italic">No notification requests yet.</td>
                      </tr>
                    ) : (
                      notifications.map((notif) => (
                        <tr key={notif._id} className="hover:bg-charcoal/[0.01] transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-charcoal">
                            {notif.product?.name || 'Deleted Product'}
                            <div className="text-[10px] text-charcoal/40 uppercase">Stock: {notif.product?.countInStock || 0}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-charcoal/70">{notif.email}</td>
                          <td className="px-6 py-4 text-sm font-bold text-gold">{notif.size}</td>
                          <td className="px-6 py-4 text-sm text-charcoal/50">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${notif.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                              {notif.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {notif.status === 'pending' && (
                              <button 
                                onClick={() => handleUpdateNotificationStatus(notif._id, 'notified')}
                                className="text-gold hover:text-charcoal transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"
                              >
                                <CheckCircle className="w-3 h-3" /> Mark Notified
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

        {/* Banners Tab */}
        {activeTab === 'banners' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-serif text-charcoal dark:text-offwhite italic">Hero Banners</h2>
                <p className="text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 font-bold mt-1">Manage homepage slides</p>
              </div>
              <button 
                onClick={() => {
                  setEditingBanner(null);
                  setNewBanner({ title: '', subtitle: '', description: '', image: '', link: '/collections', order: banners.length });
                  setIsAddingBanner(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gold text-white text-[10px] uppercase tracking-widest font-bold rounded-full hover:bg-charcoal dark:hover:bg-offwhite dark:hover:text-charcoal transition-all shadow-lg"
              >
                <Plus className="w-4 h-4" /> Add New Slide
              </button>
            </div>

            {isAddingBanner && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mb-12 overflow-hidden">
                <div className="bg-white dark:bg-charcoal/30 border border-charcoal/5 dark:border-offwhite/5 p-8 rounded-xl shadow-xl">
                  <h3 className="text-sm uppercase tracking-[0.2em] font-bold mb-8 text-gold flex items-center gap-3">
                    {editingBanner ? 'Edit Existing Slide' : 'Design New Slide'}
                  </h3>
                  <form onSubmit={handleBannerSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 mb-2 font-bold">Slide Title</label>
                        <input 
                          type="text" 
                          required
                          value={newBanner.title}
                          onChange={(e) => setNewBanner({...newBanner, title: e.target.value})}
                          placeholder="Modern Couture"
                          className="w-full bg-transparent border-b border-charcoal/10 dark:border-offwhite/10 py-3 text-sm focus:border-gold outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 mb-2 font-bold">Subtitle / Season</label>
                        <input 
                          type="text" 
                          required
                          value={newBanner.subtitle}
                          onChange={(e) => setNewBanner({...newBanner, subtitle: e.target.value})}
                          placeholder="Fall / Winter 2026"
                          className="w-full bg-transparent border-b border-charcoal/10 dark:border-offwhite/10 py-3 text-sm focus:border-gold outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 mb-2 font-bold">Description Text</label>
                        <textarea 
                          required
                          value={newBanner.description}
                          onChange={(e) => setNewBanner({...newBanner, description: e.target.value})}
                          placeholder="An elegant fusion of minimalist design..."
                          className="w-full bg-transparent border-b border-charcoal/10 dark:border-offwhite/10 py-3 text-sm focus:border-gold outline-none transition-colors h-20 resize-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 mb-2 font-bold">Image URL or Upload</label>
                        <div className="flex gap-4">
                          <input 
                            type="text" 
                            required={!newBanner.image}
                            value={newBanner.image}
                            onChange={(e) => setNewBanner({...newBanner, image: e.target.value})}
                            placeholder="https://example.com/hero.jpg"
                            className="flex-1 bg-transparent border-b border-charcoal/10 dark:border-offwhite/10 py-3 text-sm focus:border-gold outline-none transition-colors font-mono"
                          />
                          <div className="relative">
                            <input 
                              type="file" 
                              id="banner-upload"
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  if (file.size > 50 * 1024 * 1024) return alert('File too large (max 50MB)');
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setNewBanner({ ...newBanner, image: reader.result });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <label htmlFor="banner-upload" className="px-4 py-3 bg-charcoal/5 dark:bg-offwhite/5 border border-charcoal/10 dark:border-offwhite/10 text-[10px] uppercase tracking-widest font-bold cursor-pointer hover:bg-gold hover:text-white transition-all rounded">
                               Picker
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 mb-2 font-bold">Action Link</label>
                          <input 
                            type="text" 
                            required
                            value={newBanner.link}
                            onChange={(e) => setNewBanner({...newBanner, link: e.target.value})}
                            placeholder="/collections"
                            className="w-full bg-transparent border-b border-charcoal/10 dark:border-offwhite/10 py-3 text-sm focus:border-gold outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 mb-2 font-bold">Display Order</label>
                          <input 
                            type="number" 
                            required
                            value={newBanner.order}
                            onChange={(e) => setNewBanner({...newBanner, order: parseInt(e.target.value)})}
                            className="w-full bg-transparent border-b border-charcoal/10 dark:border-offwhite/10 py-3 text-sm focus:border-gold outline-none transition-colors"
                          />
                        </div>
                      </div>
                      <div className="flex gap-4 pt-4">
                        <button type="submit" disabled={bannerLoading} className="flex-1 px-6 py-4 bg-charcoal dark:bg-offwhite text-white dark:text-charcoal text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-gold hover:text-white transition-all">
                          {bannerLoading ? 'Inscribing...' : editingBanner ? 'Update Slide' : 'Publish Slide'}
                        </button>
                        <button type="button" onClick={() => {setIsAddingBanner(false); setEditingBanner(null);}} className="px-6 py-4 border border-charcoal/10 dark:border-offwhite/10 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-red-500 hover:text-white transition-all">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {banners.map((banner, index) => (
                <motion.div 
                  key={banner._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white dark:bg-charcoal/20 border border-charcoal/5 dark:border-offwhite/5 overflow-hidden rounded-xl shadow-sm hover:shadow-xl transition-all duration-500"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button 
                        onClick={() => {
                          setEditingBanner(banner);
                          setNewBanner(banner);
                          setIsAddingBanner(true);
                        }}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-charcoal hover:bg-gold hover:text-white transition-all shadow-lg"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleBannerDelete(banner._id)}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <p className="text-white text-[8px] uppercase tracking-[0.3em] font-bold opacity-70">{banner.subtitle}</p>
                      <h4 className="text-white text-lg font-serif italic">{banner.title}</h4>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-xs text-charcoal/60 dark:text-offwhite/60 line-clamp-2 mb-4 italic font-light">"{banner.description}"</p>
                    <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-bold">
                       <span className="text-gold">Order: {banner.order}</span>
                       <a href={banner.link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-all">
                        Preview Link <ExternalLink className="w-3 h-3" />
                       </a>
                    </div>
                  </div>
                </motion.div>
              ))}
              {banners.length === 0 && !isAddingBanner && (
                <div className="col-span-full py-24 text-center border-2 border-dashed border-charcoal/5 dark:border-offwhite/5 rounded-2xl bg-charcoal/2 dark:bg-offwhite/2">
                   <Image className="w-12 h-12 text-charcoal/10 dark:text-offwhite/10 mx-auto mb-4" />
                   <p className="text-charcoal/50 dark:text-offwhite/50 text-sm uppercase tracking-widest font-bold">No active banners in registry</p>
                   <p className="text-charcoal/30 dark:text-offwhite/30 text-[10px] mt-2 italic px-10">Add slides to breathe life into your homepage hero section</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-8">
              <h2 className="text-xl font-serif text-charcoal dark:text-offwhite italic">Security & Credentials</h2>
              <p className="text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 font-bold mt-1">Protect your administrative access</p>
            </div>

            <div className="max-w-xl">
              <div className="bg-white dark:bg-charcoal/30 border border-charcoal/5 dark:border-offwhite/5 p-10 rounded-2xl shadow-xl">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center text-gold">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm uppercase tracking-widest font-bold">Update Portal Password</h3>
                    <p className="text-[10px] text-charcoal/40 dark:text-offwhite/40 font-medium">Ensure your account remains secure with a strong password</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordUpdate} className="space-y-8">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 mb-3 font-bold">New Password</label>
                    <div className="relative">
                      <input 
                        type="password" 
                        required
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        placeholder="••••••••"
                        className="w-full bg-transparent border-b border-charcoal/10 dark:border-offwhite/10 py-4 text-sm focus:border-gold outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 mb-3 font-bold">Confirm New Password</label>
                    <div className="relative">
                      <input 
                        type="password" 
                        required
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        placeholder="••••••••"
                        className="w-full bg-transparent border-b border-charcoal/10 dark:border-offwhite/10 py-4 text-sm focus:border-gold outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit" 
                      disabled={passwordLoading}
                      className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-charcoal dark:bg-offwhite text-white dark:text-charcoal text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-gold hover:text-white transition-all shadow-lg disabled:opacity-50"
                    >
                      {passwordLoading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {passwordLoading ? 'Securing...' : 'Update Administrative Password'}
                    </button>
                    <p className="text-[9px] text-center text-charcoal/30 dark:text-offwhite/30 mt-6 italic">
                      Changing your password will take effect immediately. Ensure you have noted it safely.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        )}        {/* Design Tab */}
        {activeTab === 'design' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-8">
              <h2 className="text-xl font-serif text-charcoal dark:text-offwhite italic">Website Design</h2>
              <p className="text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 font-bold mt-1">Configure site-wide typography and aesthetics</p>
            </div>

            <div className="bg-white dark:bg-charcoal/30 border border-charcoal/5 dark:border-offwhite/5 p-8 rounded-xl shadow-xl max-w-2xl">
              <form onSubmit={handleSaveSettings}>
                <div className="mb-8">
                  <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 mb-4 font-bold">Primary Website Font</label>
                  <div className="grid grid-cols-1 gap-4">
                    <select 
                      value={settings.activeFont}
                      onChange={(e) => setSettings({ ...settings, activeFont: e.target.value })}
                      className="w-full bg-transparent border border-charcoal/10 dark:border-offwhite/10 p-4 rounded-lg text-sm focus:border-gold outline-none transition-colors"
                    >
                      {FONT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 mb-4 font-bold">Studio Philosophy Image</label>
                  <div className="flex flex-col gap-4">
                    <input 
                      type="text" 
                      value={settings.editorialImage || ''}
                      onChange={(e) => setSettings({ ...settings, editorialImage: e.target.value })}
                      placeholder="Add via URL (https://...)"
                      className="w-full bg-transparent border border-charcoal/10 dark:border-offwhite/10 p-4 rounded-lg text-sm focus:border-gold outline-none transition-colors font-mono"
                    />
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          if (file.size > 50 * 1024 * 1024) { alert('Image must be under 50MB'); return; }
                          const reader = new FileReader();
                          reader.onloadend = () => setSettings({ ...settings, editorialImage: reader.result });
                          reader.readAsDataURL(file);
                          e.target.value = '';
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex items-center justify-center gap-2 w-full px-4 py-4 border-2 border-dashed border-charcoal/20 dark:border-offwhite/20 rounded-lg hover:border-gold hover:text-gold transition-colors text-[10px] uppercase tracking-widest font-bold text-charcoal/60 dark:text-offwhite/60">
                        <Upload className="w-4 h-4" /> Upload Custom Image
                      </div>
                    </div>
                    {settings.editorialImage && (
                      <div className="mt-4 relative group w-full h-48 rounded-lg overflow-hidden border border-charcoal/10 shadow-inner bg-charcoal/5">
                         <img src={settings.editorialImage} alt="Philosophy Preview" className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button type="button" onClick={() => setSettings({ ...settings, editorialImage: '' })} className="p-2 bg-white/90 rounded-full text-red-500 drop-shadow-lg transform hover:scale-110 transition-transform"><Trash2 className="w-4 h-4" /></button>
                         </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-8 p-8 border border-dashed border-charcoal/10 dark:border-offwhite/10 rounded-lg">
                  <p className="text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 mb-4 font-bold">Font Preview</p>
                  <div style={{ fontFamily: settings.activeFont }}>
                    <h4 className="text-2xl mb-2">The Art of Modern Elegance</h4>
                    <p className="text-sm opacity-70 leading-relaxed">
                      Discover our curated collection of premium essentials, designed for those who appreciate the finer details of minimalist luxury and timeless craftsmanship.
                    </p>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSavingSettings}
                  className="w-full bg-charcoal dark:bg-offwhite text-white dark:text-charcoal py-4 rounded-lg text-xs uppercase tracking-widest font-bold hover:bg-gold hover:text-white transition-all shadow-lg disabled:opacity-50"
                >
                  {isSavingSettings ? 'Saving Changes...' : 'Save Design Settings'}
                </button>
              </form>
            </div>
          </motion.div>
        )}

      </div>
    </motion.div>
  );
};

export default AdminDashboard;
