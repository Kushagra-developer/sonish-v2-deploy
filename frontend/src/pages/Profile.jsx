import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Package, MapPin, Settings, LogOut, ChevronDown, ChevronUp, Check, Plus, CreditCard, ShoppingBag, ArrowRight, Truck, Download } from 'lucide-react';
import API from '../utils/api';
import { authFetch, authJsonFetch } from '../utils/authFetch';
import { generateInvoice } from '../utils/generateInvoice';

const Profile = () => {
    const [searchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || 'dashboard';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [userInfo, setUserInfo] = useState(null);
    const [orders, setOrders] = useState([]);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [orderTracking, setOrderTracking] = useState({});
    const [loadingTracking, setLoadingTracking] = useState({});
    const [addressForm, setAddressForm] = useState({ address: '', city: '', postalCode: '', country: 'India' });
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    const [addressSaved, setAddressSaved] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await authFetch(`${API}/api/orders/myorders`);
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data);
                }
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            }
        };

        const savedUser = localStorage.getItem('userInfo');
        if (savedUser) {
            const parsed = JSON.parse(savedUser);
            setUserInfo(parsed);
            fetchOrders();
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await authFetch(`${API}/api/users/logout`, { method: 'POST' });
        } catch (e) {}
        localStorage.removeItem('userInfo');
        window.dispatchEvent(new Event('cartUpdated'));
        window.dispatchEvent(new Event('wishlistUpdated'));
        navigate('/login');
    };

    const handleAddressSave = async (e) => {
        e.preventDefault();
        setIsSavingAddress(true);
        setAddressSaved(false);
        try {
            const newSavedAddresses = [...(userInfo.savedAddresses || []), addressForm];
            const reqBody = { savedAddresses: newSavedAddresses };
            if (!userInfo.shippingAddress?.address?.trim().length) reqBody.shippingAddress = addressForm;

            const res = await authJsonFetch(`${API}/api/users/profile`, {
                method: 'PUT',
                body: JSON.stringify(reqBody),
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('userInfo', JSON.stringify(data));
                setUserInfo(data);
                setAddressSaved(true);
                setAddressForm({ address: '', city: '', postalCode: '', country: 'India' });
                setTimeout(() => setAddressSaved(false), 3000);
            }
        } catch (err) {
            console.error('Failed to save address:', err);
        }
        setIsSavingAddress(false);
    };

    const handleSelectAddress = async (addr) => {
        try {
            const res = await authJsonFetch(`${API}/api/users/profile`, {
                method: 'PUT',
                body: JSON.stringify({ shippingAddress: addr }),
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('userInfo', JSON.stringify(data));
                setUserInfo(data);
                window.dispatchEvent(new Event('cartUpdated')); 
            }
        } catch (err) {
            console.error('Failed to select address:', err);
        }
    };

    const fetchTracking = async (orderId) => {
        if (orderTracking[orderId]) return;
        setLoadingTracking(prev => ({ ...prev, [orderId]: true }));
        try {
            const res = await authFetch(`${API}/api/orders/${orderId}/tracking`);
            if (res.ok) {
                const data = await res.json();
                setOrderTracking(prev => ({ ...prev, [orderId]: data }));
            }
        } catch (err) {
            console.error('Tracking fetch error:', err);
        } finally {
            setLoadingTracking(prev => ({ ...prev, [orderId]: false }));
        }
    };

    const handleOrderExpand = (order) => {
        if (expandedOrder === order._id) {
            setExpandedOrder(null);
        } else {
            setExpandedOrder(order._id);
            if (order.trackingNumber) {
                fetchTracking(order._id);
            }
        }
    };

    const tabs = [
        { id: 'dashboard', label: 'Overview', icon: <User className="w-4 h-4" /> },
        { id: 'orders', label: 'Order History', icon: <ShoppingBag className="w-4 h-4" /> },
        { id: 'addresses', label: 'Saved Addresses', icon: <MapPin className="w-4 h-4" /> },
        { id: 'account', label: 'Security & Profile', icon: <Settings className="w-4 h-4" /> },
    ];

    if (!userInfo) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-offwhite dark:bg-charcoal min-h-screen pt-32 pb-32 px-4 transition-colors duration-500"
        >
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <header className="mb-20 text-center">
                    <span className="text-[10px] tracking-[0.4em] uppercase text-gold font-bold mb-4 block">Personal Workspace</span>
                    <h1 className="text-4xl md:text-6xl font-serif text-charcoal dark:text-offwhite tracking-tight mb-6 italic">My Account</h1>
                    <div className="flex items-center justify-center gap-4 text-charcoal/40 dark:text-offwhite/40">
                      <div className="h-[1px] w-12 bg-gold/30"></div>
                      <span className="text-[10px] uppercase tracking-widest font-medium">Sonish Studios</span>
                      <div className="h-[1px] w-12 bg-gold/30"></div>
                    </div>
                </header>

                <div className="flex flex-col md:flex-row gap-16 items-start">
                    {/* Editorial Sidebar */}
                    <aside className="w-full md:w-80 shrink-0 sticky top-40">
                        <div className="bg-white dark:bg-charcoal/40 border border-charcoal/5 dark:border-offwhite/5 overflow-hidden shadow-2xl shadow-charcoal/5">
                            <div className="p-8 border-b border-charcoal/5 dark:border-offwhite/5 flex items-center gap-4">
                                <div className="w-12 h-12 bg-charcoal rounded-full flex items-center justify-center text-white font-serif text-xl border-2 border-gold/50">
                                    {userInfo.name?.[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 font-bold mb-0.5">Welcome back,</p>
                                    <p className="text-lg font-serif text-charcoal dark:text-offwhite">{userInfo.name?.split(' ')[0]}</p>
                                </div>
                            </div>
                            <nav className="p-2 space-y-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center justify-between group px-6 py-4 text-[11px] uppercase tracking-[0.25em] transition-all duration-300 ${activeTab === tab.id
                                            ? 'bg-charcoal text-white dark:bg-offwhite dark:text-charcoal font-bold'
                                            : 'text-charcoal/60 dark:text-offwhite/60 hover:bg-gold/5'
                                            }`}
                                    >
                                        <span className="flex items-center gap-4">
                                            {tab.icon}
                                            {tab.label}
                                        </span>
                                        <ArrowRight className={`w-3 h-3 transition-transform duration-300 ${activeTab === tab.id ? 'translate-x-0' : '-translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                                    </button>
                                ))}
                                <div className="h-px bg-charcoal/5 dark:bg-offwhite/5 mx-6 my-4"></div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-4 px-6 py-4 text-[11px] uppercase tracking-[0.25em] text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors duration-300"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </nav>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <main className="flex-1 w-full min-h-[600px]">
                        <AnimatePresence mode="wait">
                            
                            {/* DASHBOARD TAB */}
                            {activeTab === 'dashboard' && (
                                <motion.div key="dashboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }} className="space-y-12">
                                    <div className="bg-white dark:bg-charcoal/30 p-12 border border-charcoal/5 dark:border-offwhite/5 relative overflow-hidden group shadow-xl">
                                        <div className="absolute top-0 right-0 p-8 opacity-5">
                                          <User className="w-32 h-32" />
                                        </div>
                                        <h2 className="text-3xl md:text-4xl font-serif text-charcoal dark:text-offwhite mb-8 italic">Curated Dashboard</h2>
                                        <p className="text-charcoal/60 dark:text-offwhite/60 leading-relaxed text-lg max-w-2xl font-light mb-12">
                                            To offer you our most personalized services, we have centralized your preferences here. Explore your latest captures, manage your global footprints, and refine your identity within the world of Sonish.
                                        </p>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div className="p-8 bg-offwhite dark:bg-charcoal/50 border border-charcoal/5 dark:border-offwhite/5 group hover:border-gold/30 transition-all duration-500">
                                              <Package className="w-6 h-6 text-gold mb-6" />
                                              <p className="text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 mb-2 font-bold">Total Orders</p>
                                              <p className="text-3xl font-serif text-charcoal dark:text-offwhite">{orders.length}</p>
                                            </div>
                                            <div className="p-8 bg-offwhite dark:bg-charcoal/50 border border-charcoal/5 dark:border-offwhite/5 group hover:border-gold/30 transition-all duration-500">
                                              <CreditCard className="w-6 h-6 text-gold mb-6" />
                                              <p className="text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 mb-2 font-bold">Member Tier</p>
                                              <p className="text-3xl font-serif text-charcoal dark:text-offwhite italic">Studio Elite</p>
                                            </div>
                                            <div className="p-8 bg-offwhite dark:bg-charcoal/50 border border-charcoal/5 dark:border-offwhite/5 group hover:border-gold/30 transition-all duration-500">
                                              <MapPin className="w-6 h-6 text-gold mb-6" />
                                              <p className="text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 mb-2 font-bold">Primary Address</p>
                                              <p className="text-sm font-serif text-charcoal dark:text-offwhite line-clamp-1 italic">{userInfo.shippingAddress?.city || 'Not Defined'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                      <button onClick={() => setActiveTab('orders')} className="p-10 border border-charcoal/10 dark:border-offwhite/10 hover:border-gold group transition-all duration-500 text-left">
                                        <h3 className="text-xl font-serif mb-4 flex items-center justify-between">Recent History <ArrowRight className="w-4 h-4 text-charcoal/20 group-hover:text-gold transition-colors" /></h3>
                                        <p className="text-xs text-charcoal/50 dark:text-offwhite/50 tracking-widest uppercase">Track orders and returns.</p>
                                      </button>
                                      <button onClick={() => setActiveTab('addresses')} className="p-10 border border-charcoal/10 dark:border-offwhite/10 hover:border-gold group transition-all duration-500 text-left">
                                        <h3 className="text-xl font-serif mb-4 flex items-center justify-between">Shipping Edits <ArrowRight className="w-4 h-4 text-charcoal/20 group-hover:text-gold transition-colors" /></h3>
                                        <p className="text-xs text-charcoal/50 dark:text-offwhite/50 tracking-widest uppercase">Modify your global shipping data.</p>
                                      </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* ORDERS TAB */}
                            {activeTab === 'orders' && (
                                <motion.div key="orders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}>
                                    <div className="mb-12 border-b border-charcoal/10 dark:border-offwhite/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                                      <div>
                                        <h2 className="text-3xl font-serif text-charcoal dark:text-offwhite mb-2 italic">Capture History</h2>
                                        <p className="text-[10px] uppercase tracking-[0.3em] text-charcoal/40 dark:text-offwhite/40 font-bold">Chronicles of your Sonish Acquisitions</p>
                                      </div>
                                      <span className="text-[10px] uppercase tracking-widest font-bold bg-gold/10 text-gold px-4 py-2 border border-gold/20">{orders.length} TOTAL SESSIONS</span>
                                    </div>

                                    {orders.length === 0 ? (
                                        <div className="text-center py-32 bg-white dark:bg-charcoal/30 border border-charcoal/5 dark:border-offwhite/5 shadow-2xl">
                                            <ShoppingBag className="w-16 h-16 text-gold/20 mx-auto mb-8 stroke-1" />
                                            <h3 className="text-2xl font-serif italic mb-4">No History Found</h3>
                                            <p className="text-charcoal/50 dark:text-offwhite/50 text-sm tracking-widest uppercase mb-10 max-w-md mx-auto">Your acquisitions gallery is currently waiting for its first masterpiece.</p>
                                            <Link to="/collections" className="inline-block bg-charcoal dark:bg-offwhite text-white dark:text-charcoal px-12 py-4 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-gold hover:text-white transition-all duration-500 shadow-xl">
                                                Discover The Collections
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            {orders.map((order, idx) => (
                                                <div key={order._id} className="group overflow-hidden">
                                                    <div 
                                                      className={`p-10 transition-all duration-500 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-8 ${expandedOrder === order._id ? 'bg-charcoal text-white dark:bg-offwhite dark:text-charcoal' : 'bg-white dark:bg-charcoal/20 border border-charcoal/5 dark:border-offwhite/5 hover:border-gold/30 shadow-lg'}`}
                                                      onClick={() => handleOrderExpand(order)}
                                                    >
                                                        <div className="flex gap-10 items-center">
                                                          <div className={`text-[10px] font-bold tracking-[0.3em] font-mono opacity-40 group-hover:opacity-100 transition-opacity`}>0{idx + 1}</div>
                                                          <div>
                                                              <p className="text-[10px] uppercase tracking-widest opacity-40 mb-2 font-bold">Acquisition Ref.</p>
                                                              <p className="text-base font-serif tracking-wide uppercase">#{order._id?.slice(-8)}</p>
                                                          </div>
                                                          <div className="hidden lg:block">
                                                              <p className="text-[10px] uppercase tracking-widest opacity-40 mb-2 font-bold">Session Date</p>
                                                              <p className="text-sm font-serif italic">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                          </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-12">
                                                            <div className="text-right">
                                                                <p className="text-[10px] uppercase tracking-widest opacity-40 mb-2 font-bold">Total Val.</p>
                                                                <p className="text-lg font-serif italic">₹{(order.totalPrice || 0).toLocaleString()}</p>
                                                            </div>
                                                            <div className="flex items-center gap-6 border-l border-current/10 pl-12">
                                                              <span className={`text-[9px] uppercase tracking-[0.3em] font-bold px-4 py-2 border border-current/20 ${order.isDelivered ? 'text-green-500' : order.isShipped ? 'text-amber-500' : 'text-gold opacity-60'}`}>
                                                                  {order.isDelivered ? 'Delivered' : order.isShipped ? 'Shipped' : 'Processing'}
                                                              </span>
                                                              <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${expandedOrder === order._id ? 'rotate-180' : ''}`} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <AnimatePresence>
                                                      {expandedOrder === order._id && (
                                                          <motion.div
                                                              initial={{ height: 0, opacity: 0 }}
                                                              animate={{ height: 'auto', opacity: 1 }}
                                                              exit={{ height: 0, opacity: 0 }}
                                                              className="bg-white dark:bg-charcoal/40 border-x border-b border-charcoal/5 dark:border-offwhite/5"
                                                          >
                                                              <div className="p-12 grid lg:grid-cols-2 gap-16">
                                                                  {/* Download Invoice Button - Prominent at Top */}
                                                                  <div className="lg:col-span-2 mb-4">
                                                                      <button
                                                                          onClick={(e) => { e.stopPropagation(); generateInvoice(order, userInfo); }}
                                                                          className="flex items-center gap-3 w-full justify-center bg-charcoal dark:bg-offwhite text-white dark:text-charcoal px-8 py-4 text-[11px] uppercase tracking-[0.4em] font-bold hover:bg-gold hover:text-white transition-all duration-500 shadow-lg"
                                                                      >
                                                                          <Download className="w-4 h-4" /> Download Invoice / Receipt
                                                                      </button>
                                                                  </div>
                                                                  <div>
                                                                      <h4 className="text-[10px] uppercase tracking-[0.4em] text-gold mb-12 font-bold border-b border-gold/10 pb-4">Acquired Items</h4>
                                                                      <div className="space-y-10">
                                                                          {order.orderItems?.map((item, idx) => (
                                                                              <div key={idx} className="flex gap-8 group/item">
                                                                                  <div className="w-24 h-32 overflow-hidden bg-gray-50 dark:bg-charcoal shadow-xl">
                                                                                      <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale-[50%] group-hover/item:grayscale-0 transition-all duration-700" />
                                                                                  </div>
                                                                                  <div className="flex-1 py-2 flex flex-col justify-between">
                                                                                      <div>
                                                                                        <Link to={`/product/${item.product}`} className="text-lg font-serif italic text-charcoal dark:text-offwhite hover:text-gold transition-colors">{item.name}</Link>
                                                                                        <div className="mt-4 flex gap-8 text-[10px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 font-bold">
                                                                                            <span>Size: {item.selectedSize || 'OS'} / Qty: {item.qty}</span>
                                                                                        </div>
                                                                                      </div>
                                                                                      <span className="text-sm font-serif italic text-gold">₹{item.price.toLocaleString()}</span>
                                                                                  </div>
                                                                              </div>
                                                                          ))}
                                                                      </div>
                                                                  </div>
                                                                  
                                                                  <div className="space-y-12">
                                                                      <div>
                                                                          <h4 className="text-[10px] uppercase tracking-[0.4em] text-gold mb-8 font-bold border-b border-gold/10 pb-4">Logistics Details</h4>
                                                                          <div className="p-10 bg-offwhite dark:bg-charcoal shadow-inner space-y-4">
                                                                              <div className="flex items-start gap-4">
                                                                                <MapPin className="w-4 h-4 text-gold mt-1" />
                                                                                <div className="text-xs uppercase tracking-widest leading-loose text-charcoal/60 dark:text-offwhite/60">
                                                                                    <p className="font-bold text-charcoal dark:text-offwhite mb-2">Shipping to:</p>
                                                                                    <p>{order.shippingAddress?.address}</p>
                                                                                    <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                                                                                    <p className="text-gold">{order.shippingAddress?.country}</p>
                                                                                </div>
                                                                              </div>
                                                                          </div>
                                                                      </div>
                                                                      <div>
                                                                          <h4 className="text-[10px] uppercase tracking-[0.4em] text-gold mb-8 font-bold border-b border-gold/10 pb-4">Financial Narrative</h4>
                                                                          <div className={`p-10 border border-gold/20 flex flex-col gap-4 ${order.isPaid ? 'bg-green-500/5' : 'bg-red-500/5'}`}>
                                                                              <div className="flex justify-between items-center">
                                                                                <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Payment Resolution</span>
                                                                                <span className={`text-[10px] uppercase tracking-[0.2em] font-bold px-3 py-1 ${order.isPaid ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                                                                  {order.isPaid ? 'SUCCESSFUL' : 'FAILED'}
                                                                                </span>
                                                                              </div>
                                                                          </div>
                                                                      </div>

                                                                      {(order.isShipped || order.trackingNumber) && (
                                                                        <div>
                                                                          <h4 className="text-[10px] uppercase tracking-[0.4em] text-gold mb-8 font-bold border-b border-gold/10 pb-4">Live Shipment Tracking</h4>
                                                                          <div className="p-8 bg-offwhite dark:bg-charcoal shadow-inner relative overflow-hidden">
                                                                            <div className="absolute top-0 right-0 p-4">
                                                                              <Truck className="w-12 h-12 text-gold/5 opacity-20" />
                                                                            </div>
                                                                            
                                                                            {loadingTracking[order._id] ? (
                                                                              <div className="py-8 flex flex-col items-center gap-4">
                                                                                <div className="w-6 h-6 border-b-2 border-gold rounded-full animate-spin" />
                                                                                <p className="text-[9px] uppercase tracking-[0.3em] text-gold font-bold">Fetching Live Data...</p>
                                                                              </div>
                                                                            ) : (orderTracking[order._id] && orderTracking[order._id].Scans) ? (
                                                                              <div className="space-y-6">
                                                                                <div className="flex items-center justify-between mb-8">
                                                                                  <div>
                                                                                    <p className="text-[10px] uppercase tracking-widest opacity-40 mb-1 font-bold">Delhivery AWB</p>
                                                                                    <p className="text-sm font-mono font-bold text-gold">{order.trackingNumber}</p>
                                                                                  </div>
                                                                                  <a 
                                                                                    href={`https://www.delhivery.com/track/package/${order.trackingNumber}`} 
                                                                                    target="_blank" 
                                                                                    rel="noopener noreferrer"
                                                                                    className="text-[9px] uppercase tracking-widest font-bold border border-gold/30 px-3 py-1.5 hover:bg-gold hover:text-white transition-all"
                                                                                  >
                                                                                    Open Portal
                                                                                  </a>
                                                                                </div>
                                                                                
                                                                                <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gold/20">
                                                                                  {orderTracking[order._id].Scans.slice(0, 3).map((scan, sIdx) => (
                                                                                    <div key={sIdx} className="flex gap-4 relative">
                                                                                      <div className={`w-[15px] h-[15px] rounded-full border-2 border-gold bg-white z-10 shrink-0 mt-1 ${sIdx === 0 ? 'scale-110 shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'opacity-40'}`} />
                                                                                      <div>
                                                                                        <p className={`text-xs font-bold uppercase tracking-widest ${sIdx === 0 ? 'text-charcoal dark:text-offwhite' : 'text-charcoal/40 dark:text-offwhite/40'}`}>
                                                                                          {scan.Status}
                                                                                        </p>
                                                                                        <p className="text-[10px] italic text-charcoal/60 dark:text-offwhite/60 font-serif">
                                                                                          {scan.Location} • {new Date(scan.ScanDateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                                                        </p>
                                                                                      </div>
                                                                                    </div>
                                                                                  ))}
                                                                                  {orderTracking[order._id].Scans.length === 0 && (
                                                                                    <p className="text-[10px] uppercase tracking-widest text-charcoal/40 font-bold italic py-4">Shipment marked as shipped, awaiting first terminal scan.</p>
                                                                                  )}
                                                                                </div>
                                                                              </div>
                                                                            ) : (
                                                                              <div className="py-8 text-center bg-gold/5 border border-gold/10">
                                                                                <p className="text-[10px] uppercase tracking-widest text-gold font-bold">Status: {order.trackingStatus}</p>
                                                                                <p className="text-[9px] text-charcoal/50 mt-2 italic px-4">Your order has been marked as **{order.trackingStatus}**. Live tracking data will be available once the carrier receives the physical shipment.</p>
                                                                              </div>
                                                                            )}
                                                                          </div>
                                                                        </div>
                                                                      )}
                                                                  </div>
                                                              </div>
                                                          </motion.div>
                                                      )}
                                                    </AnimatePresence>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* ADDRESSES TAB */}
                            {activeTab === 'addresses' && (
                                <motion.div key="addresses" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}>
                                    <div className="mb-16">
                                      <h2 className="text-3xl font-serif text-charcoal dark:text-offwhite mb-4 italic">Global Footprints</h2>
                                      <p className="text-xs tracking-[0.3em] uppercase text-charcoal/40 dark:text-offwhite/40 font-bold mb-12">Your verified shipping registry</p>
                                      
                                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                          {(userInfo.savedAddresses && userInfo.savedAddresses.length > 0) ? userInfo.savedAddresses.map((addr, idx) => {
                                              const isSelected = userInfo.shippingAddress?.address === addr.address && userInfo.shippingAddress?.postalCode === addr.postalCode;
                                              return (
                                                  <div key={idx} className={`group p-10 border relative overflow-hidden transition-all duration-700 ${isSelected ? 'bg-charcoal text-white dark:bg-offwhite dark:text-charcoal border-charcoal dark:border-offwhite shadow-2xl scale-[1.02]' : 'bg-white dark:bg-charcoal/20 border-charcoal/5 dark:border-offwhite/5 hover:border-gold/30 hover:shadow-xl'}`}>
                                                      <div className="absolute top-0 right-0 p-6">
                                                        {isSelected ? (
                                                            <div className="bg-gold text-white p-2 rounded-full shadow-lg">
                                                              <Check className="w-4 h-4" />
                                                            </div>
                                                        ) : (
                                                            <MapPin className="w-5 h-5 text-gold/20 group-hover:text-gold/50 transition-colors" />
                                                        )}
                                                      </div>
                                                      
                                                      <p className="text-[10px] uppercase tracking-[0.4em] mb-8 font-bold opacity-30">Registered Address 0{idx + 1}</p>
                                                      
                                                      <div className="space-y-2 mb-12">
                                                        <p className="text-lg font-serif italic tracking-wide">{addr.address}</p>
                                                        <p className="text-sm font-light uppercase tracking-widest opacity-60 italic">{addr.city}, {addr.postalCode}</p>
                                                        <p className="text-sm font-bold uppercase tracking-[0.3em] text-gold">{addr.country}</p>
                                                      </div>
                                                      
                                                      <div className="flex items-center justify-between pt-8 border-t border-current/10">
                                                        {!isSelected ? (
                                                            <button 
                                                                onClick={() => handleSelectAddress(addr)}
                                                                className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold hover:text-charcoal dark:hover:text-offwhite transition-all flex items-center gap-2"
                                                            >
                                                                Set As Primary <ArrowRight className="w-3 h-3" />
                                                            </button>
                                                        ) : (
                                                            <span className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40 italic">Active Destination</span>
                                                        )}
                                                        <button className="text-[10px] uppercase tracking-[0.3em] font-bold text-red-500 opacity-0 group-hover:opacity-100 transition-all">Remove</button>
                                                      </div>
                                                  </div>
                                              )
                                          }) : (
                                              <div className="col-span-2 py-20 bg-white/50 dark:bg-charcoal/20 border-2 border-dashed border-charcoal/5 dark:border-offwhite/5 text-center">
                                                  <Plus className="w-12 h-12 text-gold/20 mx-auto mb-6" />
                                                  <p className="text-sm text-charcoal/30 dark:text-offwhite/30 tracking-[0.3em] uppercase font-bold text-center">No footprints found</p>
                                              </div>
                                          )}
                                      </div>
                                    </div>

                                    {/* Unified High-End Form Area */}
                                    <div className="bg-white dark:bg-charcoal/30 p-16 shadow-2xl relative">
                                      <div className="max-w-xl mx-auto">
                                        <div className="text-center mb-16">
                                          <Plus className="w-8 h-8 text-gold mx-auto mb-6 stroke-[1.5]" />
                                          <h3 className="text-2xl font-serif italic mb-2">Register New Locale</h3>
                                          <p className="text-[10px] uppercase tracking-[0.3em] text-charcoal/40 dark:text-offwhite/40 font-bold">Inscribe your next shipping destination</p>
                                        </div>
                                        
                                        <form onSubmit={handleAddressSave} className="space-y-10">
                                            <div className="group">
                                                <label className="block text-[9px] uppercase tracking-[0.4em] text-charcoal/30 dark:text-offwhite/30 mb-3 font-bold group-focus-within:text-gold transition-colors">Street Inscription</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={addressForm.address}
                                                    onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                                                    placeholder="e.g. 88 Rue de Rivoli, Paris"
                                                    className="w-full bg-transparent border-b border-charcoal/10 dark:border-offwhite/10 py-4 outline-none focus:border-gold text-base font-serif italic transition-all placeholder:opacity-20"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-12">
                                                <div className="group">
                                                  <label className="block text-[9px] uppercase tracking-[0.4em] text-charcoal/30 dark:text-offwhite/30 mb-3 font-bold group-focus-within:text-gold transition-colors">Administrative City</label>
                                                  <input
                                                      type="text"
                                                      required
                                                      value={addressForm.city}
                                                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                      placeholder="Mumbai"
                                                      className="w-full bg-transparent border-b border-charcoal/10 dark:border-offwhite/10 py-4 outline-none focus:border-gold text-base font-serif italic transition-all placeholder:opacity-20"
                                                  />
                                                </div>
                                                <div className="group">
                                                  <label className="block text-[9px] uppercase tracking-[0.4em] text-charcoal/30 dark:text-offwhite/30 mb-3 font-bold group-focus-within:text-gold transition-colors">Postal Code</label>
                                                  <input
                                                      type="text"
                                                      required
                                                      value={addressForm.postalCode}
                                                      onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                                                      placeholder="400001"
                                                      className="w-full bg-transparent border-b border-charcoal/10 dark:border-offwhite/10 py-4 outline-none focus:border-gold text-base font-serif italic transition-all placeholder:opacity-20 font-mono"
                                                  />
                                                </div>
                                            </div>
                                            <div className="group">
                                                <label className="block text-[9px] uppercase tracking-[0.4em] text-charcoal/30 dark:text-offwhite/30 mb-3 font-bold group-focus-within:text-gold transition-colors">Sovereign State</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={addressForm.country}
                                                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                                    className="w-full bg-transparent border-b border-charcoal/10 dark:border-offwhite/10 py-4 outline-none focus:border-gold text-base font-serif italic transition-all"
                                                />
                                            </div>
                                            
                                            <div className="pt-10 flex flex-col items-center">
                                              <button
                                                  type="submit"
                                                  disabled={isSavingAddress}
                                                  className="w-full bg-charcoal dark:bg-offwhite text-white dark:text-charcoal px-12 py-5 text-[10px] uppercase tracking-[0.5em] font-bold hover:bg-gold hover:text-white transition-all duration-700 disabled:opacity-50 flex items-center justify-center gap-4 group shadow-2xl"
                                              >
                                                  {isSavingAddress ? (
                                                      <span className="flex items-center gap-3"><div className="w-2 h-2 bg-white rounded-full animate-ping"></div> Inscribing...</span>
                                                  ) : addressSaved ? (
                                                      <><Check className="w-4 h-4" /> Destination Registry Saved</>
                                                  ) : (
                                                      <span className="flex items-center gap-4">Register Address <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" /></span>
                                                  )}
                                              </button>
                                              <p className="mt-8 text-[9px] uppercase tracking-[0.2em] text-charcoal/30 dark:text-offwhite/30 font-medium">Encrypted & Verified via Sonish Cloud Logistics</p>
                                            </div>
                                        </form>
                                      </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ACCOUNT DETAILS TAB */}
                            {activeTab === 'account' && (
                                <motion.div key="account" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }} className="space-y-8">

                                    {/* Profile Info Card */}
                                    <div className="bg-white dark:bg-charcoal/30 border border-charcoal/8 dark:border-offwhite/8 p-10">
                                        <h2 className="text-xl font-serif text-charcoal dark:text-offwhite mb-1">Profile Information</h2>
                                        <p className="text-xs text-charcoal/40 dark:text-offwhite/40 tracking-widest uppercase mb-8">Update your name and account details</p>
                                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 mb-2">Full Name</label>
                                                <input type="text" defaultValue={userInfo.name} className="w-full bg-transparent border-b border-charcoal/15 dark:border-offwhite/15 py-3 outline-none focus:border-charcoal dark:focus:border-offwhite text-base text-charcoal dark:text-offwhite transition-colors" />
                                            </div>
                                            <div className="opacity-60">
                                                <label className="block text-xs font-semibold uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 mb-2">Email Address <span className="normal-case tracking-normal font-normal">(cannot be changed)</span></label>
                                                <input type="email" defaultValue={userInfo.email} readOnly className="w-full bg-transparent border-b border-charcoal/10 dark:border-offwhite/10 py-3 outline-none text-base text-charcoal dark:text-offwhite cursor-not-allowed" />
                                            </div>
                                            <div className="pt-2">
                                                <button type="submit" className="bg-charcoal dark:bg-offwhite text-white dark:text-charcoal px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gold hover:text-white transition-all duration-300">
                                                    Save Changes
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    {/* Password Card */}
                                    <div className="bg-white dark:bg-charcoal/30 border border-charcoal/8 dark:border-offwhite/8 p-10">
                                        <h2 className="text-xl font-serif text-charcoal dark:text-offwhite mb-1">Change Password</h2>
                                        <p className="text-xs text-charcoal/40 dark:text-offwhite/40 tracking-widest uppercase mb-8">Keep your account secure with a strong password</p>
                                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 mb-2">Current Password</label>
                                                <input type="password" placeholder="Enter current password" className="w-full bg-transparent border-b border-charcoal/15 dark:border-offwhite/15 py-3 outline-none focus:border-charcoal dark:focus:border-offwhite text-base text-charcoal dark:text-offwhite transition-colors placeholder:text-charcoal/20 dark:placeholder:text-offwhite/20" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 mb-2">New Password</label>
                                                <input type="password" placeholder="Enter new password" className="w-full bg-transparent border-b border-charcoal/15 dark:border-offwhite/15 py-3 outline-none focus:border-charcoal dark:focus:border-offwhite text-base text-charcoal dark:text-offwhite transition-colors placeholder:text-charcoal/20 dark:placeholder:text-offwhite/20" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 mb-2">Confirm New Password</label>
                                                <input type="password" placeholder="Confirm new password" className="w-full bg-transparent border-b border-charcoal/15 dark:border-offwhite/15 py-3 outline-none focus:border-charcoal dark:focus:border-offwhite text-base text-charcoal dark:text-offwhite transition-colors placeholder:text-charcoal/20 dark:placeholder:text-offwhite/20" />
                                            </div>
                                            <div className="pt-2">
                                                <button type="submit" className="border border-charcoal/20 dark:border-offwhite/20 text-charcoal dark:text-offwhite px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-charcoal hover:text-white dark:hover:bg-offwhite dark:hover:text-charcoal transition-all duration-300">
                                                    Update Password
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                </motion.div>
                            )}

                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </motion.div>
    );
};

export default Profile;