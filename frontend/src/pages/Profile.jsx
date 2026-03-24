import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Package, MapPin, Settings, LogOut, ChevronDown, ChevronUp, Check } from 'lucide-react';
import API from '../utils/api';
import { authFetch, authJsonFetch } from '../utils/authFetch';

const Profile = () => {
    const [searchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || 'dashboard';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [userInfo, setUserInfo] = useState(null);
    const [orders, setOrders] = useState([]);
    const [expandedOrder, setExpandedOrder] = useState(null);
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
            await authFetch(`${API}/api/users/logout`, {
                method: 'POST'
            });
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
            
            // If this is their first address, auto-select it as the default
            if (!userInfo.shippingAddress?.address?.trim().length) {
                reqBody.shippingAddress = addressForm;
            }

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
                body: JSON.stringify({ shippingAddress: {
                    address: addr.address,
                    city: addr.city,
                    postalCode: addr.postalCode,
                    country: addr.country
                } }),
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

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: <User className="w-5 h-5" /> },
        { id: 'orders', label: 'Orders', icon: <Package className="w-5 h-5" /> },
        { id: 'addresses', label: 'Addresses', icon: <MapPin className="w-5 h-5" /> },
        { id: 'account', label: 'Account Details', icon: <Settings className="w-5 h-5" /> },
    ];

    if (!userInfo) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-offwhite dark:bg-charcoal min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 transition-colors duration-300"
        >
            <div className="max-w-7xl mx-auto">
                <div className="mb-12 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-serif text-charcoal dark:text-offwhite tracking-wide mb-4">My Account</h1>
                    <div className="w-16 h-px bg-charcoal/30 dark:bg-offwhite/30 md:mx-0 mx-auto"></div>
                </div>

                <div className="flex flex-col md:flex-row gap-12">
                    {/* Sidebar Navigation */}
                    <div className="w-full md:w-64 shrink-0">
                        <nav className="flex flex-col space-y-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-4 py-3 text-sm tracking-widest uppercase transition-colors duration-300 ${activeTab === tab.id
                                        ? 'bg-charcoal text-white dark:bg-offwhite dark:text-charcoal font-medium'
                                        : 'text-charcoal/70 dark:text-offwhite/70 hover:bg-charcoal/5 dark:hover:bg-offwhite/5'
                                        }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3 text-sm tracking-widest uppercase text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors duration-300 mt-4"
                            >
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 bg-white dark:bg-charcoal/50 p-8 border border-charcoal/10 dark:border-offwhite/10 shadow-sm min-h-[400px]">
                        <AnimatePresence mode="wait">

                            {/* DASHBOARD TAB */}
                            {activeTab === 'dashboard' && (
                                <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <h2 className="text-2xl font-serif text-charcoal dark:text-offwhite mb-4">Hello, {userInfo.name || 'Beautiful'}</h2>
                                    <p className="text-charcoal/70 dark:text-offwhite/70 leading-relaxed mb-6">
                                        From your account dashboard you can view your <button onClick={() => setActiveTab('orders')} className="text-gold hover:underline">recent orders</button>, manage your <button onClick={() => setActiveTab('addresses')} className="text-gold hover:underline">shipping and billing addresses</button>, and <button onClick={() => setActiveTab('account')} className="text-gold hover:underline">edit your password and account details</button>.
                                    </p>
                                </motion.div>
                            )}

                            {/* ORDERS TAB */}
                            {activeTab === 'orders' && (
                                <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <h2 className="text-2xl font-serif text-charcoal dark:text-offwhite mb-6">Order History ({orders.length})</h2>
                                    {orders.length === 0 ? (
                                        <div className="text-center py-10 bg-charcoal/5 dark:bg-offwhite/5 border border-charcoal/10 dark:border-offwhite/10">
                                            <Package className="w-12 h-12 text-charcoal/20 dark:text-offwhite/20 mx-auto mb-4" />
                                            <p className="text-charcoal/60 dark:text-offwhite/60 mb-4">No orders have been placed yet.</p>
                                            <Link to="/collections" className="inline-block bg-charcoal dark:bg-offwhite text-white dark:text-charcoal px-8 py-3 text-xs uppercase tracking-widest hover:bg-black transition-colors">
                                                Browse Products
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {orders.map(order => (
                                                <div key={order._id} className="border border-charcoal/10 dark:border-offwhite/10 bg-white dark:bg-charcoal/20 shadow-sm rounded-sm overflow-hidden">
                                                    <button
                                                        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                                                        className="w-full px-6 py-5 flex items-center justify-between hover:bg-charcoal/[0.02] dark:hover:bg-offwhite/[0.02] transition-colors text-left"
                                                    >
                                                        <div>
                                                            <p className="text-sm font-medium text-charcoal dark:text-offwhite mb-1">
                                                                Order <span className="font-mono text-xs text-charcoal/60 dark:text-offwhite/60 ml-2">#{order._id?.slice(-8).toUpperCase()}</span>
                                                            </p>
                                                            <p className="text-xs text-charcoal/50 dark:text-offwhite/50">
                                                                Placed on: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-6">
                                                            <div className="text-right flex flex-col items-end gap-1">
                                                                <span className="text-sm font-serif font-medium text-charcoal dark:text-offwhite">
                                                                    ₹{(order.totalPrice || 0).toLocaleString()}
                                                                </span>
                                                                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-medium ${
                                                                    order.isDelivered 
                                                                    ? 'bg-green-500/10 text-green-700 dark:text-green-400' 
                                                                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                                                }`}>
                                                                    {order.isDelivered ? 'Delivered' : 'Processing'}
                                                                </span>
                                                            </div>
                                                            <div className="text-charcoal/40 dark:text-offwhite/40">
                                                                {expandedOrder === order._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                            </div>
                                                        </div>
                                                    </button>
                                                    
                                                    {expandedOrder === order._id && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            className="px-6 pb-6 bg-charcoal/[0.01] dark:bg-offwhite/[0.01] border-t border-charcoal/5 dark:border-offwhite/5 pt-4"
                                                        >
                                                            <div className="grid md:grid-cols-2 gap-8">
                                                                <div>
                                                                    <h4 className="text-[10px] uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 mb-4 font-bold">Items Purchased</h4>
                                                                    <div className="space-y-4">
                                                                        {order.orderItems?.map((item, idx) => (
                                                                            <div key={idx} className="flex gap-4 items-center">
                                                                                <img src={item.image} alt={item.name} className="w-14 h-16 object-cover bg-gray-100" />
                                                                                <div className="flex-1">
                                                                                    <Link to={`/product/${item.product}`} className="text-sm font-medium text-charcoal dark:text-offwhite hover:text-gold transition-colors line-clamp-1">
                                                                                        {item.name}
                                                                                    </Link>
                                                                                    <div className="mt-1 flex gap-4 text-xs text-charcoal/60 dark:text-offwhite/60">
                                                                                        <span>Size: {item.selectedSize || 'Standard'}</span>
                                                                                        <span>Qty: {item.qty}</span>
                                                                                    </div>
                                                                                </div>
                                                                                <span className="text-sm font-serif text-charcoal dark:text-offwhite whitespace-nowrap">
                                                                                    ₹{(item.price * item.qty).toLocaleString()}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="space-y-6">
                                                                    <div>
                                                                        <h4 className="text-[10px] uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 mb-2 font-bold">Shipping Address</h4>
                                                                        <div className="text-sm text-charcoal/80 dark:text-offwhite/80 p-4 bg-white dark:bg-charcoal/20 border border-charcoal/5 dark:border-offwhite/5">
                                                                            <p>{order.shippingAddress?.address}</p>
                                                                            <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                                                                            <p>{order.shippingAddress?.country}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="text-[10px] uppercase tracking-widest text-charcoal/50 dark:text-offwhite/50 mb-2 font-bold">Payment Status</h4>
                                                                        <div className={`text-sm p-4 border flex items-center gap-2 ${order.isPaid ? 'bg-green-500/5 border-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-500/5 border-red-500/10 text-red-700 dark:text-red-400'}`}>
                                                                            <div className={`w-2 h-2 rounded-full ${order.isPaid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                                            {order.isPaid ? 'Paid Successfully via Razorpay' : 'Action Required: Payment Failed/Pending'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* ADDRESSES TAB */}
                            {activeTab === 'addresses' && (
                                <motion.div key="addresses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <h2 className="text-2xl font-serif text-charcoal dark:text-offwhite mb-6">Saved Addresses</h2>
                                    
                                    {/* Saved Addresses List */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                        {(userInfo.savedAddresses && userInfo.savedAddresses.length > 0) ? userInfo.savedAddresses.map((addr, idx) => {
                                            const isSelected = userInfo.shippingAddress?.address === addr.address && userInfo.shippingAddress?.postalCode === addr.postalCode;
                                            return (
                                                <div key={idx} className={`p-6 border relative transition-colors ${isSelected ? 'bg-charcoal/5 dark:bg-offwhite/5 border-charcoal/30 dark:border-offwhite/30' : 'bg-white dark:bg-charcoal/20 border-charcoal/10 dark:border-offwhite/10'}`}>
                                                    {isSelected && (
                                                        <span className="absolute top-4 right-4 text-[10px] uppercase tracking-widest font-bold bg-gold/20 text-gold px-2 py-1 flex items-center gap-1">
                                                            <Check className="w-3 h-3" /> Selected
                                                        </span>
                                                    )}
                                                    <p className="text-sm text-charcoal/80 dark:text-offwhite/80 leading-relaxed mb-6 mt-2">
                                                        {addr.address}<br />
                                                        {addr.city}, {addr.postalCode}<br />
                                                        {addr.country}
                                                    </p>
                                                    {!isSelected && (
                                                        <button 
                                                            onClick={() => handleSelectAddress(addr)}
                                                            className="text-xs uppercase tracking-widest font-bold text-charcoal/60 hover:text-charcoal dark:text-offwhite/60 dark:hover:text-offwhite transition-colors"
                                                        >
                                                            Select for Checkout
                                                        </button>
                                                    )}
                                                </div>
                                            )
                                        }) : (
                                            <p className="text-sm text-charcoal/50 dark:text-offwhite/50 col-span-2">No saved addresses yet. Please add one below.</p>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-serif text-charcoal dark:text-offwhite mb-6 border-t border-charcoal/10 dark:border-offwhite/10 pt-8">Add New Address</h3>
                                    
                                    {/* Address Form */}
                                    <form onSubmit={handleAddressSave} className="space-y-5 max-w-lg">
                                        <div>
                                            <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-2">Street Address</label>
                                            <input
                                                type="text"
                                                required
                                                value={addressForm.address}
                                                onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                                                placeholder="123 Main Street, Apt 4B"
                                                className="w-full bg-transparent border-b border-charcoal/20 dark:border-offwhite/20 py-2 outline-none focus:border-charcoal dark:focus:border-offwhite text-charcoal dark:text-offwhite placeholder:text-charcoal/30 dark:placeholder:text-offwhite/30"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-2">City</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={addressForm.city}
                                                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                    placeholder="Mumbai"
                                                    className="w-full bg-transparent border-b border-charcoal/20 dark:border-offwhite/20 py-2 outline-none focus:border-charcoal dark:focus:border-offwhite text-charcoal dark:text-offwhite placeholder:text-charcoal/30 dark:placeholder:text-offwhite/30"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-2">Postal Code</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={addressForm.postalCode}
                                                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                                                    placeholder="400001"
                                                    className="w-full bg-transparent border-b border-charcoal/20 dark:border-offwhite/20 py-2 outline-none focus:border-charcoal dark:focus:border-offwhite text-charcoal dark:text-offwhite placeholder:text-charcoal/30 dark:placeholder:text-offwhite/30"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-2">Country</label>
                                            <input
                                                type="text"
                                                required
                                                value={addressForm.country}
                                                onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                                className="w-full bg-transparent border-b border-charcoal/20 dark:border-offwhite/20 py-2 outline-none focus:border-charcoal dark:focus:border-offwhite text-charcoal dark:text-offwhite"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSavingAddress}
                                            className="bg-charcoal dark:bg-offwhite text-white dark:text-charcoal px-8 py-3 text-xs uppercase tracking-widest hover:bg-black transition-colors mt-4 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isSavingAddress ? 'Saving...' : addressSaved ? (
                                                <><Check className="w-4 h-4" /> Address Saved</>
                                            ) : (
                                                'Save Address'
                                            )}
                                        </button>
                                    </form>
                                </motion.div>
                            )}

                            {/* ACCOUNT DETAILS TAB */}
                            {activeTab === 'account' && (
                                <motion.div key="account" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <h2 className="text-2xl font-serif text-charcoal dark:text-offwhite mb-6">Account Details</h2>
                                    <form className="space-y-6 max-w-lg" onSubmit={(e) => e.preventDefault()}>
                                        <div>
                                            <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-2">Full Name</label>
                                            <input type="text" defaultValue={userInfo.name} className="w-full bg-transparent border-b border-charcoal/20 dark:border-offwhite/20 py-2 outline-none focus:border-charcoal dark:focus:border-offwhite text-charcoal dark:text-offwhite" />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-widest text-charcoal/70 dark:text-offwhite/70 mb-2">Email Address</label>
                                            <input type="email" defaultValue={userInfo.email} readOnly className="w-full bg-transparent border-b border-charcoal/20 dark:border-offwhite/20 py-2 outline-none text-charcoal/50 dark:text-offwhite/50 cursor-not-allowed" />
                                        </div>
                                        <div className="pt-4">
                                            <h3 className="text-lg font-serif text-charcoal dark:text-offwhite mb-4">Password Change</h3>
                                            <input type="password" placeholder="Current Password (leave blank to leave unchanged)" className="w-full bg-transparent border-b border-charcoal/20 dark:border-offwhite/20 py-2 mb-4 outline-none focus:border-charcoal dark:focus:border-offwhite text-charcoal dark:text-offwhite" />
                                            <input type="password" placeholder="New Password" className="w-full bg-transparent border-b border-charcoal/20 dark:border-offwhite/20 py-2 outline-none focus:border-charcoal dark:focus:border-offwhite text-charcoal dark:text-offwhite" />
                                        </div>
                                        <button type="submit" className="bg-charcoal dark:bg-offwhite text-white dark:text-charcoal px-8 py-3 text-xs uppercase tracking-widest hover:bg-black transition-colors mt-4">
                                            Save Changes
                                        </button>
                                    </form>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </motion.div>
    );
};

export default Profile;