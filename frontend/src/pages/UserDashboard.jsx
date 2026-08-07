import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Search, User, MapPin, Plus, Minus, Flame, Star, ChevronRight, ChevronDown, X, Clock, Navigation, Power, ListOrdered, Truck, FileText, Check, Store, Calendar, ArrowLeft, ShoppingBag, Sparkles, PhoneCall } from 'lucide-react';

export default function UserDashboard() {
    const [menuItems, setMenuItems] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [walletBalance, setWalletBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const [activeRestaurant, setActiveRestaurant] = useState(null);
    const [activeCategory, setActiveCategory] = useState("All");

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const autoRest = params.get('restaurant_id');
        if (autoRest) {
            setActiveRestaurant(autoRest);
        }
    }, [location]);
    const [searchQuery, setSearchQuery] = useState("");
    const [locationText, setLocationText] = useState("Detect Location");

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            setLocationText("Location Access Denied");
            return;
        }

        setLocationText("Locating...");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();

                    if (data && data.address) {
                        const city = data.address.city || data.address.county || data.address.state || "Current Location";
                        setLocationText(city);
                    } else {
                        setLocationText("Current Location");
                    }
                } catch (e) {
                    setLocationText("Current Location");
                }
            },
            (error) => {
                setLocationText("Location Access Denied");
            }
        );
    };

    const [isDetectingAddress, setIsDetectingAddress] = useState(false);
    const handleAutoDetectAddress = () => {
        if (!navigator.geolocation) {
            setDeliveryAddress("Geolocation not supported. Please type manually.");
            return;
        }
        setIsDetectingAddress(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    if (data && data.display_name) {
                        setDeliveryAddress(data.display_name);
                    } else {
                        setDeliveryAddress("Address lookup failed. Please type manually.");
                    }
                } catch (e) {
                    setDeliveryAddress("Network error. Please type manually.");
                } finally {
                    setIsDetectingAddress(false);
                }
            },
            (error) => {
                setIsDetectingAddress(false);
                setDeliveryAddress("Location access denied. Please type manually.");
            }
        );
    };

    // Shopping Cart State
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [coupon, setCoupon] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [couponApplied, setCouponApplied] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [activeTab, setActiveTab] = useState('Home');
    const [userOrders, setUserOrders] = useState([]);
    const [availableCoupons, setAvailableCoupons] = useState([]);

    // Success Modal State
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderSuccessId, setOrderSuccessId] = useState(null);
    const [trackingOrder, setTrackingOrder] = useState(null);
    const [checkoutError, setCheckoutError] = useState('');
    const [infoModalData, setInfoModalData] = useState(null);

    const footerInfoData = {
        'Who We Are': (
            <div className="space-y-4">
                <p>MealMate is a pioneering food delivery platform based in Ahmedabad, built to connect thousands of hungry customers with the finest dining establishments in Gujarat.</p>
                <p>Our mission is to ensure nobody in the city goes hungry, offering ultra-fast delivery, real-time routing, and premium customer service.</p>
            </div>
        ),
        'Blog': (
            <div className="space-y-4">
                <p>Welcome to the MealMate Blog!</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Culinary trends and seasonal delicacies</li>
                    <li>Top 10 hidden street food gems in Ahmedabad</li>
                    <li>Deep-dives into the architecture of our fleet dispatch system</li>
                </ul>
            </div>
        ),
        'Work With Us': (
            <div className="space-y-4">
                <p>Passionate about food and technology? We are currently hiring for multiple roles at our LJ Campus headquarters including:</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Software Engineers (React, Django, Python)</li>
                    <li>Fleet Managers & Operations Specialists</li>
                    <li>Customer Success Representatives</li>
                </ul>
                <p className="font-bold text-[#DE3E44]">Send your resume to careers@mealmate.com!</p>
            </div>
        ),
        'Investor Relations': (
            <div className="space-y-4">
                <p>MealMate has successfully closed its Series A funding round in 2026.</p>
                <p>For prospectus details, shareholder governance, or investment inquiries, please contact our enterprise relations team.</p>
            </div>
        ),
        'Report Fraud': (
            <div className="space-y-4">
                <p>We take security and authenticity seriously.</p>
                <p>If you have spotted a fraudulent restaurant listing or received a phishing attempt claiming to be MealMate, please report it immediately.</p>
                <button onClick={() => window.location.href = "mailto:vsoham410@gmail.com?subject=URGENT:%20MealMate%20Fraud%20Report"} className="bg-red-50 text-red-600 px-4 py-2 font-bold rounded-lg border border-red-200 w-full mt-2 hover:bg-red-100 transition-colors shadow-sm">Submit Fraud Report</button>
            </div>
        ),
        'Terms & Conditions': (
            <div className="space-y-4">
                <ol className="list-decimal pl-5 space-y-3">
                    <li><strong className="text-slate-800">Age Restrictions:</strong> Users must be 18+ to order specific age-gated items like alcoholic beverages.</li>
                    <li><strong className="text-slate-800">Platform Scope:</strong> MealMate acts solely as an aggregator platform connecting users to independent kitchens.</li>
                    <li><strong className="text-slate-800">Liability:</strong> Restaurant partners hold primary liability for food quality, hygiene standards, and allergen compliance.</li>
                    <li><strong className="text-slate-800">Refunds:</strong> Refund windows are strictly capped at 30 minutes post-delivery and require photographic evidence.</li>
                </ol>
            </div>
        ),
        'Privacy Policy': (
            <div className="space-y-4">
                <p>Your privacy matters to us.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>MealMate securely encrypts all payment gateways.</li>
                    <li>We temporarily store GPS location data strictly for optimizing fleet delivery ETAs.</li>
                    <li>Location histories are anonymized after 24 hours.</li>
                </ul>
            </div>
        ),
        'Security': (
            <div className="space-y-4">
                <p>Security is the foundation of our platform operations.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Our servers utilize robust AES-256 encryption.</li>
                    <li>We employ strict MongoDB security protocols.</li>
                    <li>Our Django backend middleware actively guards against SQL injection or cross-site scripting attacks.</li>
                </ul>
            </div>
        )
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Scroll to top smoothly whenever the active tab changes!
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const userStr = localStorage.getItem('user');
            const userObj = userStr ? JSON.parse(userStr) : null;
            const cid = userObj ? userObj.id : 1;

            const [menuRes, restRes, ordersRes, walletRes, aiRes, couponRes] = await Promise.all([
                axios.get((import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api/restaurant/menu/'),
                axios.get((import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api/customer/restaurants/'),
                axios.get(`YOUR_BACKEND_URL/api/customer/orders/?customer_id=${cid}`).catch(e => ({ data: [] })),
                axios.get(`YOUR_BACKEND_URL/api/customer/wallet/?customer_id=${cid}`).catch(e => ({ data: { balance: 0 } })),
                axios.get((import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api/customer/recommendations/').catch(e => ({ data: { data: [] } })),
                axios.get(`YOUR_BACKEND_URL/api/customer/validate_coupon/?customer_id=${cid}`).catch(e => ({ data: { coupons: [] } }))
            ]);

            if (menuRes.data.length === 0 && restRes.data.length === 0) {
                throw new Error("Empty Database - Triggering Fallback");
            }

            setMenuItems(menuRes.data);
            setRestaurants(restRes.data);
            if (!localStorage.getItem('user')) {
                // If not logged in, they shouldn't see previous orders or a random person's wallet
                setUserOrders([]);
                setWalletBalance(0);
                setRecommendations([]);
                setAvailableCoupons([]);
            } else {
                setUserOrders(ordersRes.data);
                setWalletBalance(walletRes.data.balance || 0);
                setRecommendations(aiRes.data.data || []);
                setAvailableCoupons(couponRes.data.coupons || []);
            }
        } catch (error) {
            console.error("Using fallback UI data:", error);
            // Fallback UI data
            const fallbackRestaurants = [
                { id: 1, name: 'The Great Indian Kitchen', rating: '4.8', description: 'Authentic flavors and modern techniques.', time: '20-30 min', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80' },
                { id: 2, name: 'Pizza Heaven', rating: '4.5', description: 'Wood-fired oven traditional pizzas.', time: '15-25 min', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80' },
                { id: 3, name: 'Sushi Master', rating: '4.9', description: 'Fresh flown ingredients daily.', time: '30-45 min', image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=500&q=80' },
            ];
            setRestaurants(fallbackRestaurants);
            setMenuItems([
                { id: 991, restaurant: 1, name: 'Tandoori Paneer Tikka', category: 'Starters', description: 'Smoky, charred paneer marinated in thick yogurt.', price: '8.99', image_url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&q=80' },
                { id: 992, restaurant: 2, name: 'Double Smash Burger', category: 'Main Course', description: 'Two smashed angus patties, melted cheese.', price: '14.50', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80' },
                { id: 993, restaurant: 3, name: 'Loaded Nachos', category: 'Starters', description: 'Crispy tortillas drowning in liquid cheddar.', price: '11.00', image_url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&q=80' },
            ]);

            if (!localStorage.getItem('user')) {
                setUserOrders([]);
                setWalletBalance(0);
            }
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (item) => {
        const existing = cart.find(c => c.id === item.id);
        if (existing) {
            setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
        } else {
            setCart([...cart, { ...item, qty: 1 }]);
        }
        setIsCartOpen(true);
    };

    const decreaseQty = (id) => {
        const existing = cart.find(c => c.id === id);
        if (existing.qty === 1) {
            setCart(cart.filter(c => c.id !== id));
        } else {
            setCart(cart.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c));
        }
    };

    const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.qty), 0);
    const preGstAmount = Math.max(0, cartTotal - discountAmount);
    const gstAmount = preGstAmount * 0.05; // 5% GST
    const finalAmount = preGstAmount + gstAmount;
    const cartAmountText = finalAmount.toFixed(2);

    const handleApplyCoupon = async () => {
        if (!coupon) return;
        try {
            setCheckoutError('');
            const res = await axios.post((import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api/customer/validate_coupon/', {
                code: coupon, order_amount: cartTotal
            });
            if (res.data.success) {
                setDiscountAmount(res.data.discount);
                setCouponApplied(true);
            }
        } catch (error) {
            setDiscountAmount(0);
            setCouponApplied(false);
            setCoupon(''); // Reset on failure 
            setCheckoutError(error.response?.data?.message || "Invalid coupon code");
        }
    };

    // Filters
    const restaurantMenuItems = activeRestaurant ? menuItems.filter(i => i.restaurant === activeRestaurant) : menuItems;
    const categories = ["All", ...new Set(restaurantMenuItems.map(item => item.category || 'Food'))];

    const filteredItems = restaurantMenuItems.filter(i => {
        if (!i.is_available) return false;

        const matchesCategory = activeCategory === "All" || i.category === activeCategory;
        const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (i.description && i.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (i.category && i.category.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const filteredRestaurants = restaurants.filter(r => {
        if (!searchQuery) return true;
        return r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.cuisine_type && r.cuisine_type.toLowerCase().includes(searchQuery.toLowerCase()));
    });

    return (
        <div className="min-h-screen flex flex-col bg-[#FDFDFD] font-sans selection:bg-red-500/30 overflow-x-hidden relative">

            {/* 🚀 Sticky Header Navigation matching FoodExpress design */}
            <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

                    {/* Left: Logo */}
                    <div className="flex items-center gap-3">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/logo.png" alt="MealMate Logo" className="h-10 w-auto object-contain mix-blend-multiply" />
                            <span className="text-2xl font-black text-[#DE3E44] tracking-tight">MealMate</span>
                        </Link>
                    </div>

                    {/* Middle: Links */}
                    <nav className="hidden md:flex items-center gap-8">
                        <button onClick={() => setActiveTab('Home')} className={`flex items-center gap-2 text-sm font-bold transition-colors ${activeTab === 'Home' ? 'text-[#DE3E44]' : 'text-gray-900 hover:text-[#DE3E44]'}`}>
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                            Home
                        </button>
                        {localStorage.getItem('user') && (
                            <button onClick={() => setActiveTab('Orders')} className={`flex items-center gap-2 text-sm font-bold transition-colors ${activeTab === 'Orders' ? 'text-[#DE3E44]' : 'text-gray-600 hover:text-[#DE3E44]'}`}>
                                <ListOrdered size={16} />
                                Previous Orders
                            </button>
                        )}
                    </nav>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-6">
                        <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-gray-700 hover:text-[#DE3E44] transition-colors">
                            <ShoppingCart size={22} />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-2 bg-[#DE3E44] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                    {cart.reduce((sum, item) => sum + item.qty, 0)}
                                </span>
                            )}
                        </button>

                        {localStorage.getItem('user') ? (
                            <div className="flex items-center gap-4">
                                <button onClick={() => setActiveTab('Profile')} className={`flex items-center gap-2 cursor-pointer transition-colors p-1.5 rounded-xl ${activeTab === 'Profile' ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-600">
                                        {(JSON.parse(localStorage.getItem('user'))?.username || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <span className={`text-sm font-bold hidden md:block ${activeTab === 'Profile' ? 'text-red-600' : 'text-gray-800'}`}>
                                        {JSON.parse(localStorage.getItem('user'))?.username || 'User'}
                                    </span>
                                </button>
                                <button onClick={() => {
                                    localStorage.removeItem('user');
                                    localStorage.removeItem('token');
                                    setActiveTab('Home');
                                    setUserOrders([]);
                                    setWalletBalance(0);
                                    // Let react cycle naturally
                                }} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 flex-shrink-0">
                                    <Power size={14} /> Logout
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => window.location.href = '/login'} className="bg-[#DE3E44] hover:bg-[#c8353a] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 flex-shrink-0">
                                <User size={16} />
                                Login / Sign Up
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* 🌟 Dynamic Navigation Route */}
            {activeTab === 'Orders' ? (
                <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
                    <h2 className="text-3xl font-black text-gray-900 mb-8 border-b pb-4">My Orders</h2>
                    <div className="space-y-6">
                        {userOrders.length === 0 ? (
                            <div className="p-12 text-center text-gray-500 font-bold bg-white rounded-3xl border border-gray-100 shadow-sm">No previous orders found. Time to discover some food!</div>
                        ) : (
                            userOrders.map(order => {
                                const statusMap = {
                                    'PENDING': { bg: 'bg-orange-100 text-orange-700', step: 1 },
                                    'ACCEPTED': { bg: 'bg-blue-100 text-blue-700', step: 2 },
                                    'PREPARING': { bg: 'bg-indigo-100 text-indigo-700', step: 3 },
                                    'READY': { bg: 'bg-yellow-100 text-yellow-700', step: 4 },
                                    'PICKED_UP': { bg: 'bg-purple-100 text-purple-700', step: 5 },
                                    'DELIVERED': { bg: 'bg-green-100 text-green-700', step: 6 },
                                    'CANCELLED': { bg: 'bg-red-100 text-red-700', step: 0 },
                                };
                                const st = statusMap[order.status] || statusMap['PENDING'];
                                return (
                                    <div key={order.id} onClick={() => { setTrackingOrder(order); setActiveTab('TrackOrder'); }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-6 cursor-pointer hover:shadow-md hover:border-red-100 transition-all">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-black text-gray-400">Order #{order.id}</p>
                                                <p className="text-gray-900 font-bold text-sm">Delivery: {order.delivery_address}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-red-500">${parseFloat(order.total_amount).toFixed(2)}</p>
                                                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-sm ${st.bg}`}>{order.status}</span>
                                            </div>
                                        </div>
                                        {order.status !== 'CANCELLED' && (
                                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden flex">
                                                {[1, 2, 3, 4, 5, 6].map(step => (
                                                    <div key={step} className={`h-full flex-1 border-r border-white/20 ${step <= st.step ? 'bg-red-500' : 'bg-transparent'}`}></div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                        )}
                    </div>
                </main>
            ) : activeTab === 'Profile' ? (
                <main className="flex-1 w-full max-w-4xl mx-auto p-6 flex flex-col gap-8 pb-32 animate-in fade-in duration-300">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <User className="text-[#DE3E44]" size={28} /> My Profile
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* User Details Card */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col gap-4">
                            <h3 className="text-lg font-black text-gray-800">Account Details</h3>
                            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-600 text-3xl mx-auto shadow-sm">
                                {(JSON.parse(localStorage.getItem('user'))?.username || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="text-center mt-2">
                                <p className="font-bold text-xl text-gray-900">{JSON.parse(localStorage.getItem('user'))?.username || 'Guest User'}</p>
                                <p className="text-sm font-bold text-gray-500 mt-1">{JSON.parse(localStorage.getItem('user'))?.email || 'guest@mealmate.com'}</p>
                            </div>
                        </div>

                        {/* Wallet Card */}
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-[2rem] shadow-md flex flex-col justify-between text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <div>
                                <p className="text-indigo-100 font-bold text-sm tracking-wide">AVAILABLE MAX BALANCE</p>
                                <h1 className="text-5xl font-black tracking-tighter mt-1 drop-shadow-md">
                                    <span className="text-indigo-200 opacity-60 mr-1">$</span>
                                    {walletBalance.toFixed(2)}
                                </h1>
                            </div>
                            <div className="mt-8 flex items-center gap-2">
                                <input
                                    type="number"
                                    id="addWalletInput"
                                    placeholder="Enter amount..."
                                    className="flex-1 bg-white/20 border border-white/30 text-white placeholder:text-white/60 font-bold outline-none rounded-xl px-4 py-3 text-sm focus:border-white transition-colors"
                                />
                                <button
                                    onClick={() => {
                                        const amount = parseFloat(document.getElementById('addWalletInput').value);
                                        if (!amount || amount <= 0) return setCheckoutError("Invalid amount!");
                                        setCheckoutError("");

                                        // Load Razorpay Script dynamically for Wallet Top-up
                                        const script = document.createElement('script');
                                        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                                        script.onload = async () => {
                                            const options = {
                                                key: 'rzp_test_SBSBOdCnil5HzA', // Live Test Key
                                                amount: amount * 100, // Amount in paise
                                                currency: 'INR',
                                                name: 'MealMate',
                                                description: 'Wallet Top-Up',
                                                image: '/logo.png',
                                                handler: async function (response) {
                                                    // On successful payment, credit wallet in DB
                                                    try {
                                                        const cid = JSON.parse(localStorage.getItem('user'))?.id || 1;
                                                        const res = await axios.post((import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api/customer/wallet/', { amount, customer_id: cid });
                                                        if (res.data.success) {
                                                            setWalletBalance(res.data.balance);
                                                            document.getElementById('addWalletInput').value = '';
                                                        }
                                                    } catch (e) {
                                                        setCheckoutError("Failed to update wallet balance on server!");
                                                    }
                                                },
                                                prefill: {
                                                    name: JSON.parse(localStorage.getItem('user'))?.username || 'Guest',
                                                    email: JSON.parse(localStorage.getItem('user'))?.email || 'guest@mealmate.com',
                                                },
                                                theme: { color: '#4F46E5' } // Indigo color for Wallet
                                            };
                                            const rzp = new window.Razorpay(options);
                                            rzp.on('payment.failed', function (response) {
                                                setCheckoutError("Wallet Top-Up Failed: " + response.error.description);
                                            });
                                            rzp.open();
                                        };
                                        script.onerror = () => setCheckoutError("Failed to load Razorpay SDK. Please check your connection.");
                                        document.body.appendChild(script);
                                    }}
                                    className="bg-white text-indigo-600 px-5 py-3 rounded-xl font-black text-sm hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
                                >
                                    Pay & Add Funds
                                </button>
                            </div>
                            {checkoutError && activeTab === 'Profile' && (
                                <div className="mt-4 bg-red-500/20 text-white text-xs font-bold p-3 rounded-xl border border-red-500/30 text-center">
                                    {checkoutError}
                                </div>
                            )}
                        </div>

                    </div>
                </main>
            ) : activeTab === 'TrackOrder' && trackingOrder ? (
                <main className="flex-1 w-full bg-[#fdfdfd] flex flex-col relative pb-20">
                    <div className="bg-gradient-to-r from-[#ed5244] to-[#f47025] w-full pt-10 pb-20 px-6 sm:px-12 relative">
                        <button onClick={() => setActiveTab('Orders')} className="flex items-center gap-2 text-white border border-white/30 hover:bg-white/10 rounded-lg px-4 py-1.5 text-sm font-bold mb-6 transition-colors">
                            <ArrowLeft size={16} /> Back to Orders
                        </button>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end w-full max-w-6xl mx-auto">
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight">Order #{trackingOrder.id}</h1>
                                <p className="text-white/80 font-bold text-sm flex items-center gap-2 mt-1">
                                    <Calendar size={14} />
                                    {new Date(trackingOrder.created_at).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' })}
                                </p>
                            </div>
                            <div className="bg-white px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-bold shadow-md text-[#2bba71] mt-4 sm:mt-0">
                                <Check size={16} strokeWidth={3} /> {trackingOrder.status === 'PENDING' ? 'Processing' : trackingOrder.status}
                            </div>
                        </div>
                    </div>

                    <div className="max-w-6xl mx-auto w-full px-6 -mt-10 relative z-10 space-y-6">

                        <div className="bg-white rounded-[1.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col">
                            <h3 className="font-bold text-sm text-slate-800 mb-8 flex items-center gap-2"><MapPin size={16} className="text-[#DE3E44]" /> Order Tracking</h3>

                            {/* Tracking Timeline */}
                            <div className="w-full relative flex justify-between items-center px-4 sm:px-10">
                                <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-100 -translate-y-1/2 z-0 hidden sm:block"></div>

                                {['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'PICKED_UP', 'DELIVERED'].map((s, i) => {
                                    const states = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'PICKED_UP', 'DELIVERED'];
                                    const currentIndex = states.indexOf(trackingOrder.status);
                                    let isPassed = false;
                                    if (trackingOrder.status === 'CANCELLED') {
                                        isPassed = false;
                                    } else {
                                        isPassed = i <= currentIndex;
                                    }

                                    const labels = ['PENDING', 'CONFIRMED', 'PREPARING', 'PACKED', 'PICKED', 'DELIVERED'];
                                    return (
                                        <div key={s} className="relative z-10 flex flex-col items-center gap-3">
                                            <div className={`w-4 h-4 rounded-full border-4 shadow-sm transition-colors ${isPassed ? 'bg-[#f47025] border-[#ffefe5]' : 'bg-slate-200 border-slate-50'}`}></div>
                                            <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest ${isPassed ? 'text-slate-800' : 'text-slate-300'}`}>{labels[i]}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                                    <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2"><ShoppingBag size={16} className="text-orange-500" /> Order Items</h3>
                                    <div className="space-y-3">
                                        {trackingOrder.items && trackingOrder.items.length > 0 ? (
                                            trackingOrder.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                                                    <div className="flex gap-4 items-center">
                                                        <div className="w-14 h-14 bg-white rounded-xl overflow-hidden shrink-0 shadow-sm border border-slate-100">
                                                            <img src={item.image_url || '/logo.png'} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-800 text-sm">{item.name || `Item #${item.menu_item}`}</h4>
                                                            <p className="text-xs font-bold text-slate-400 mt-0.5">Qty: {item.qty || item.quantity}</p>
                                                        </div>
                                                    </div>
                                                    <div className="font-black text-slate-800">${parseFloat(item.price * (item.qty || item.quantity)).toFixed(2)}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex justify-between items-center p-4 border border-slate-100 rounded-2xl">
                                                <div className="flex gap-4 items-center">
                                                    <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden shrink-0"><img src="/logo.png" className="w-full h-full object-cover opacity-50" /></div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-sm">Combo Details</h4>
                                                        <p className="text-xs font-bold text-slate-400 mt-0.5">Qty: Multiple Items</p>
                                                    </div>
                                                </div>
                                                <div className="font-black text-slate-800">${parseFloat(trackingOrder.total_amount).toFixed(2)}</div>
                                            </div>
                                        )}
                                        {/* Detailed Invoice Summary */}
                                        <div className="flex flex-col gap-3 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm mt-4">
                                            {(() => {
                                                const total = parseFloat(trackingOrder.total_amount) || 0;
                                                const discount = trackingOrder.discount_amount ? parseFloat(trackingOrder.discount_amount) : 0;

                                                let preGst = 0;
                                                if (trackingOrder.items && trackingOrder.items.length > 0) {
                                                    preGst = trackingOrder.items.reduce((acc, item) => acc + (parseFloat(item.price || 0) * (item.qty || item.quantity || 1)), 0);
                                                } else {
                                                    preGst = (total / 1.05) + discount;
                                                }

                                                const gst = (preGst - discount) * 0.05;

                                                return (
                                                    <>
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-slate-500 font-medium hover:text-slate-700 transition-colors">Subtotal</span>
                                                            <span className="font-bold text-slate-700">${preGst.toFixed(2)}</span>
                                                        </div>
                                                        {discount > 0 && (
                                                            <div className="flex justify-between items-center text-sm">
                                                                <span className="text-emerald-500 font-medium">Discount Applied</span>
                                                                <span className="font-bold text-emerald-600">-${discount.toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-slate-500 font-medium hover:text-slate-700 transition-colors">Taxes & GST (5%)</span>
                                                            <span className="font-bold text-slate-700">${gst.toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-4 mb-2 mt-1">
                                                            <span className="text-slate-500 font-medium hover:text-slate-700 transition-colors">Payment Method</span>
                                                            <span className="font-black px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded uppercase text-[10px] tracking-wider border border-indigo-100">{trackingOrder.payment_method || 'ONLINE'}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-black text-slate-800 text-base tracking-tight">Total Paid</span>
                                                            <span className="font-black text-[22px] text-red-500 tracking-tighter">${total.toFixed(2)}</span>
                                                        </div>
                                                    </>
                                                )
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                                    <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2"><Store size={16} className="text-red-400" /> Restaurant</h3>
                                    <div className="flex gap-4 items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-500 shadow-sm"><Store size={18} /></div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">Restaurant Details Protected</h4>
                                            <p className="text-xs font-bold text-slate-500 mt-0.5"><MapPin size={10} className="inline mr-1" /> Partnered Hub</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                                    <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2"><Navigation size={16} className="text-green-500" /> Delivery Address</h3>
                                    <div className="flex gap-4 items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-500 shadow-sm"><MapPin size={18} /></div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">{trackingOrder.delivery_address}</h4>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                                    <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2">
                                        <User size={16} className="text-blue-500" /> Delivery Partner
                                    </h3>

                                    {trackingOrder.delivery_partner_name ? (
                                        <div className="p-5 flex items-center justify-between bg-blue-50/50 rounded-2xl border border-blue-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                                                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${trackingOrder.delivery_partner_name}`} alt="driver" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 text-base">{trackingOrder.delivery_partner_name}</h4>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <Star size={12} className="fill-blue-500 text-blue-500" />
                                                        <span className="text-xs font-bold text-blue-700">4.9 • Delivery Hero</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => window.location.href = `tel:${trackingOrder.delivery_partner_phone || '+15551234567'}`} className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition shadow-lg shadow-blue-500/30">
                                                <PhoneCall size={20} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-10 flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4 border border-orange-100 text-orange-400">
                                                <Clock size={24} />
                                            </div>
                                            <p className="font-bold text-slate-500 text-sm">Delivery partner will be assigned soon</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                                    <h3 className="font-bold text-sm text-slate-800 mb-6 flex items-center gap-2"><FileText size={16} className="text-red-400" /> Order Summary</h3>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between items-center text-sm font-bold">
                                            <span className="text-slate-500">Payment Method</span>
                                            <span className="text-slate-900">RAZORPAY</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-bold">
                                            <span className="text-slate-500">Payment Status</span>
                                            <span className="bg-[#e2f5ea] text-[#1e8d47] px-3 py-1 rounded-full text-xs">Completed</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                                        <span className="font-black text-slate-900">Total Amount</span>
                                        <span className="font-black text-xl text-[#DE3E44]">₹{trackingOrder.total_amount}</span>
                                    </div>
                                </div>

                                <button className="w-full py-4 border border-red-200 text-[#DE3E44] hover:bg-red-50 rounded-[1rem] font-bold text-sm transition-colors flex items-center justify-center gap-2">
                                    <X size={16} /> Cancel Order
                                </button>
                                <button className="w-full py-4 border border-red-200 text-[#DE3E44] hover:bg-red-50 rounded-[1rem] font-bold text-sm transition-colors flex items-center justify-center gap-2">
                                    <Plus size={16} /> Order More
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            ) : (
                <main className="flex-1 w-full bg-[#fdfdfd]">
                    <div className="w-full flex flex-col items-center justify-center pt-6 pb-16 px-4">
                        <div className="mix-blend-multiply w-full max-w-[600px] flex justify-center -mb-2">
                            <img src="/logo.png" alt="MealMate" className="w-full h-auto max-h-[300px] object-contain" />
                        </div>

                        <h1 className="text-3xl md:text-[42px] font-black text-gray-900 tracking-tight leading-tight text-center mb-8">
                            Order food from favourite <br className="hidden md:block" />
                            <span className="text-[#DE3E44]">restaurants</span> near you
                        </h1>

                        {/* The Search Bar Component */}
                        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 flex flex-col md:flex-row items-center p-2 mb-8">

                            {/* Location Part */}
                            <div
                                onClick={handleDetectLocation}
                                className="flex w-full md:w-1/3 items-center gap-3 px-4 py-3 md:py-0 border-b md:border-b-0 md:border-r border-gray-100 cursor-pointer group"
                            >
                                <div className="w-10 h-10 bg-[#FF5B61] group-hover:bg-[#DE3E44] transition-colors rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                                    <MapPin size={20} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Deliver to</p>
                                    <p className="text-sm font-bold text-gray-900 group-hover:text-[#DE3E44] transition-colors line-clamp-1">{locationText}</p>
                                </div>
                            </div>

                            <div className="flex-1 w-full flex items-center px-4 py-3 md:py-0 relative">
                                <Search size={20} className="text-[#FF5B61] shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search for restaurant, cuisine or a dish..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-transparent border-none outline-none px-3 text-sm font-medium text-gray-700 placeholder-gray-400"
                                />
                            </div>

                            {/* Search Button */}
                            <button
                                onClick={() => document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                className="w-full md:w-auto bg-[#DE3E44] hover:bg-[#c8353a] text-white px-10 py-3.5 rounded-xl font-bold transition-colors shadow-md"
                            >
                                Search
                            </button>

                        </div>

                    </div>

                    {/* Circular Image Categories representing the screenshot */}
                    <div className="max-w-6xl mx-auto px-6 w-full mb-14 border-[#FDFDFD]">
                        <div className="flex items-center justify-center overflow-x-auto hide-scrollbar gap-8 md:gap-12 py-4">
                            {[
                                { name: 'Pizza', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop' },
                                { name: 'Burger', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop' },
                                { name: 'Thali', img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&h=200&fit=crop' },
                                { name: 'Biryani', img: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=200&h=200&fit=crop' },
                                { name: 'Chinese', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=200&h=200&fit=crop' },
                                { name: 'Sushi', img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200&h=200&fit=crop' },
                                { name: 'Coffee', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop' },
                                { name: 'Snacks', img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&h=200&fit=crop' },
                            ].map(cat => (
                                <div
                                    key={cat.name}
                                    onClick={() => {
                                        setActiveCategory(cat.name);
                                        document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className="flex flex-col items-center gap-3 cursor-pointer group flex-shrink-0"
                                >
                                    <div className={`w-24 h-24 rounded-full overflow-hidden border-4 transition-all shadow-md group-hover:shadow-lg p-1 bg-white ${activeCategory === cat.name ? 'border-[#DE3E44] scale-110' : 'border-transparent group-hover:border-[#DE3E44]'}`}>
                                        <img src={cat.img} alt={cat.name} className="w-full h-full object-cover rounded-full" />
                                    </div>
                                    <span className="text-sm font-bold text-gray-800">{cat.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Promo Banners */}
                    <div className="max-w-6xl mx-auto px-6 w-full flex flex-col md:flex-row gap-6 mb-20 hide-scrollbar overflow-x-auto snap-x justify-center">

                        {/* Red Banner */}
                        <div className="flex-1 max-w-[360px] snap-center bg-gradient-to-br from-[#FF5B61] to-[#DE3E44] rounded-2xl p-7 text-white shadow-lg relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-[26px] font-black mb-1 tracking-tight">FLAT 50% OFF</h3>
                                <p className="text-white/90 font-semibold mb-5 text-sm">On your first order</p>
                                <span className="bg-white/20 px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider">WELCOME50</span>
                            </div>
                        </div>

                        {/* Yellow Banner */}
                        <div className="flex-1 max-w-[360px] snap-center bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] rounded-2xl p-7 text-white shadow-lg relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-[26px] font-black mb-1 tracking-tight">FREE DELIVERY</h3>
                                <p className="text-white/90 font-semibold mb-5 text-sm">On orders above ₹199</p>
                                <span className="bg-white/20 px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider">FREEDEL</span>
                            </div>
                        </div>

                        {/* Purple Banner */}
                        <div className="flex-1 max-w-[360px] snap-center bg-gradient-to-br from-[#818CF8] to-[#6366F1] rounded-2xl p-7 text-white shadow-lg relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-[26px] font-black mb-1 tracking-tight">20% CASHBACK</h3>
                                <p className="text-white/90 font-semibold mb-5 text-sm">Pay with UPI & get cashback</p>
                                <span className="bg-white/20 px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider">UPISAVE</span>
                            </div>
                        </div>
                    </div>

                    <main id="explore-section" className="flex-1 max-w-7xl mx-auto px-6 w-full mb-20">

                        {/* 🏪 Restaurants List Section */}
                        <section className="mb-14">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                    Popular Restaurants
                                </h2>
                                <button className="text-sm font-bold text-[#DE3E44] flex items-center hover:underline">
                                    See all <ChevronRight size={16} />
                                </button>
                            </div>

                            <div className="flex gap-6 overflow-x-auto pb-6 hide-scrollbar snap-x">
                                {filteredRestaurants.map(rest => {
                                    const isSelected = activeRestaurant === rest.id;
                                    const imageSrc = rest.banner_url || rest.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80';
                                    return (
                                        <div
                                            key={rest.id}
                                            onClick={() => { setActiveRestaurant(rest.id); setActiveCategory('All'); }}
                                            className={`snap-start shrink-0 w-[280px] bg-white rounded-3xl border cursor-pointer overflow-hidden transition-all duration-300 group ${isSelected ? 'border-[#DE3E44] shadow-[0_10px_30px_-10px_rgba(222,62,68,0.4)] scale-[1.02]' : 'border-transparent hover:border-gray-100 hover:shadow-xl hover:-translate-y-1'}`}
                                        >
                                            <div className="h-[180px] w-full relative overflow-hidden rounded-2xl mx-1 mt-1">
                                                <img src={imageSrc} onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80"; }} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 rounded-2xl" alt={rest.name} />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                                                {/* Badge style exactly like screenshot */}
                                                <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur pl-2 pr-3 py-1 rounded-md text-[11px] font-black text-white flex items-center gap-1 shadow-sm uppercase tracking-wide">
                                                    <Star size={12} className="text-red-500 fill-red-500" /> 20% OFF
                                                </div>
                                            </div>
                                            <div className="px-2 py-4 flex items-center justify-between">
                                                <h3 className="font-extrabold text-[#1c1c1c] text-[15px] truncate max-w-[200px]" title={rest.name}>{rest.name}</h3>
                                                <div className="bg-[#1C8D44] text-white px-1.5 py-0.5 rounded flex items-center gap-0.5 text-[11px] font-bold shadow-sm">
                                                    {rest.rating}
                                                    <Star size={10} className="fill-white" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* 🍔 Dynamic Menu Categories */}
                        <div className="sticky top-20 z-30 bg-[#FDFDFD]/90 backdrop-blur-md pt-4 pb-4 -mx-6 px-6 border-b border-gray-100 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.05)]">
                            <div className="flex gap-3 overflow-x-auto hide-scrollbar snap-x max-w-7xl mx-auto">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`snap-start whitespace-nowrap px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${activeCategory === cat
                                            ? 'bg-gray-900 text-white shadow-md'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300 hover:text-red-500'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 🍕 Food Items Grid */}
                        <section className="mt-8">
                            {loading ? (
                                <div className="flex justify-center p-20"><div className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div></div>
                            ) : filteredItems.length === 0 ? (
                                <div className="text-center py-20">
                                    <Flame size={48} className="mx-auto text-gray-200 mb-4" />
                                    <h3 className="text-xl font-bold text-gray-400">No items available here.</h3>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {filteredItems.map(item => {
                                        const parentRes = restaurants.find(r => r.id === item.restaurant);
                                        return (
                                            <div key={item.id} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(229,57,53,0.15)] hover:-translate-y-1.5 transition-all duration-300 flex">
                                                <div className="w-1/3 min-w-[120px] max-w-[160px] h-full relative p-3">
                                                    <div className="w-full h-full rounded-2xl overflow-hidden relative">
                                                        <img src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80'} alt={item.name} className="w-full h-full object-cover" />
                                                    </div>
                                                </div>

                                                <div className="p-5 pl-2 flex-1 flex flex-col justify-between">
                                                    <div>
                                                        {!activeRestaurant && parentRes && (
                                                            <p className="text-[10px] uppercase tracking-widest font-bold text-red-500 mb-1">{parentRes.name}</p>
                                                        )}
                                                        <h4 className="font-bold text-[16px] leading-tight text-gray-900 line-clamp-2">{item.name}</h4>
                                                        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 font-medium">{item.description}</p>
                                                    </div>
                                                    <div className="mt-4 flex justify-between items-center">
                                                        <span className="font-black text-gray-900">₹{Number(item.price).toFixed(2)}</span>
                                                        <button onClick={() => addToCart(item)} className="bg-gray-100 hover:bg-black hover:text-white text-gray-900 w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-all duration-300 active:scale-95 shadow-sm">
                                                            <Plus size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </main>
                </main>
            )}

            {/* ️ Features Band */}
            <div className="w-full bg-white py-16 border-t border-gray-100 mt-auto">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-center">

                    {/* Feature 1 */}
                    <div className="flex flex-col items-center">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#FF6B35] to-[#F15025] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20 text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <h4 className="text-gray-900 font-bold mb-1.5">Fast Delivery</h4>
                        <p className="text-gray-500 text-sm font-medium">Get food delivered in under 30 mins</p>
                    </div>

                    {/* Feature 2 */}
                    <div className="flex flex-col items-center">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#FF6B35] to-[#F15025] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20 text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                        <h4 className="text-gray-900 font-bold mb-1.5">Fresh & Hygienic</h4>
                        <p className="text-gray-500 text-sm font-medium">Strict quality standards maintained</p>
                    </div>

                    {/* Feature 3 */}
                    <div className="flex flex-col items-center">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#FF6B35] to-[#F15025] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20 text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /><text x="12" y="16" fill="currentColor" fontSize="10" fontWeight="bold" textAnchor="middle">%</text></svg>
                        </div>
                        <h4 className="text-gray-900 font-bold mb-1.5">Best Offers</h4>
                        <p className="text-gray-500 text-sm font-medium">Exclusive deals and discounts</p>
                    </div>

                    {/* Feature 4 */}
                    <div className="flex flex-col items-center">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#FF6B35] to-[#F15025] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20 text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /><circle cx="12" cy="12" r="3" fill="currentColor" /></svg>
                        </div>
                        <h4 className="text-gray-900 font-bold mb-1.5">24/7 Support</h4>
                        <p className="text-gray-500 text-sm font-medium">Always here to help you</p>
                    </div>

                </div>
            </div>

            {/* 🔽 Footer Exactly Like Screenshot */}
            <footer className="bg-[#181818] border-t-4 border-[#F15025] relative">
                <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-y-12 gap-x-8">

                    {/* Col 1: Brand */}
                    <div className="lg:col-span-2 pr-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-white rounded-lg p-1 min-w-[40px] flex justify-center">
                                <img src="/logo.png" alt="MealMate Logo" className="h-10 w-auto max-w-[140px] object-contain mix-blend-multiply" />
                            </div>
                            <span className="text-2xl font-black text-white tracking-tight">MealMate</span>
                        </div>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed mb-6">
                            MealMate is your one-stop destination for ordering delicious food from the best restaurants in your city. Fast delivery, great prices, and amazing taste!
                        </p>
                        <div className="flex items-center gap-3">
                            <a href="#" className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center text-gray-400 hover:bg-[#DE3E44] hover:text-white transition-colors duration-300">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center text-gray-400 hover:bg-[#DE3E44] hover:text-white transition-colors duration-300">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center text-gray-400 hover:bg-[#DE3E44] hover:text-white transition-colors duration-300">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                            </a>
                        </div>
                    </div>

                    {/* Col 2: About MealMate */}
                    <div>
                        <h4 className="text-white font-black mb-6 text-sm uppercase tracking-wider">About MealMate</h4>
                        <ul className="space-y-4">
                            {['Who We Are', 'Blog', 'Work With Us', 'Investor Relations', 'Report Fraud'].map(title => (
                                <li key={title}><a href="#" onClick={(e) => { e.preventDefault(); setInfoModalData({ title, content: footerInfoData[title] }) }} className="text-gray-400 font-medium text-sm hover:text-[#DE3E44] transition-colors">{title}</a></li>
                            ))}
                        </ul>
                    </div>

                    {/* Col 3: Legal */}
                    <div>
                        <h4 className="text-white font-black mb-6 text-sm uppercase tracking-wider">Legal</h4>
                        <ul className="space-y-4">
                            {['Terms & Conditions', 'Privacy Policy', 'Security'].map(title => (
                                <li key={title}><a href="#" onClick={(e) => { e.preventDefault(); setInfoModalData({ title, content: footerInfoData[title] }) }} className="text-gray-400 font-medium text-sm hover:text-[#DE3E44] transition-colors">{title}</a></li>
                            ))}
                        </ul>
                    </div>

                    {/* Col 4: Contact Us */}
                    <div className="lg:col-span-1">
                        <h4 className="text-white font-black mb-6 text-sm">Contact Us</h4>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3">
                                <MapPin size={16} className="text-[#DE3E44] shrink-0 mt-0.5" />
                                <a href="https://www.google.com/maps/dir/?api=1&destination=LJ+Campus,+Near+Sarkhej-Sanand+Circle,+Off.+S.G.+Road,+Ahmedabad,+Gujarat+-+382210" target="_blank" rel="noopener noreferrer" className="text-gray-400 text-sm font-medium hover:text-[#DE3E44] transition-colors leading-relaxed">
                                    LJ Campus, Near Sarkhej-Sanand Circle, Off. S.G. Road, Ahmedabad, Gujarat - 382210
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="w-4 h-4 text-[#DE3E44]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                <a href="tel:+919512533632" className="text-gray-400 text-sm font-medium hover:text-[#DE3E44] transition-colors">9512533632</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="w-4 h-4 text-[#DE3E44]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                <a href="mailto:vsoham410@gmail.com" className="text-gray-400 text-sm font-medium hover:text-[#DE3E44] transition-colors">vsoham410@gmail.com</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Clock size={16} className="text-[#DE3E44] shrink-0" />
                                <span className="text-gray-400 text-sm font-medium">Mon - Sun: 8:00 AM - 11:00 PM</span>
                            </li>
                        </ul>

                        <h4 className="text-white font-black mb-4 text-sm">Download App</h4>
                        <div className="flex gap-3 flex-wrap">
                            <button className="flex items-center gap-2 bg-[#2a2a2a] hover:bg-[#333] transition-colors px-4 py-2 rounded-lg text-white border border-gray-700">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" /></svg>
                                <div>
                                    <div className="text-[9px] text-gray-300 -mb-0.5">Download on the</div>
                                    <div className="text-xs font-bold font-sans">App Store</div>
                                </div>
                            </button>
                            <button className="flex items-center gap-2 bg-[#2a2a2a] hover:bg-[#333] transition-colors px-4 py-2 rounded-lg text-white border border-gray-700">
                                <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 512 512"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" /></svg>
                                <div>
                                    <div className="text-[9px] text-gray-300 -mb-0.5">GET IT ON</div>
                                    <div className="text-xs font-bold font-sans">Google Play</div>
                                </div>
                            </button>
                        </div>
                    </div>

                </div>

                <div className="border-t border-gray-800">
                    <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-gray-500 text-xs font-medium">
                            By continuing past this page, you agree to our Terms of Service, Cookie Policy, Privacy Policy and Content Policies. All trademarks are properties of their respective owners. 2026-2027 © MealMate™ Ltd. All rights reserved.
                        </p>
                    </div>
                </div>

                {/* Back to top button */}
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="absolute right-8 -top-6 w-12 h-12 bg-[#DE3E44] hover:bg-[#c8353a] rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                </button>
            </footer>

            {/* 🎉 Beautiful Order Success Modal */}
            {orderSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"></div>

                    <div className="bg-white rounded-[2rem] p-10 max-w-sm w-full relative z-10 flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95 duration-500 border border-slate-100">
                        <div className="w-20 h-20 bg-[#2bba71] rounded-full flex items-center justify-center mb-6 shadow-[0_10px_20px_-10px_rgba(43,186,113,0.6)] relative">
                            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-[26px] font-black text-slate-900 tracking-tight mb-2">Order Placed Successfully!</h2>
                        <p className="text-slate-500 font-medium mb-8 text-sm">Your delicious food is on its way!</p>

                        <div className="w-full bg-slate-50 rounded-2xl py-4 flex flex-col items-center justify-center mb-4 border border-slate-100">
                            <span className="text-xs font-bold text-slate-500 mb-0.5">Order ID</span>
                            <span className="text-[#DE3E44] font-black text-xl">#{orderSuccessId || '...'}</span>
                        </div>

                        <div className="w-full bg-[#ffefe5] border border-[#ffe0cc] rounded-2xl py-5 flex flex-col items-center justify-center mb-8 shadow-inner relative overflow-hidden">
                            <div className="text-blue-600 mb-1.5"><Clock size={20} className="stroke-[2.5]" /></div>
                            <span className="text-xs font-bold text-slate-700 mb-1">Estimated Delivery Time</span>
                            <span className="text-blue-600 font-black text-2xl tracking-tight">30-45 mins</span>
                        </div>

                        <button
                            onClick={() => {
                                setOrderSuccess(false);
                                setActiveTab('TrackOrder');
                            }}
                            className="w-full py-3.5 bg-gradient-to-r from-[#ed5244] to-[#f47025] hover:to-[#ed5244] text-white rounded-xl font-bold text-sm transition-all shadow-[0_8px_20px_-8px_rgba(237,82,68,0.6)] active:scale-95 mb-3 flex items-center justify-center gap-2"
                        >
                            <Truck size={16} /> Track Order
                        </button>

                        <button
                            onClick={() => {
                                setOrderSuccess(false);
                                setActiveTab('Home');
                            }}
                            className="w-full py-3.5 bg-white hover:bg-slate-50 text-slate-500 border border-slate-300 rounded-xl font-bold text-sm transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            )}

            {/* 🛒 Full-Size Shopping Cart Modal */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
                    <div onClick={() => setIsCartOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300 cursor-pointer"></div>
                    <div className="relative w-full max-w-6xl h-full max-h-[90vh] bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col md:flex-row overflow-hidden border border-gray-100">

                        {/* LEFT SIDE: CART ITEMS & HEADER */}
                        <div className="flex-1 flex flex-col bg-gray-50/50">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                                        <ShoppingCart size={32} className="text-[#DE3E44] fill-red-50" /> Checkout
                                    </h2>
                                    <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">{cart.length} items in your order</p>
                                </div>
                                <button onClick={() => setIsCartOpen(false)} className="md:hidden p-3 bg-gray-100 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors">
                                    <X size={20} strokeWidth={2.5} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 gap-5 flex flex-col">
                                {cart.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
                                        <div className="w-32 h-32 bg-white shadow-sm rounded-full flex items-center justify-center mb-6">
                                            <ShoppingCart size={48} className="text-gray-300" />
                                        </div>
                                        <p className="text-3xl font-black text-gray-800 tracking-tight">Your cart is empty</p>
                                        <p className="text-gray-400 font-medium mt-2 text-lg">Add some fiery dishes to get started.</p>
                                    </div>
                                ) : (
                                    cart.map(item => (
                                        <div key={item.id} className="flex gap-6 items-center bg-white p-5 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-transform hover:-translate-y-1">
                                            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-sm shrink-0">
                                                <img src={item.image_url} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0 pr-4">
                                                <h4 className="font-bold text-xl text-gray-900 truncate tracking-tight">{item.name}</h4>
                                                <p className="text-gray-400 font-medium text-sm mt-1">{item.category}</p>
                                                <p className="text-red-600 font-black text-lg mt-2">${(item.price * item.qty).toFixed(2)}</p>
                                            </div>
                                            <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-full p-1.5 shadow-inner">
                                                <button onClick={() => decreaseQty(item.id)} className="w-10 h-10 flex items-center justify-center bg-white shadow-sm rounded-full transition-transform active:scale-90 hover:text-red-500">
                                                    <Minus size={16} strokeWidth={3} />
                                                </button>
                                                <span className="font-black text-lg w-6 text-center">{item.qty}</span>
                                                <button onClick={() => addToCart(item)} className="w-10 h-10 flex items-center justify-center bg-white shadow-sm rounded-full transition-transform active:scale-90 hover:text-green-500">
                                                    <Plus size={16} strokeWidth={3} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* RIGHT SIDE: CHECKOUT ACTIONS */}
                        {cart.length > 0 && (
                            <div className="w-full md:w-[480px] bg-white border-l border-gray-100 p-8 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.02)] relative z-10 overflow-y-auto">
                                <button onClick={() => setIsCartOpen(false)} className="hidden md:flex absolute top-8 right-8 p-3 bg-gray-50 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors z-20">
                                    <X size={20} strokeWidth={3} />
                                </button>

                                <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-8">Payment Summary</h3>
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <div className="flex justify-between items-end mb-1">
                                            <label className="block text-xs font-bold text-gray-500">Delivery Address</label>
                                            <button onClick={handleAutoDetectAddress} disabled={isDetectingAddress} className="text-[10px] font-bold text-[#DE3E44] flex items-center gap-1 hover:underline">
                                                <Navigation size={10} /> {isDetectingAddress ? 'Detecting...' : 'Auto Detect'}
                                            </button>
                                        </div>
                                        <textarea rows={2} placeholder="e.g. 123 Tech Park, Floor 4" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-semibold outline-none focus:border-red-500 resize-none" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} required />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <div className="flex-1 relative">
                                                <select
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-700 outline-none focus:border-red-500 appearance-none cursor-pointer"
                                                    value={coupon}
                                                    onChange={e => setCoupon(e.target.value)}
                                                    disabled={couponApplied}
                                                >
                                                    <option value="">Select an applicable coupon...</option>
                                                    {availableCoupons.filter(c => cartTotal >= (c.min_order_amount || 0)).map(c => (
                                                        <option key={c.code} value={c.code}>
                                                            {c.code} — {c.description} (Min: ${c.min_order_amount})
                                                        </option>
                                                    ))}
                                                </select>
                                                {/* Custom Dropdown Arrow */}
                                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                                    <ChevronRight size={14} className="text-gray-400 rotate-90" />
                                                </div>
                                            </div>
                                            {couponApplied ? (
                                                <button onClick={() => { setCoupon(''); setCouponApplied(false); setDiscountAmount(0); }} className="px-5 bg-red-100 text-red-600 rounded-xl font-bold text-sm hover:bg-red-200 transition-colors">Clear</button>
                                            ) : (
                                                <button onClick={handleApplyCoupon} className="px-5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors disabled:opacity-50" disabled={!coupon}>Apply</button>
                                            )}
                                        </div>
                                    </div>

                                    {/* BILL SUMMARY */}
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 mt-4">
                                        <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                                            <span>Subtotal</span>
                                            <span>${cartTotal.toFixed(2)}</span>
                                        </div>
                                        {discountAmount > 0 && (
                                            <div className="flex justify-between items-center text-sm font-black text-green-600">
                                                <span>Coupon Discount</span>
                                                <span>-${discountAmount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                                            <span>Taxes & GST (5%)</span>
                                            <span>${gstAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between items-center font-black text-2xl text-gray-900 tracking-tight">
                                            <span>Total Due</span>
                                            <span className="text-red-500">${cartAmountText}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 mt-2">Payment Method</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            <button onClick={() => setPaymentMethod('COD')} className={`p-3 border rounded-xl flex items-center justify-center gap-2 font-bold text-[11px] transition-all ${paymentMethod === 'COD' ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>🚚 Cash</button>
                                            <button onClick={() => setPaymentMethod('ONLINE')} className={`p-3 border rounded-xl flex items-center justify-center gap-2 font-bold text-[11px] transition-all ${paymentMethod === 'ONLINE' ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>💳 Razorpay</button>
                                            <button onClick={() => setPaymentMethod('WALLET')} className={`p-3 border rounded-xl flex items-center justify-center gap-2 font-bold text-[11px] transition-all ${paymentMethod === 'WALLET' ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>👛 ${walletBalance.toFixed(2)}</button>
                                        </div>
                                    </div>
                                </div>
                                {checkoutError && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 font-bold text-sm p-4 rounded-xl mb-4 flex items-center justify-center text-center">
                                        {checkoutError}
                                    </div>
                                )}
                                <button
                                    onClick={async () => {
                                        setCheckoutError('');
                                        if (!deliveryAddress.trim()) { setCheckoutError("Please enter a Delivery Address."); return; }
                                        try {
                                            const payload = {
                                                restaurant: cart[0].restaurant || 1,
                                                customer_id: JSON.parse(localStorage.getItem('user'))?.id || 1,
                                                total_amount: finalAmount,
                                                discount_amount: discountAmount,
                                                coupon_code: couponApplied ? coupon : "",
                                                delivery_address: deliveryAddress,
                                                payment_method: paymentMethod,
                                                items: cart.map(item => ({ menu_item: item.id, quantity: item.qty, price: item.price }))
                                            };

                                            if (paymentMethod === 'ONLINE') {
                                                // Load Razorpay Script dynamically
                                                const script = document.createElement('script');
                                                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                                                script.onload = async () => {
                                                    const options = {
                                                        key: 'rzp_test_SBSBOdCnil5HzA', // Live Test Key
                                                        amount: parseFloat(cartAmountText) * 100, // Amount in paise
                                                        currency: 'INR',
                                                        name: 'MealMate',
                                                        description: 'Food Order Checkout',
                                                        image: '/logo.png',
                                                        handler: async function (response) {
                                                            // On successful payment, create order in DB
                                                            const res = await axios.post((import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api/customer/orders/', payload);

                                                            const newlyCreated = {
                                                                id: res.data.order_id,
                                                                status: 'PENDING',
                                                                delivery_address: payload.delivery_address,
                                                                total_amount: payload.total_amount,
                                                                items: cart,
                                                                created_at: new Date().toISOString()
                                                            };
                                                            setTrackingOrder(newlyCreated);
                                                            setUserOrders(prev => [newlyCreated, ...prev]);

                                                            setCart([]);
                                                            setIsCartOpen(false);
                                                            setOrderSuccessId(res.data.order_id);
                                                            setOrderSuccess(true);
                                                        },
                                                        prefill: {
                                                            name: 'Guest User',
                                                            email: 'guest@example.com',
                                                            contact: '9999999999'
                                                        },
                                                        theme: { color: '#DE3E44' }
                                                    };
                                                    const rzp = new window.Razorpay(options);
                                                    rzp.on('payment.failed', function (response) {
                                                        setCheckoutError("Payment Failed: " + response.error.description);
                                                    });
                                                    rzp.open();
                                                };
                                                script.onerror = () => setCheckoutError("Failed to load Razorpay SDK. Please check your connection.");
                                                document.body.appendChild(script);
                                            } else if (paymentMethod === 'WALLET') {
                                                if (walletBalance < finalAmount) {
                                                    setCheckoutError("Insufficient Wallet Balance! Please add funds or switch to Cash.");
                                                    return;
                                                }
                                                // Deduct wallet locally and place order
                                                setWalletBalance(prev => prev - finalAmount);
                                                const res = await axios.post((import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api/customer/orders/', payload);

                                                const newlyCreated = {
                                                    id: res.data.order_id,
                                                    status: 'PENDING',
                                                    delivery_address: payload.delivery_address,
                                                    total_amount: payload.total_amount,
                                                    items: cart,
                                                    created_at: new Date().toISOString()
                                                };
                                                setTrackingOrder(newlyCreated);
                                                setUserOrders(prev => [newlyCreated, ...prev]);

                                                setCart([]);
                                                setIsCartOpen(false);
                                                setOrderSuccessId(res.data.order_id);
                                                setOrderSuccess(true);
                                            } else {
                                                // Cash on Delivery Flow
                                                const res = await axios.post((import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api/customer/orders/', payload);

                                                const newlyCreated = {
                                                    id: res.data.order_id,
                                                    status: 'PENDING',
                                                    delivery_address: payload.delivery_address,
                                                    total_amount: payload.total_amount,
                                                    items: cart,
                                                    created_at: new Date().toISOString()
                                                };
                                                setTrackingOrder(newlyCreated);
                                                setUserOrders(prev => [newlyCreated, ...prev]);

                                                setCart([]);
                                                setIsCartOpen(false);
                                                setOrderSuccessId(res.data.order_id);
                                                setOrderSuccess(true);
                                            }
                                        } catch (e) {
                                            setCheckoutError("Error placing order: " + e.message);
                                        }
                                    }}
                                    className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white rounded-2xl font-black text-lg transition-all shadow-[0_8px_25px_-8px_rgba(239,68,68,0.5)] active:scale-95 flex items-center justify-center gap-2">
                                    Proceed to Checkout <ChevronRight size={20} strokeWidth={3} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {infoModalData && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setInfoModalData(null)}></div>
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <button onClick={() => setInfoModalData(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-2 transition-colors">
                            <X size={20} />
                        </button>
                        <h2 className="text-2xl font-black text-slate-900 mb-4 pr-10">{infoModalData.title}</h2>
                        <div className="w-12 h-1 bg-[#DE3E44] rounded-full mb-6"></div>
                        <div className="text-slate-600 leading-relaxed font-medium">
                            {infoModalData.content}
                        </div>
                        <button onClick={() => setInfoModalData(null)} className="mt-8 w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
