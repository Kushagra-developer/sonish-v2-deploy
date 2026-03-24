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
                                    <div className="mb-10 pb-6 border-b border-charcoal/10 dark:border-offwhite/10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                                      <div>
                                        <h2 className="text-2xl font-serif text-charcoal dark:text-offwhite mb-1">Order History</h2>
                                        <p className="text-xs text-charcoal/40 dark:text-offwhite/40 uppercase tracking-widest">All your past orders</p>
                                      </div>
                                      <span className="text-xs font-semibold bg-gold/10 text-gold px-4 py-2 border border-gold/20">{orders.length} Orders</span>
                                    </div>

                                    {orders.length === 0 ? (
                                        <div className="text-center py-24 bg-white dark:bg-charcoal/30 border border-charcoal/5 dark:border-offwhite/5">
                                            <ShoppingBag className="w-12 h-12 text-charcoal/10 dark:text-offwhite/10 mx-auto mb-6" />
                                            <h3 className="text-xl font-serif mb-3 text-charcoal dark:text-offwhite">No orders yet</h3>
                                            <p className="text-charcoal/40 dark:text-offwhite/40 text-sm mb-8">You haven't placed any orders yet.</p>
                                            <Link to="/collections" className="inline-block bg-charcoal dark:bg-offwhite text-white dark:text-charcoal px-10 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gold hover:text-white transition-all duration-300">
                                                Shop Now
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {orders.map((order, idx) => (
                                                <div key={order._id} className="overflow-hidden border border-charcoal/8 dark:border-offwhite/8">
                                                    {/* Order Row Header */}
                                                    <div
                                                      className={`px-8 py-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-300 ${expandedOrder === order._id ? 'bg-charcoal text-white dark:bg-offwhite dark:text-charcoal' : 'bg-white dark:bg-charcoal/20 hover:bg-gray-50 dark:hover:bg-charcoal/30'}`}
                                                      onClick={() => handleOrderExpand(order)}
                                                    >
                                                        <div className="flex gap-8 items-center">
                                                          <div>
                                                              <p className="text-xs text-current opacity-40 mb-1 font-semibold uppercase tracking-wider">Order ID</p>
                                                              <p className="text-sm font-mono font-semibold">#{order._id?.slice(-8)}</p>
                                                          </div>
                                                          <div className="hidden lg:block">
                                                              <p className="text-xs text-current opacity-40 mb-1 font-semibold uppercase tracking-wider">Date</p>
                                                              <p className="text-sm">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                          </div>
                                                        </div>
                                                        <div className="flex items-center gap-8">
                                                            <div className="text-right">
                                                                <p className="text-xs text-current opacity-40 mb-1 font-semibold uppercase tracking-wider">Total</p>
                                                                <p className="text-base font-semibold">₹{(order.totalPrice || 0).toLocaleString()}</p>
                                                            </div>
                                                            <div className="flex items-center gap-4 border-l border-current/10 pl-8">
                                                              <span className={`text-xs font-semibold px-3 py-1 rounded-sm ${order.isDelivered ? 'bg-green-100 text-green-700' : order.isShipped ? 'bg-amber-100 text-amber-700' : 'bg-gold/10 text-gold'}`}>
                                                                  {order.isDelivered ? 'Delivered' : order.isShipped ? 'Shipped' : 'Processing'}
                                                              </span>
                                                              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedOrder === order._id ? 'rotate-180' : ''}`} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Expanded Order Details */}
                                                    <AnimatePresence>
                                                      {expandedOrder === order._id && (
                                                          <motion.div
                                                              initial={{ height: 0, opacity: 0 }}
                                                              animate={{ height: 'auto', opacity: 1 }}
                                                              exit={{ height: 0, opacity: 0 }}
                                                              className="bg-white dark:bg-charcoal/30 border-t border-charcoal/5 dark:border-offwhite/5"
                                                          >
                                                              <div className="p-8">
                                                                  {/* Download Button */}
                                                                  <button
                                                                      onClick={(e) => { e.stopPropagation(); generateInvoice(order, userInfo); }}
                                                                      className="flex items-center gap-2 w-full justify-center border border-charcoal/15 dark:border-offwhite/15 text-charcoal dark:text-offwhite px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-charcoal hover:text-white dark:hover:bg-offwhite dark:hover:text-charcoal transition-all duration-300 mb-8"
                                                                  >
                                                                      <Download className="w-4 h-4" /> Download Invoice / Receipt
                                                                  </button>

                                                                  <div className="grid lg:grid-cols-2 gap-10">
                                                                      {/* Items */}
                                                                      <div>
                                                                          <h4 className="text-xs font-bold uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 mb-6 pb-3 border-b border-charcoal/8 dark:border-offwhite/8">Items Ordered</h4>
                                                                          <div className="space-y-6">
                                                                              {order.orderItems?.map((item, i) => (
                                                                                  <div key={i} className="flex gap-4">
                                                                                      <div className="w-20 h-24 overflow-hidden bg-gray-50 dark:bg-charcoal/50 flex-shrink-0">
                                                                                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                                                      </div>
                                                                                      <div className="flex-1 flex flex-col justify-between py-1">
                                                                                          <div>
                                                                                            <Link to={`/product/${item.product}`} className="text-sm font-medium text-charcoal dark:text-offwhite hover:text-gold transition-colors">{item.name}</Link>
                                                                                            <p className="text-xs text-charcoal/40 dark:text-offwhite/40 mt-1">Size: {item.selectedSize || 'OS'} · Qty: {item.qty}</p>
                                                                                          </div>
                                                                                          <p className="text-sm font-semibold text-charcoal dark:text-offwhite">₹{item.price.toLocaleString()}</p>
                                                                                      </div>
                                                                                  </div>
                                                                              ))}
                                                                          </div>
                                                                      </div>

                                                                      {/* Details */}
                                                                      <div className="space-y-6">
                                                                          {/* Shipping */}
                                                                          <div>
                                                                              <h4 className="text-xs font-bold uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 mb-4 pb-3 border-b border-charcoal/8 dark:border-offwhite/8">Shipping Address</h4>
                                                                              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-charcoal/30">
                                                                                <MapPin className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                                                                                <div className="text-sm text-charcoal/70 dark:text-offwhite/70 leading-relaxed">
                                                                                    <p className="font-semibold text-charcoal dark:text-offwhite">{order.shippingAddress?.address}</p>
                                                                                    <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                                                                                    <p>{order.shippingAddress?.country}</p>
                                                                                </div>
                                                                              </div>
                                                                          </div>

                                                                          {/* Payment */}
                                                                          <div>
                                                                              <h4 className="text-xs font-bold uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 mb-4 pb-3 border-b border-charcoal/8 dark:border-offwhite/8">Payment</h4>
                                                                              <div className={`p-4 flex items-center justify-between ${order.isPaid ? 'bg-green-50 dark:bg-green-900/10' : 'bg-red-50 dark:bg-red-900/10'}`}>
                                                                                <p className="text-sm text-charcoal/60 dark:text-offwhite/60">Paid via Razorpay</p>
                                                                                <span className={`text-xs font-bold px-3 py-1 ${order.isPaid ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                                                                  {order.isPaid ? 'Paid' : 'Unpaid'}
                                                                                </span>
                                                                              </div>
                                                                          </div>

                                                                          {/* Tracking */}
                                                                          {(order.isShipped || order.trackingNumber) && (
                                                                            <div>
                                                                              <h4 className="text-xs font-bold uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 mb-4 pb-3 border-b border-charcoal/8 dark:border-offwhite/8">Shipment Tracking</h4>
                                                                              <div className="p-4 bg-gray-50 dark:bg-charcoal/30">
                                                                                {loadingTracking[order._id] ? (
                                                                                  <div className="flex items-center gap-3">
                                                                                    <div className="w-4 h-4 border-b-2 border-gold rounded-full animate-spin" />
                                                                                    <p className="text-xs text-charcoal/50">Fetching tracking data...</p>
                                                                                  </div>
                                                                                ) : (orderTracking[order._id]?.Scans) ? (
                                                                                  <div className="space-y-4">
                                                                                    <div className="flex items-center justify-between">
                                                                                      <p className="text-xs font-mono font-bold text-gold">{order.trackingNumber}</p>
                                                                                      <a href={`https://www.delhivery.com/track/package/${order.trackingNumber}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-charcoal/50 underline hover:text-gold">Track on Delhivery ↗</a>
                                                                                    </div>
                                                                                    {orderTracking[order._id].Scans.slice(0, 3).map((scan, sIdx) => (
                                                                                      <div key={sIdx} className="flex gap-3">
                                                                                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${sIdx === 0 ? 'bg-gold' : 'bg-charcoal/20'}`} />
                                                                                        <div>
                                                                                          <p className={`text-xs font-semibold ${sIdx === 0 ? 'text-charcoal dark:text-offwhite' : 'text-charcoal/40 dark:text-offwhite/40'}`}>{scan.Status}</p>
                                                                                          <p className="text-xs text-charcoal/40 dark:text-offwhite/40">{scan.Location} · {new Date(scan.ScanDateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                                                                        </div>
                                                                                      </div>
                                                                                    ))}
                                                                                  </div>
                                                                                ) : (
                                                                                  <p className="text-xs text-charcoal/50 dark:text-offwhite/50">Status: <span className="font-semibold text-gold">{order.trackingStatus}</span>. Live tracking will be available once the carrier scans the package.</p>
                                                                                )}
                                                                              </div>
                                                                            </div>
                                                                          )}
                                                                      </div>
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
                                    <div className="mb-12">
                                      <h2 className="text-2xl font-serif text-charcoal dark:text-offwhite mb-2">Shipping Addresses</h2>
                                      <p className="text-[10px] tracking-[0.2em] uppercase text-charcoal/40 dark:text-offwhite/40 font-bold mb-10">Manage your delivery destinations</p>
                                      
                                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                          {(userInfo.savedAddresses && userInfo.savedAddresses.length > 0) ? userInfo.savedAddresses.map((addr, idx) => {
                                              const isSelected = userInfo.shippingAddress?.address === addr.address && userInfo.shippingAddress?.postalCode === addr.postalCode;
                                              return (
                                                  <div key={idx} className={`group p-8 border relative transition-all duration-500 ${isSelected ? 'bg-charcoal text-white dark:bg-offwhite dark:text-charcoal border-charcoal dark:border-offwhite shadow-xl' : 'bg-white dark:bg-charcoal/20 border-charcoal/5 dark:border-offwhite/5 hover:border-gold/30'}`}>
                                                      <div className="absolute top-0 right-0 p-6">
                                                        {isSelected ? (
                                                            <div className="bg-gold text-white p-1.5 rounded-full">
                                                              <Check className="w-3.5 h-3.5" />
                                                            </div>
                                                        ) : (
                                                            <MapPin className="w-5 h-5 text-gold/20 group-hover:text-gold/50 transition-colors" />
                                                        )}
                                                      </div>
                                                      
                                                      <p className="text-[9px] uppercase tracking-widest mb-6 font-bold opacity-30">Address 0{idx + 1}</p>
                                                      
                                                      <div className="space-y-1 mb-10">
                                                        <p className="text-lg font-medium tracking-tight">{addr.address}</p>
                                                        <p className="text-sm opacity-60">{addr.city}, {addr.postalCode}</p>
                                                        <p className="text-sm font-bold text-gold uppercase tracking-widest">{addr.country}</p>
                                                      </div>
                                                      
                                                      <div className="flex items-center justify-between pt-6 border-t border-current/10">
                                                        {!isSelected ? (
                                                            <button 
                                                                onClick={() => handleSelectAddress(addr)}
                                                                className="text-[10px] uppercase tracking-widest font-bold text-gold hover:text-charcoal dark:hover:text-offwhite transition-all flex items-center gap-2"
                                                            >
                                                                Use This Address <ArrowRight className="w-3 h-3" />
                                                            </button>
                                                        ) : (
                                                            <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Primary Address</span>
                                                        )}
                                                        <button className="text-[10px] uppercase tracking-widest font-bold text-red-500/50 hover:text-red-500 transition-all">Remove</button>
                                                      </div>
                                                  </div>
                                              )
                                          }) : (
                                              <div className="col-span-2 py-16 bg-white/50 dark:bg-charcoal/10 border-2 border-dashed border-charcoal/5 dark:border-offwhite/5 text-center">
                                                  <Plus className="w-10 h-10 text-gold/20 mx-auto mb-4" />
                                                  <p className="text-xs text-charcoal/30 dark:text-offwhite/30 tracking-widest uppercase font-bold">No saved addresses found</p>
                                              </div>
                                          )}
                                      </div>
                                    </div>

                                    {/* Add New Address Form */}
                                    <div className="bg-white dark:bg-charcoal/40 p-12 border border-charcoal/5 dark:border-offwhite/5">
                                      <div className="max-w-xl">
                                        <div className="mb-12">
                                          <h3 className="text-xl font-serif mb-1">Add New Address</h3>
                                          <p className="text-[9px] uppercase tracking-widest text-charcoal/40 dark:text-offwhite/40 font-bold">Register a new shipping destination</p>
                                        </div>
                                        
                                        <form onSubmit={handleAddressSave} className="space-y-8">
                                            <div>
                                                <label className="block text-[10px] uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 mb-2 font-bold">Address Line</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={addressForm.address}
                                                    onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                                                    placeholder="Street name, building, apartment"
                                                    className="w-full bg-transparent border-b border-charcoal/15 dark:border-offwhite/15 py-3 outline-none focus:border-gold text-base transition-all placeholder:text-charcoal/10"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-8">
                                                <div>
                                                  <label className="block text-[10px] uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 mb-2 font-bold">City</label>
                                                  <input
                                                      type="text"
                                                      required
                                                      value={addressForm.city}
                                                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                      placeholder="Mumbai"
                                                      className="w-full bg-transparent border-b border-charcoal/15 dark:border-offwhite/15 py-3 outline-none focus:border-gold text-base transition-all placeholder:text-charcoal/10"
                                                  />
                                                </div>
                                                <div>
                                                  <label className="block text-[10px] uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 mb-2 font-bold">Postal Code</label>
                                                  <input
                                                      type="text"
                                                      required
                                                      value={addressForm.postalCode}
                                                      onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                                                      placeholder="400001"
                                                      className="w-full bg-transparent border-b border-charcoal/15 dark:border-offwhite/15 py-3 outline-none focus:border-gold text-base font-mono transition-all placeholder:text-charcoal/10"
                                                  />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 mb-2 font-bold">Country</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={addressForm.country}
                                                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                                    className="w-full bg-transparent border-b border-charcoal/15 dark:border-offwhite/15 py-3 outline-none focus:border-gold text-base transition-all"
                                                />
                                            </div>
                                            
                                            <div className="pt-6">
                                              <button
                                                  type="submit"
                                                  disabled={isSavingAddress}
                                                  className="bg-charcoal dark:bg-offwhite text-white dark:text-charcoal px-10 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-gold hover:text-white transition-all duration-300 disabled:opacity-50"
                                              >
                                                  {isSavingAddress ? 'Saving...' : addressSaved ? 'Address Saved' : 'Save Address'}
                                              </button>
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