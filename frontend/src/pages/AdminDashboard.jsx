import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, DollarSign, TrendingUp, Eye, CheckCircle, Clock, ChevronDown, ChevronUp, LayoutDashboard, Tag, Truck, Image, Plus, Trash2, Edit2, ExternalLink, ShieldCheck, Lock, Save } from 'lucide-react';
import API from '../utils/api';
import { authFetch, authJsonFetch } from '../utils/authFetch';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', originalPrice: '', category: '', countInStock: '', image: '', description: '', sizes: [{size: 'S', stock: 0}, {size: 'M', stock: 0}, {size: 'L', stock: 0}, {size: 'XL', stock: 0}] });
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
        const [prodRes, orderRes, bannersRes] = await Promise.allSettled([
          authFetch(`${API}/api/products/admin`),
          authFetch(`${API}/api/orders`),
          authFetch(`${API}/api/banners/admin`),
        ]);

        if (prodRes.status === 'fulfilled') {
          if (prodRes.value.ok) {
            setProducts(await prodRes.value.json());
          } else {
            console.error('Failed to fetch admin products:', await prodRes.value.text());
          }
        }
        
        if (orderRes.status === 'fulfilled') {
          if (orderRes.value.ok) {
            setOrders(await orderRes.value.json());
          } else {
            console.error('Failed to fetch orders:', await orderRes.value.text());
          }
        }

        if (bannersRes && bannersRes.status === 'fulfilled') {
          if (bannersRes.value.ok) {
            setBanners(await bannersRes.value.json());
          }
        }
      } catch (err) {
        console.error('Admin fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    // Poll for new orders every 10 seconds
    const interval = setInterval(async () => {
      try {
        const orderRes = await authFetch(`${API}/api/orders`);
        if (orderRes.ok) {
          setOrders(await orderRes.json());
        }
      } catch (err) {}
    }, 10000);

    return () => clearInterval(interval);
  }, []);

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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Tag },
    { id: 'orders', label: 'Orders', icon: Truck },
    { id: 'banners', label: 'Banners', icon: Image },
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
        <div className="flex gap-1 mb-8 bg-white dark:bg-charcoal/50 p-1 rounded-lg border border-charcoal/5 dark:border-offwhite/5 w-max">
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

        {/* Products Tab */}
        {activeTab === 'products' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white dark:bg-charcoal/50 border border-charcoal/5 dark:border-offwhite/5 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-charcoal/5 dark:border-offwhite/5 flex justify-between items-center">
                <h3 className="font-serif text-lg text-charcoal dark:text-offwhite">All Products ({products.length})</h3>
                <button
                  onClick={() => setIsAddingProduct(!isAddingProduct)}
                  className="px-4 py-2 bg-charcoal/5 dark:bg-offwhite/5 hover:bg-charcoal/10 dark:hover:bg-offwhite/10 text-charcoal dark:text-offwhite text-xs uppercase tracking-widest font-medium rounded transition-colors"
                >
                  {isAddingProduct ? 'Cancel' : '+ Add Product'}
                </button>
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
                          images: [newProduct.image]
                        })
                      });
                        if (res.ok) {
                          const added = await res.json();
                          setProducts([...products, added]);
                          setIsAddingProduct(false);
                          setNewProduct({ name: '', price: '', category: '', countInStock: '', image: '', description: '' });
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
                        <input required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full p-2 border border-charcoal/20 dark:border-offwhite/20 bg-transparent rounded" />
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
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-1">Image URL</label>
                      <input required placeholder="/images/sample.webp" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full p-2 border border-charcoal/20 dark:border-offwhite/20 bg-transparent rounded" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-1">Description</label>
                      <textarea required value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full p-2 border border-charcoal/20 dark:border-offwhite/20 bg-transparent rounded" rows="3"></textarea>
                    </div>
                    <button type="submit" disabled={addLoading} className="w-full py-3 bg-charcoal dark:bg-offwhite text-white dark:text-charcoal text-xs uppercase tracking-widest font-medium rounded hover:bg-black transition-colors disabled:opacity-50">
                      {addLoading ? 'Saving...' : 'Save Product'}
                    </button>
                  </form>
                </div>
              ) : editingProduct ? (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif text-2xl text-charcoal dark:text-offwhite">Edit Product</h3>
                    <button onClick={() => setEditingProduct(null)} className="text-charcoal/50 hover:text-charcoal">Cancel</button>
                  </div>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setAddLoading(true);
                    try {
                      const res = await authJsonFetch(`${API}/api/products/${editingProduct._id}`, {
                        method: 'PUT',
                        body: JSON.stringify(editFormData)
                      });
                        if (res.ok) {
                          const updated = await res.json();
                          setProducts(products.map(p => p._id === updated._id ? updated : p));
                          setEditingProduct(null);
                          setEditFormData(null);
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
                        <input required value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="w-full p-2 border border-charcoal/20 dark:border-offwhite/20 bg-transparent rounded" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-1">Category</label>
                        <input required value={editFormData.category} onChange={e => setEditFormData({...editFormData, category: e.target.value})} className="w-full p-2 border border-charcoal/20 dark:border-offwhite/20 bg-transparent rounded" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-1">Sale Price (₹)</label>
                        <input required type="number" value={editFormData.price} onChange={e => setEditFormData({...editFormData, price: e.target.value})} className="w-full p-2 border border-charcoal/20 dark:border-offwhite/20 bg-transparent rounded" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-1">Original Price (₹) [Discounting]</label>
                        <input type="number" value={editFormData.originalPrice || 0} onChange={e => setEditFormData({...editFormData, originalPrice: e.target.value})} className="w-full p-2 border border-charcoal/20 dark:border-offwhite/20 bg-transparent rounded" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-2">Size & Stock Inventory</label>
                        <div className="grid grid-cols-4 gap-4 p-4 border border-charcoal/10 dark:border-offwhite/10 rounded bg-charcoal/[0.02]">
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
                                className="w-full p-1 text-center border border-charcoal/20 bg-white" 
                              />
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-charcoal/50 mt-1 uppercase">Total Combined Stock: {editFormData.sizes?.reduce((a, b) => a + b.stock, 0) || editFormData.countInStock}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-1">Main Image URL</label>
                      <input required value={editFormData.image} onChange={e => setEditFormData({...editFormData, image: e.target.value})} className="w-full p-2 border border-charcoal/20 dark:border-offwhite/20 bg-transparent rounded" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-1">Description</label>
                      <textarea required value={editFormData.description} onChange={e => setEditFormData({...editFormData, description: e.target.value})} className="w-full p-2 border border-charcoal/20 dark:border-offwhite/20 bg-transparent rounded" rows="4"></textarea>
                    </div>
                    <button type="submit" disabled={addLoading} className="w-full py-3 bg-charcoal dark:bg-offwhite text-white dark:text-charcoal text-xs uppercase tracking-widest font-medium rounded hover:bg-black transition-colors disabled:opacity-50 mt-4">
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
                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 font-medium">Category</th>
                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 font-medium">Price</th>
                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 font-medium">Stock</th>
                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 font-medium whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/5 dark:divide-offwhite/5">
                    {products.map((product) => (
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
                          <button 
                            onClick={() => {
                              setEditingProduct(product);
                              // Ensure sizes array exists for legacy products
                              const initSizes = product.sizes?.length > 0 ? product.sizes : [{size: 'S', stock: Math.floor((product.countInStock||0)/4)}, {size: 'M', stock: Math.floor((product.countInStock||0)/4)}, {size: 'L', stock: Math.floor((product.countInStock||0)/4)}, {size: 'XL', stock: Math.floor((product.countInStock||0)/4)}];
                              setEditFormData({...product, sizes: initSizes, originalPrice: product.originalPrice || 0});
                            }}
                            className="bg-charcoal/5 dark:bg-offwhite/5 text-charcoal dark:text-offwhite px-4 py-2 rounded text-xs uppercase tracking-widest hover:bg-charcoal hover:text-white transition-colors whitespace-nowrap"
                          >
                            Edit
                          </button>
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
                                      <p className="text-[13px] text-charcoal dark:text-offwhite leading-tight">{item.name}</p>
                                      <p className="text-[10px] text-charcoal/50 dark:text-offwhite/50">Qty: {item.qty || item.cartQuantity} × ₹{item.price}</p>
                                    </div>
                                  </div>
                                ))}
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
                                      const updatedOrder = await res.json();
                                      alert('Tracking Information Saved');
                                      setOrders(orders.map(o => o._id === order._id ? { ...o, trackingNumber: awb, trackingStatus: 'Shipped', isShipped: true, shippedAt: updatedOrder.shippedAt } : o));
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
                                          setOrders(orders.map(o => o._id === order._id ? { ...o, isDelivered: true } : o));
                                          alert('Order marked as DELIVERED');
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
                                  if (file.size > 2 * 1024 * 1024) return alert('File too large (max 2MB)');
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
        )}
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
