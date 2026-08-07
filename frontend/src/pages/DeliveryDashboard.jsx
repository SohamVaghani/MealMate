import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Store, Navigation2, MapPin, Bike, DollarSign, Power, CheckCircle2, ChevronRight, Navigation, ChefHat, PhoneCall } from 'lucide-react';

const DELIVERY_API = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api/delivery/orders/';

export default function DeliveryDashboard() {
    const [isOnline, setIsOnline] = useState(false);
    const [earnings, setEarnings] = useState(0.00);
    const [deliveriesDone, setDeliveriesDone] = useState(0);
    const [activeOrders, setActiveOrders] = useState([]);
    const [trackingOrder, setTrackingOrder] = useState(null); // Active Map Navigation State
    useEffect(() => {
        let interval;
        if (isOnline) {
            fetchLiveOrders();
            interval = setInterval(fetchLiveOrders, 3000); // Check DB every 3 seconds for new orders
        } else {
            setActiveOrders([]);
        }
        return () => clearInterval(interval);
    }, [isOnline]);

    const fetchLiveOrders = async () => {
        try {
            const res = await axios.get(DELIVERY_API);
            console.log("RAW DISPATCH GET:", res.data);

            // Transform incoming DB structure to component's expected structure
            const transformedOrders = res.data.map(order => ({
                id: order.id,
                restaurantName: order.restaurant_name || "Restaurant",
                pickupAdd: order.pickup_address || "Pickup Location",
                dropoffAdd: order.delivery_address || "Dropoff Location",
                customerName: order.customer_name || "Valued Customer",
                payout: Number(order.total_amount) * 0.15 || 5.50, // Delivery earns roughly ~15% of total
                totalAmount: Number(order.total_amount) || 0,
                paymentMethod: order.payment_method || "WALLET",
                items: order.items || [],
                distance: "2.1 mi", // Mocked distance
                status: order.status.toLowerCase()
            }));

            console.log("TRANSFORMED STATUSES:", transformedOrders.map(o => o.status));

            // Only display relevant active statuses
            const filteredOrders = transformedOrders.filter(o => ['pending', 'accepted', 'preparing', 'ready', 'picked_up'].includes(o.status));
            console.log("FILTERED ACTIVE:", filteredOrders);
            setActiveOrders(filteredOrders);
        } catch (e) {
            console.error("Failed to fetch live orders from MongoDB/Django:", e);
        }
    };

    const handleAction = async (orderId, newStatus) => {
        const dbStatusMapping = {
            'accepted': 'ACCEPTED',
            'picked_up': 'PICKED_UP',
            'delivered': 'DELIVERED'
        };

        try {
            // 1. Tell Django to update MongoDB natively
            await axios.patch(`${DELIVERY_API}${orderId}/update_status/`, {
                status: dbStatusMapping[newStatus]
            });

            // 2. Local State Management for immediate UI shift
            if (newStatus === 'delivered') {
                const order = activeOrders.find(o => o.id === orderId);
                setEarnings(prev => prev + order.payout);
                setDeliveriesDone(prev => prev + 1);
                setActiveOrders(activeOrders.filter(o => o.id !== orderId));
            } else {
                setActiveOrders(activeOrders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                ));
            }
        } catch (e) {
            alert("Error syncing to backend: " + e.message);
        }
    };

    const currentActiveOrder = activeOrders.find(o => o.status === 'accepted' || o.status === 'picked_up');
    const pendingOrders = activeOrders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status));

    return (
        <div className="flex flex-col h-screen bg-gray-50 font-sans selection:bg-brand-light relative">

            {/* 🗺️ Background Map Area (Simulated Live GPS) */}
            <div className="absolute inset-0 z-0 bg-slate-200 overflow-hidden">
                {isOnline ? (
                    <iframe
                        className="w-full h-full grayscale-[0.1] contrast-[1.1] scale-[1.05]"
                        src={`https://maps.google.com/maps?q=${currentActiveOrder ? currentActiveOrder.dropoffAdd || 'Ahmedabad,India' : 'Ahmedabad,India'}&t=m&z=14&output=embed&iwloc=near`}
                        title="Live GPS Tracking"
                        frameBorder="0"
                        allowFullScreen
                    ></iframe>
                ) : (
                    <img
                        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&q=80"
                        className="w-full h-full object-cover origin-center opacity-30 blur-sm grayscale scale-110"
                        alt="Map Background Offline"
                    />
                )}
                {isOnline && <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay pointer-events-none"></div>}
            </div>

            {/* 🚀 Top Status Bar */}
            <header className="relative z-20 bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm pt-safe">
                <div className="mx-auto w-full px-6 py-4 flex justify-between items-center">

                    {/* Left: Home & Profit */}
                    <div className="flex gap-3 w-1/3 justify-start">
                        <Link to="/" className="bg-gray-100 text-gray-400 hover:text-gray-900 px-4 py-2 rounded-2xl flex items-center justify-center transition-colors">
                            <span className="font-bold text-sm uppercase tracking-wider text-inherit">Home</span>
                        </Link>

                        <div className="bg-green-50 text-green-700 px-5 py-2 rounded-2xl flex items-center gap-2 font-black shadow-sm border border-green-100">
                            <DollarSign size={18} strokeWidth={3} />
                            <span className="text-xl tracking-tight">{earnings.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Middle: Daily Quest */}
                    <div className="flex w-1/3 justify-center">
                        <div className="bg-white/95 rounded-2xl p-3 shadow-md border border-gray-100 w-full max-w-xs shrink-0 mx-4">
                            <div className="flex justify-between items-end mb-1">
                                <div>
                                    <h4 className="font-black text-gray-800 text-xs">Daily Quest</h4>
                                    <p className="text-[10px] text-gray-500 font-bold leading-none hidden sm:block">Complete 5 deliveries for ₹200 bonus</p>
                                </div>
                                <div className="text-right leading-none">
                                    <span className="font-black text-brand text-sm">{deliveriesDone}<span className="text-[10px] text-gray-400">/5</span></span>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mt-1.5">
                                <div className="h-full bg-gradient-to-r from-orange-400 to-brand transition-all duration-1000" style={{ width: `${Math.min((deliveriesDone / 5) * 100, 100)}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Online / Offline */}
                    <div className="flex w-1/3 justify-end">
                        <button
                            onClick={() => setIsOnline(!isOnline)}
                            className={`relative flex items-center justify-between w-32 h-12 rounded-full p-1.5 transition-colors duration-300 shadow-inner ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <span className={`absolute font-bold text-xs text-white uppercase tracking-wider transition-all duration-300 ${isOnline ? 'left-4 opacity-100' : 'left-8 opacity-0'}`}>Online</span>
                            <span className={`absolute font-bold text-xs text-gray-600 uppercase tracking-wider transition-all duration-300 ${!isOnline ? 'right-4 opacity-100' : 'right-8 opacity-0'}`}>Offline</span>

                            <div className={`w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center transform transition-transform duration-300 ${isOnline ? 'translate-x-20 text-green-500' : 'translate-x-0 text-gray-400'}`}>
                                <Power size={18} strokeWidth={3} />
                            </div>
                        </button>
                    </div>

                </div>
            </header>

            {/* 🌟 Main Content Appears over Map */}
            <main className="relative z-10 flex-1 flex flex-col justify-end max-w-[1400px] mx-auto w-full pb-8 px-4 pointer-events-none">

                {!isOnline ? (
                    /* OFFLINE STATE */
                    <div className="bg-white p-8 rounded-[2rem] shadow-2xl text-center pointer-events-auto border border-gray-100 animate-in slide-in-from-bottom-10 fade-in duration-500 max-w-md mx-auto w-full">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                            <Bike size={36} className="text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">You're Offline</h2>
                        <p className="text-gray-500 mt-2 font-medium">Go online to connect to MongoDB and receive real dispatch orders.</p>

                        <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                            <div className="text-left">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Today's Pay</p>
                                <p className="text-xl font-black text-gray-800">${earnings.toFixed(2)}</p>
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Deliveries</p>
                                <p className="text-xl font-black text-gray-800">{deliveriesDone}</p>
                            </div>
                        </div>
                    </div>
                ) : currentActiveOrder ? (

                    /* ACTIVE DELIVERY TRACKING STATE */
                    <div className="bg-white rounded-[2rem] shadow-2xl p-6 pointer-events-auto border border-slate-100 animate-in slide-in-from-bottom-10 max-w-md mx-auto w-full">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="bg-brand text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full animate-pulse">
                                    {currentActiveOrder.status === 'accepted' ? 'Head to Pickup' : 'Deliver to Customer'}
                                </span>
                                <h2 className="text-2xl font-black text-gray-900 mt-3">{currentActiveOrder.payout.toFixed(2)} <span className="text-sm font-medium text-gray-400">Est. Payout</span></h2>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-sm">
                                {currentActiveOrder.distance}
                            </div>
                        </div>

                        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">

                            <div className="relative">
                                <div className={`absolute -left-[27px] w-5 h-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${currentActiveOrder.status === 'picked_up' ? 'bg-green-500' : 'bg-brand'}`}>
                                    {currentActiveOrder.status === 'picked_up' && <CheckCircle2 size={12} className="text-white" />}
                                </div>
                                <h4 className={`font-bold ${currentActiveOrder.status === 'picked_up' ? 'text-gray-400' : 'text-gray-900'}`}>{currentActiveOrder.restaurantName}</h4>
                                <p className="text-xs text-gray-500 mt-0.5">{currentActiveOrder.pickupAdd}</p>
                            </div>

                            <div className="relative">
                                <div className={`absolute -left-[27px] w-5 h-5 rounded-full border-4 border-white shadow-sm ${currentActiveOrder.status === 'picked_up' ? 'bg-brand' : 'bg-gray-300'}`}></div>
                                <h4 className="font-bold text-gray-900">{currentActiveOrder.customerName}</h4>
                                <p className="text-xs text-gray-500 mt-0.5">{currentActiveOrder.dropoffAdd}</p>
                            </div>
                        </div>

                        {currentActiveOrder.items && currentActiveOrder.items.length > 0 && (
                            <div className="mt-8 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Store size={12} /> Order Items</p>
                                <div className="space-y-2 flex flex-col">
                                    {currentActiveOrder.items.map((it, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm font-semibold text-slate-700">
                                            <span>{it.qty}x {it.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {currentActiveOrder.paymentMethod === 'COD' && (
                            <div className="mt-4 flex items-center gap-3 bg-brand/10 p-4 rounded-2xl border border-brand/20">
                                <DollarSign size={20} className="text-brand" />
                                <div>
                                    <p className="text-sm font-black text-brand">Cash on Delivery</p>
                                    <p className="text-xs font-bold text-gray-700">Receive <span className="text-brand flex-shrink-0">${currentActiveOrder.totalAmount.toFixed(2)}</span> cash.</p>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 flex gap-3">
                            <button onClick={() => window.location.href = 'tel:+15551234567'} className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center hover:bg-red-100 transition shadow-sm border border-red-100">
                                <PhoneCall size={22} className="fill-red-50" />
                            </button>

                            <button onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(currentActiveOrder.status === 'accepted' ? currentActiveOrder.pickupAdd : currentActiveOrder.dropoffAdd)}`, '_blank')} className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-100 transition shadow-sm border border-blue-100">
                                <Navigation size={22} className="fill-blue-50" />
                            </button>

                            {currentActiveOrder.status === 'accepted' ? (
                                <button onClick={() => handleAction(currentActiveOrder.id, 'picked_up')} className="flex-1 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-900/30">
                                    Confirm Pickup
                                </button>
                            ) : (
                                <button onClick={() => handleAction(currentActiveOrder.id, 'delivered')} className="flex-1 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 transition-all active:scale-95 shadow-lg shadow-green-500/30">
                                    Mark Delivered
                                </button>
                            )}
                        </div>
                    </div>

                ) : (

                    /* LOOKING FOR ORDERS / NEW PINGS STATE */
                    <div className="flex-1 flex flex-col pointer-events-auto w-full max-w-7xl mx-auto items-center overflow-hidden">


                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full px-4 overflow-y-auto max-h-full hide-scrollbar pb-10 content-start">
                            {pendingOrders.length === 0 ? (
                                <div className="col-span-full bg-white/95 backdrop-blur pb-6 pt-5 px-6 rounded-[2rem] shadow-2xl text-center border border-gray-100 max-w-md mx-auto">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                        <Navigation2 size={28} className="text-blue-500" />
                                    </div>
                                    <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">No orders Available</h3>
                                    <p className="text-sm text-gray-500 mt-1 font-medium">Sit tight! You'll ping here when a request comes in.</p>
                                </div>
                            ) : (
                                pendingOrders.map(order => (
                                    <div key={order.id} className="bg-white p-5 rounded-[2rem] shadow-2xl border-4 border-brand animate-in slide-in-from-bottom-8">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="bg-red-50 text-brand font-black text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
                                                </span>
                                                NEW REQUEST
                                            </span>
                                            <span className="font-bold text-gray-400 text-sm">{order.distance} total</span>
                                        </div>

                                        <div className="flex items-center justify-center py-4 bg-gray-50 rounded-2xl mb-5 border border-gray-100">
                                            <h1 className="text-5xl font-black text-gray-900 tracking-tighter">${order.payout.toFixed(2)}</h1>
                                        </div>

                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                                <ChefHat size={16} className="text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{order.restaurantName}</p>
                                                <p className="text-gray-500 text-xs truncate max-w-[250px]">{order.pickupAdd}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                                <MapPin size={16} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">Delivery Dropoff</p>
                                                <p className="text-gray-500 text-xs truncate max-w-[250px]">{order.dropoffAdd}</p>
                                            </div>
                                        </div>

                                        {order.items && order.items.length > 0 && (
                                            <div className="mb-6 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Store size={12} /> Order Items</p>
                                                <div className="space-y-2 flex flex-col">
                                                    {order.items.map((it, idx) => (
                                                        <div key={idx} className="flex justify-between items-center text-sm font-semibold text-slate-700">
                                                            <span>{it.qty}x {it.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {order.paymentMethod === 'COD' && (
                                            <div className="flex items-center gap-3 bg-brand/10 p-4 rounded-2xl mb-6 border border-brand/20">
                                                <DollarSign size={20} className="text-brand" />
                                                <div>
                                                    <p className="text-sm font-black text-brand">Cash on Delivery</p>
                                                    <p className="text-xs font-bold text-gray-700">Collect <span className="text-brand flex-shrink-0">${order.totalAmount.toFixed(2)}</span> from customer.</p>
                                                </div>
                                            </div>
                                        )}

                                        <button onClick={() => handleAction(order.id, 'accepted')} className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-2xl font-black text-lg transition-transform active:scale-95 shadow-lg shadow-red-500/30">
                                            Tap to Accept
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}
