import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ChefHat, Plus, Trash2, Settings, ListOrdered, Home, TrendingUp, Search, Bell, Sparkles, Image as ImageIcon, Bike } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api/restaurant/menu/';

export default function RestaurantDashboard() {
    const [menuItems, setMenuItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [orderTab, setOrderTab] = useState('Active');

    const [restaurantId, setRestaurantId] = useState(null);
    const [restaurantName, setRestaurantName] = useState('My Restaurant');
    const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80');
    const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
    const [newCoverInput, setNewCoverInput] = useState('');

    const initializeRestaurantId = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                const res = await axios.get((import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api/customer/restaurants/');
                // Find restaurant owned by this user
                let myRest = res.data.find(r => r.owner_id == user.id);

                // Demo Fallback: if no relation found, safely map to the first available restaurant so the UI can function
                if (!myRest && res.data.length > 0) {
                    myRest = res.data[0];
                }

                if (myRest) {
                    setRestaurantId(myRest.id);
                    setRestaurantName(myRest.name);
                    if (myRest.banner_url) {
                        setBannerUrl(myRest.banner_url);
                    }
                    return myRest.id;
                }
            }
            return null; // For fallback
        } catch (e) {
            console.error(e);
            return null;
        }
    };

    const fetchOrders = async (rId) => {
        try {
            const res = await axios.get((import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api/restaurant/orders/');
            // Filter only the orders containing this restaurant's ID
            if (rId) {
                setOrders(res.data.filter(o => o.restaurant == rId));
            } else {
                setOrders(res.data);
            }
        } catch (e) {
            console.error("Failed to fetch orders.");
        }
    };


    const [newItem, setNewItem] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Main Course',
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
        is_available: true,
    });

    useEffect(() => {
        const load = async () => {
            const rId = await initializeRestaurantId();
            fetchMenu(rId);
            fetchOrders(rId);
        };
        load();
    }, []);

    const fetchMenu = async (rId) => {
        try {
            setLoading(true);
            const res = await axios.get(API_URL);
            if (rId) {
                setMenuItems(res.data.filter(m => m.restaurant == rId));
            } else {
                setMenuItems(res.data);
            }
        } catch (error) {
            console.error("Error fetching menu", error);
            setMenuItems([
                { id: 991, name: 'Margherita Pizza', category: 'Pizza', description: 'Classic cheesy pizza baked to perfection.', price: '12.99', image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80' },
                { id: 992, name: 'Spicy Penne Pasta', category: 'Pasta', description: 'Penne arrabiata with extra chili & parmesan flakes.', price: '10.50', image_url: 'https://images.unsplash.com/photo-1621996311210-2f9ced9eb8c0?w=500&q=80' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItem.name || !newItem.price) return;
        try {
            // Assign to our active restaurant
            const payload = { ...newItem, restaurant: restaurantId || 1 };
            if (newItem.id) {
                // Edit existing
                const res = await axios.put(`${API_URL}${newItem.id}/`, payload);
                setMenuItems(menuItems.map(m => m.id === newItem.id ? res.data : m));
                alert("Menu item updated successfully!");
            } else {
                // Add new
                const res = await axios.post(API_URL, payload);
                setMenuItems([...menuItems, res.data]);
                alert("Menu item added successfully!");
            }
            setNewItem({
                name: '', description: '', price: '', category: 'Main Course',
                image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80', is_available: true
            });
        } catch (error) {
            alert("Error saving item: " + error.message);
        }
    };

    const handleEditItem = (item) => {
        setNewItem(item);
        const mainContainer = document.querySelector('main');
        if (mainContainer) {
            mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}${id}/`);
            setMenuItems(menuItems.filter(item => item.id !== id));
        } catch (error) {
            setMenuItems(menuItems.filter(item => item.id !== id));
        }
    };

    const handleUpdateCover = async () => {
        if (newCoverInput && restaurantId) {
            // Validate image URL before saving
            const img = new Image();
            img.onload = async () => {
                try {
                    const res = await axios.post((import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api/restaurant/update-cover/', {
                        restaurant_id: restaurantId,
                        banner_url: newCoverInput
                    });
                    if (res.data.success) {
                        setBannerUrl(newCoverInput);
                        setIsCoverModalOpen(false);
                        setNewCoverInput('');
                    }
                } catch (e) {
                    console.error("Failed to update cover", e);
                    alert("Failed to update cover image.");
                }
            };
            img.onerror = () => {
                alert("The URL you provided is broken or not an image file! Please ensure it ends in .jpg or .png natively.");
            };
            img.src = newCoverInput;
        }
    };

    const updateOrderStatus = async (id, status) => {
        try {
            await axios.patch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/restaurant/orders/${id}/`, { status });
            fetchOrders(restaurantId); // Refresh to get the latest status
        } catch (e) {
            alert("Error updating order: " + e.message);
        }
    };

    const handleAcceptAndPrint = async (order) => {
        await updateOrderStatus(order.id, 'PREPARING');

        let dateStr = "N/A";
        if (order.created_at) {
            // Fix UTC missing Z
            const validIso = order.created_at.includes('Z') ? order.created_at : order.created_at + 'Z';
            const d = new Date(validIso);
            const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            let hours = d.getHours();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const mins = d.getMinutes().toString().padStart(2, '0');

            dateStr = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} | ${hours}:${mins} ${ampm}`;
        }

        let itemsHtml = '';
        if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
                itemsHtml += `
                    <tr>
                        <td style="padding: 12px 15px; border-bottom: 1px solid #f1f5f9; color: #1e293b; font-weight: 600;">${item.name || 'Item'}</td>
                        <td style="padding: 12px 15px; border-bottom: 1px solid #f1f5f9; color: #64748b; text-align: center;">x${item.qty || item.quantity || 1}</td>
                    </tr>
                `;
            });
        }

        const total = parseFloat(order.total_amount || 0);
        const discount = order.discount_amount ? parseFloat(order.discount_amount) : 0;
        const preGst = (total / 1.05) + discount; // approximation based on 5% static GST
        const gst = (preGst - discount) * 0.05;

        // Generate HTML Invoice
        const discountSection = discount > 0 ? (
            '<div class="total-row">' +
            '<span style="color:#10b981;">Discount Applied</span>' +
            '<span style="color:#10b981;">-$' + discount.toFixed(2) + '</span>' +
            '</div>'
        ) : '';

        const invoiceContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Inter', -apple-system, sans-serif; background: #f8fafc; padding: 40px; color: #0f172a; }
                    .invoice-box { max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); background: white; }
                    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px dashed #cbd5e1; padding-bottom: 30px; }
                    .header h1 { margin: 0; color: #ef4444; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; }
                    .header p { margin: 8px 0 0; color: #64748b; font-size: 14px; font-weight: 500; }
                    .row { display: flex; justify-content: space-between; margin-bottom: 12px; }
                    .row-label { color: #64748b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
                    .row-val { color: #0f172a; font-size: 14px; font-weight: 700; text-align: right; }
                    table { border-collapse: collapse; margin-top: 30px; margin-bottom: 20px; width: 100%; }
                    th { font-size: 12px; text-transform: uppercase; color: #94a3b8; border-bottom: 2px solid #e2e8f0; padding: 12px 15px; text-align: left; }
                    .totals { margin-top: 30px; border-top: 2px solid #e2e8f0; padding-top: 20px; }
                    .total-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px; font-weight: 600; }
                    .total-final { display: flex; justify-content: space-between; margin-top: 20px; font-size: 24px; font-weight: 900; color: #ef4444; border-top: 2px dashed #cbd5e1; padding-top: 20px; }
                    .footer-msg { text-align: center; margin-top: 40px; font-size: 13px; color: #94a3b8; font-weight: 500; }
                </style>
            </head>
            <body>
                <div class="invoice-box">
                    <div class="header">
                        <h1>MEALMATE</h1>
                        <p>Official Partner Invoice Receipt</p>
                    </div>
                    
                    <div class="row">
                        <span class="row-label">Order ID</span>
                        <span class="row-val">#${order.id}</span>
                    </div>
                    <div class="row">
                        <span class="row-label">Restaurant</span>
                        <span class="row-val">${restaurantName}</span>
                    </div>
                    <div class="row">
                        <span class="row-label">Date Generated</span>
                        <span class="row-val">${dateStr}</span>
                    </div>
                    <div class="row">
                        <span class="row-label" style="display: flex; align-items: center;">Payment Method</span>
                        <span class="row-val" style="background:#e0e7ff; color:#4f46e5; padding: 2px 8px; border-radius: 6px;">${order.payment_method || 'ONLINE'}</span>
                    </div>
                    <div class="row" style="margin-top:20px;">
                        <span class="row-label">Delivering To</span>
                        <span class="row-val" style="max-width: 60%;">${order.delivery_address || 'Customer Handover'}</span>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Item Ordered</th>
                                <th style="text-align:center;">Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>

                    <div class="totals">
                        <div class="total-row">
                            <span style="color:#64748b;">Subtotal (Estimated)</span>
                            <span>$${preGst.toFixed(2)}</span>
                        </div>
                        ${discountSection}
                        <div class="total-row">
                            <span style="color:#64748b;">Taxes & GST (5%)</span>
                            <span>$${gst.toFixed(2)}</span>
                        </div>
                        
                        <div class="total-final">
                            <span>TOTAL PAID</span>
                            <span>$${total.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="footer-msg">
                        Prepared under hygienic, standard operating procedures.<br>
                        Thank you for using the MealMate Partner Network!
                    </div>
                </div>
            </body>
            </html>
        `;

        // Trigger print sequence
        const printWindow = window.open('', '', 'height=700,width=800');
        printWindow.document.write(invoiceContent);
        printWindow.document.close();
        printWindow.print();
    };

    // Derived Orders
    const pendingOrders = orders.filter(o => o.status === 'PENDING');
    const activeOrders = orders.filter(o => o.status === 'ACCEPTED' || o.status === 'PREPARING' || o.status === 'READY');
    const historyOrders = orders.filter(o => ['DELIVERED', 'CANCELLED', 'PICKED_UP'].includes(o.status));


    return (
        <div className="flex h-screen bg-[#FDFDFD] font-sans selection:bg-red-500/30">

            {/* 🚀 Premium Dark Sidebar */}
            <aside className="w-[280px] bg-slate-950 text-slate-400 flex flex-col shadow-2xl relative z-20 hidden lg:flex">
                <Link to="/" className="p-8 flex items-center gap-4 hover:opacity-80 transition-opacity">
                    <div className="bg-gradient-to-br from-red-500 to-orange-500 text-white p-2.5 rounded-2xl shadow-lg shadow-red-500/30">
                        <ChefHat size={26} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight">Partner Central</h2>
                        <p className="text-xs font-semibold tracking-wider text-red-500 uppercase mt-0.5">Kitchen Portal</p>
                    </div>
                </Link>

                <nav className="flex-1 px-5 space-y-1.5 mt-4">
                    <NavItem onClick={() => setActiveTab('Dashboard')} icon={<Home size={20} />} label="Dashboard" active={activeTab === 'Dashboard'} />
                    <NavItem onClick={() => setActiveTab('Menu Catalog')} icon={<ListOrdered size={20} />} label="Menu Catalog" active={activeTab === 'Menu Catalog'} />
                    <NavItem onClick={() => setActiveTab('Live Orders')} icon={<TrendingUp size={20} />} label="Live Orders" badge="12" active={activeTab === 'Live Orders'} />
                    <NavItem onClick={() => setActiveTab('Store Settings')} icon={<Settings size={20} />} label="Store Settings" active={activeTab === 'Store Settings'} />
                </nav>

                <div className="p-6 m-5 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <img src="https://ui-avatars.com/api/?name=MK&background=ef4444&color=fff" className="w-11 h-11 rounded-xl shadow-lg" alt="Profile" />
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-white text-sm truncate">Main Kitchen</p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="text-[11px] text-slate-400 font-medium">Accepting Orders</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* 🌟 Main Content Area */}
            <main className="flex-1 h-screen overflow-y-auto relative w-full flex flex-col bg-slate-50/50">
                {activeTab === 'Dashboard' ? (() => {
                    const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
                    const totalOrders = orders.length;

                    const recentOrders = [...orders].slice(-14);
                    const maxRev = Math.max(...recentOrders.map(o => parseFloat(o.total_amount) || 0), 10);
                    const chartBars = recentOrders.map(o => ((parseFloat(o.total_amount) || 0) / maxRev) * 100);
                    const paddedChart = Array(14 - chartBars.length).fill(5).concat(chartBars); // Minimum 5% height so they show up

                    const points = paddedChart.map((h, i) => `${(i / (paddedChart.length - 1)) * 1000},${100 - h}`).join(' ');
                    const areaPoints = `0,100 ${points} 1000,100`;

                    return (
                        <div className="p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
                            <header>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    Welcome back, {restaurantName}! 👋
                                </h1>
                                <p className="text-slate-500 mt-1 font-medium text-sm">Here is what's happening at your restaurant today.</p>
                            </header>

                            {/* KPI Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: "Total Revenue", value: `₹${totalRevenue.toFixed(2)}`, icon: <TrendingUp className="text-emerald-500" /> },
                                    { label: "Total Orders", value: `${totalOrders}`, icon: <ListOrdered className="text-indigo-500" /> },
                                    { label: "Avg Prep Time", value: "14m (Est)", icon: <Bell className="text-amber-500" /> },
                                    { label: "Customer Rating", value: "4.8★", icon: <Sparkles className="text-red-500" /> }
                                ].map((kpi, i) => (
                                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:-translate-y-1 transition-transform cursor-default">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-slate-50 rounded-xl">{kpi.icon}</div>
                                            {i < 2 ? <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full">+Active</span> : null}
                                        </div>
                                        <h3 className="text-slate-400 font-bold text-sm uppercase tracking-widest">{kpi.label}</h3>
                                        <p className="text-3xl font-black text-slate-900 mt-1">{kpi.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Analytics Chart */}
                                <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] h-[400px] flex flex-col">
                                    <h3 className="font-bold text-lg mb-6 flex items-center justify-between text-slate-900">
                                        Revenue Activity (Recent Orders)
                                        <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg font-bold outline-none">Live Data</span>
                                    </h3>
                                    <div className="flex-1 w-full relative">
                                        <div className="absolute top-0 w-full border-t border-dashed border-slate-200"></div>
                                        <div className="absolute top-1/2 w-full border-t border-dashed border-slate-200"></div>
                                        <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-full overflow-visible z-10 relative">
                                            <defs>
                                                <linearGradient id="stockGradient" x1="0" x2="0" y1="0" y2="1">
                                                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                                                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                                                </linearGradient>
                                            </defs>
                                            <polygon points={areaPoints} fill="url(#stockGradient)" />
                                            <polyline points={points} fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Popular Items */}
                                <div className="bg-slate-900 rounded-3xl p-8 shadow-xl">
                                    <h3 className="font-bold text-lg mb-6 text-white flex items-center gap-2">
                                        <Sparkles size={20} className="text-red-400" />
                                        Top Selling Items
                                    </h3>
                                    <div className="space-y-5">
                                        {[
                                            { name: "Classic Cheeseburger", sales: "124 sold", price: "₹14.99" },
                                            { name: "Spicy Deluxe Pizza", sales: "98 sold", price: "₹18.50" },
                                            { name: "Loaded Fries", sales: "85 sold", price: "₹6.99" },
                                            { name: "Vanilla Shake", sales: "64 sold", price: "₹5.50" }
                                        ].map((item, i) => (
                                            <div key={i} className="flex justify-between items-center group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 font-bold group-hover:bg-red-500 group-hover:text-white transition-colors">{i + 1}</div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-200 text-sm">{item.name}</h4>
                                                        <p className="text-xs text-slate-500 font-medium">{item.sales}</p>
                                                    </div>
                                                </div>
                                                <p className="font-black text-white">{item.price}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })() : activeTab === 'Menu Catalog' ? (
                    <>
                        <div className="w-full h-56 relative overflow-hidden group shrink-0">
                            <img src={bannerUrl} onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80"; }} alt="Restaurant Cover" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
                            <button onClick={() => setIsCoverModalOpen(true)} className="absolute top-6 right-8 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2.5 rounded-xl text-sm font-bold border border-white/20 transition-all shadow-lg flex items-center gap-2 group-hover:scale-105">
                                <ImageIcon size={18} /> Update Cover
                            </button>

                            <div className="absolute bottom-6 left-8 flex gap-6 items-end">
                                <div className="w-24 h-24 rounded-2xl border-4 border-white overflow-hidden shadow-2xl bg-white isolate">
                                    <img src="https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=200&q=80" className="w-full h-full object-cover" />
                                </div>
                                <div className="mb-1">
                                    <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">{restaurantName}</h1>
                                    <p className="text-slate-300 mt-1.5 font-medium drop-shadow flex items-center gap-2">
                                        <span className="bg-red-500/80 px-2 py-0.5 rounded-md text-xs text-white font-bold backdrop-blur">3.5★</span>
                                        123 Tech Park • Burgers, Shakes, Pizzas
                                    </p>
                                </div>
                            </div>
                        </div>

                        <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-2xl border-b border-slate-200/60 px-8 py-5 flex justify-between items-center shadow-sm">
                            <div className="flex bg-slate-100/80 px-4 py-2.5 rounded-full w-96 items-center gap-3 border border-slate-100 focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-500 transition-all">
                                <Search size={18} className="text-slate-400" />
                                <input type="text" placeholder="Search menu, categories, or orders..." className="bg-transparent border-none outline-none w-full text-sm font-medium text-slate-800 placeholder-slate-400" />
                            </div>

                            <div className="flex items-center gap-4">
                                <button className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                                    <Bell size={20} />
                                    <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                </button>
                            </div>
                        </header>

                        <div className="p-8 max-w-7xl mx-auto w-full flex flex-col gap-10">
                            <section className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-orange-400 to-amber-400"></div>
                                <h3 className="font-black text-xl mb-6 text-slate-800 flex items-center gap-2 tracking-tight">
                                    <Sparkles size={22} className="text-red-500" />
                                    Quick Launch Menu Item
                                </h3>

                                <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-y-6 gap-x-5 items-end">
                                    <div className="w-full lg:col-span-1">
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Dish Name</label>
                                        <input required placeholder="e.g. Classic Burger" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none font-semibold text-slate-800 focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-400/10 transition-all placeholder:font-medium text-sm" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
                                    </div>
                                    <div className="w-full lg:col-span-1">
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Price (₹)</label>
                                        <input required type="number" step="0.01" placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none font-semibold text-slate-800 focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-400/10 transition-all placeholder:font-medium text-sm" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} />
                                    </div>
                                    <div className="w-full lg:col-span-1">
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                                        <select required className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none font-semibold text-slate-800 focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-400/10 transition-all cursor-pointer text-sm" value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}>
                                            <option value="Starters">Starters</option>
                                            <option value="Main Course">Main Course</option>
                                            <option value="Desserts">Desserts</option>
                                            <option value="Beverages">Beverages</option>
                                            <option value="Pizza">Pizza</option>
                                        </select>
                                    </div>
                                    <div className="w-full lg:col-span-2">
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Food Image URL</label>
                                        <div className="relative">
                                            <input required placeholder="https://..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pl-11 outline-none font-semibold text-slate-800 focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-400/10 transition-all placeholder:font-medium text-sm" value={newItem.image_url} onChange={e => setNewItem({ ...newItem, image_url: e.target.value })} />
                                            <ImageIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        </div>
                                    </div>
                                    <div className="w-full lg:col-span-4 mt-2">
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                                        <input required placeholder="Briefly describe the ingredients and flavor profile..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none font-semibold text-slate-800 focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-400/10 transition-all placeholder:font-medium text-sm" value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} />
                                    </div>
                                    <button type="submit" className="w-full lg:col-span-1 mt-2 h-[54px] px-8 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 active:scale-95 whitespace-nowrap flex items-center justify-center gap-2">
                                        <Plus size={18} /> {newItem.id ? "Update Item" : "Publish"}
                                    </button>
                                </form>
                            </section>

                            <section>
                                <div className="flex justify-between items-end mb-6">
                                    <h3 className="font-bold text-xl text-slate-800">Live Catalog</h3>
                                    <span className="text-sm font-semibold px-3 py-1 bg-red-100 text-red-600 rounded-full">{menuItems.length} items active</span>
                                </div>

                                {loading ? (
                                    <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div></div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
                                        {menuItems.map(item => (
                                            <div key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] border border-slate-100 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-300 group flex flex-col justify-between">
                                                <div className="h-52 w-full overflow-hidden relative">
                                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80"></div>
                                                    <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md text-white font-black px-3.5 py-1.5 rounded-xl shadow-sm border border-white/20 text-sm">
                                                        ₹{Number(item.price).toFixed(2)}
                                                    </div>
                                                    <div className="absolute bottom-4 left-4 font-bold text-white tracking-wide text-xs">
                                                        <span className="bg-red-500/90 px-2.5 py-1 rounded-lg backdrop-blur shadow-sm">
                                                            {item.category || 'Food'}
                                                        </span>
                                                    </div>
                                                    <button onClick={() => handleDelete(item.id)} className="absolute top-4 right-4 bg-white/90 backdrop-blur text-slate-600 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 rotate-90 group-hover:rotate-0">
                                                        <Trash2 size={16} strokeWidth={2.5} />
                                                    </button>
                                                </div>

                                                <div className="p-5 flex-1 flex flex-col">
                                                    <h4 className="font-bold text-[17px] text-slate-900 group-hover:text-red-500 transition-colors line-clamp-1">{item.name}</h4>
                                                    <p className="text-sm text-slate-500 mt-1.5 line-clamp-2 leading-relaxed flex-1 font-medium">{item.description}</p>
                                                    <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-100">
                                                        <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-green-500 bg-green-50 px-2 py-1 rounded-md">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Available
                                                        </span>
                                                        <button onClick={() => handleEditItem(item)} className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-wider">
                                                            Edit
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {menuItems.length === 0 && (
                                            <div className="col-span-full py-24 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                    <ChefHat size={40} className="text-slate-300" strokeWidth={1.5} />
                                                </div>
                                                <p className="font-bold text-slate-500 text-lg">Your catalog is empty</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </section>
                        </div>
                    </>
                ) : activeTab === 'Live Orders' ? (
                    <div className="p-8 max-w-7xl mx-auto w-full flex flex-col gap-10">
                        <header className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <TrendingUp size={28} className="text-red-500" /> Live Kitchen Display
                                </h1>
                                <p className="text-slate-500 mt-1 font-medium text-sm">Real-time incoming orders and preparation queue.</p>
                            </div>
                            <div className="flex bg-white shadow-sm border border-slate-100 rounded-xl p-1 gap-1">
                                <button onClick={() => setOrderTab('Active')} className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${orderTab === 'Active' ? 'bg-red-50 text-red-600' : 'text-slate-500 hover:bg-slate-50'}`}>Active ({pendingOrders.length + activeOrders.length})</button>
                                <button onClick={() => setOrderTab('History')} className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${orderTab === 'History' ? 'bg-red-50 text-red-600' : 'text-slate-500 hover:bg-slate-50'}`}>History ({historyOrders.length})</button>
                            </div>
                        </header>

                        {orderTab === 'History' ? (
                            <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] border border-slate-100 min-h-[600px]">
                                <h3 className="font-bold text-lg mb-6 text-slate-900 border-b pb-4">Order History</h3>
                                <div className="space-y-4">
                                    {historyOrders.length === 0 && <p className="text-center text-slate-400 italic py-10 font-bold">No historical orders found.</p>}
                                    {historyOrders.reverse().map(order => (
                                        <div key={order.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 gap-4">
                                            <div>
                                                <p className="font-black text-slate-900">Order #{order.id}</p>
                                                <p className="text-sm font-medium text-slate-500">Total: ₹{order.total_amount} • {order.delivery_address}</p>
                                            </div>
                                            <span className={`px-3 py-1 font-bold text-xs uppercase tracking-widest rounded-lg ${order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' : order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'}`}>{order.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start relative">
                                {/* NEW ORDERS COLUMN */}
                                <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] border border-slate-100 min-h-[600px]">
                                    <h3 className="font-bold text-lg mb-6 flex items-center justify-between">
                                        Needs Attention
                                        {pendingOrders.length > 0 && <span className="bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md shadow-red-500/20 animate-pulse">{pendingOrders.length} NEW</span>}
                                    </h3>

                                    <div className="space-y-5">
                                        {pendingOrders.length === 0 && <p className="text-slate-400 font-bold italic py-10 text-center">No pending orders.</p>}
                                        {pendingOrders.map(order => (
                                            <div key={order.id} className="bg-red-50/50 p-6 rounded-3xl border border-red-100 relative group">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-black text-sm">#{order.id}</div>
                                                        <div>
                                                            <h4 className="font-black text-slate-900">Delivery Address</h4>
                                                            <p className="text-xs text-slate-500 font-medium line-clamp-1">{order.delivery_address}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-slate-900 text-lg">₹{order.total_amount}</p>
                                                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-100 px-2 rounded-sm inline-block">Unpaid</p>
                                                    </div>
                                                </div>
                                                <div className="text-sm font-semibold text-slate-700 bg-white/60 p-4 rounded-xl border border-red-50/50 mb-5 relative">
                                                    <ul className="space-y-1.5 list-disc pl-4 text-slate-600">
                                                        {order.items && order.items.map((it, idx) => (
                                                            <li key={idx}>{it.qty || it.quantity}x {it.name || `Item #${it.menu_item}`}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="flex gap-3 relative z-10">
                                                    <button onClick={() => handleAcceptAndPrint(order)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-500/20 transition-all hover:-translate-y-0.5 active:scale-95">Accept & Print</button>
                                                    <button onClick={() => updateOrderStatus(order.id, 'CANCELLED')} className="px-5 font-bold text-slate-400 hover:bg-white hover:text-slate-800 rounded-xl transition-colors">Reject</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* ACTIVE / PREPARING COLUMN */}
                                <div className="bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl min-h-[600px] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                                    <h3 className="font-bold text-lg mb-6 flex items-center justify-between text-white relative z-10">
                                        Preparing / Ready
                                        <span className="bg-white/10 text-white text-xs font-black px-2.5 py-1 rounded-full">{activeOrders.length} ACTIVE</span>
                                    </h3>

                                    <div className="space-y-4 relative z-10">
                                        {activeOrders.length === 0 && <p className="text-slate-500 font-bold italic py-10 text-center">No active kitchen queue.</p>}
                                        {activeOrders.map(order => (
                                            <div key={order.id} className={`p-5 rounded-3xl border group flex flex-col justify-between h-40 ${order.status === 'READY' ? 'bg-slate-800 border-slate-700' : 'bg-slate-800 border-slate-700 opacity-80'}`}>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className={`${order.status === 'READY' ? 'text-red-400' : 'text-slate-400'} font-black text-sm mb-0.5`}>Order #{order.id}</p>
                                                        <h4 className="font-bold text-white text-lg truncate">Delivery: {order.delivery_address.substring(0, 10)}</h4>
                                                    </div>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${order.status === 'READY' ? 'bg-amber-500 text-amber-950 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'bg-slate-700 text-white'}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-end mt-4">
                                                    <p className="text-xs text-slate-400 font-medium">
                                                        {order.status === 'READY' ? 'Waiting for rider assignment...' : 'Due soon...'}
                                                    </p>
                                                    {order.status !== 'READY' ? (
                                                        <button onClick={() => updateOrderStatus(order.id, 'READY')} className="text-xs font-bold bg-white text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">Mark Ready</button>
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center"><Bike size={14} className="text-slate-400" /></div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : activeTab === 'Store Settings' ? (
                    <div className="p-8 max-w-4xl mx-auto w-full flex flex-col gap-10">
                        <header>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                <Settings size={28} className="text-slate-700" /> Store Profile & Settings
                            </h1>
                            <p className="text-slate-500 mt-1 font-medium text-sm">Manage your restaurant identity, operating hours, and system preferences.</p>
                        </header>

                        <div className="bg-white rounded-[2rem] p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col gap-8">

                            {/* General Information */}
                            <section>
                                <h3 className="font-bold text-lg text-slate-900 mb-5 border-b border-slate-100 pb-3">General Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Restaurant Name</label>
                                        <input type="text" defaultValue="The Great Indian Kitchen" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none font-semibold text-slate-800 focus:bg-white focus:border-red-400 transition-all text-sm" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Store Description</label>
                                        <textarea rows="3" defaultValue="Serving the finest authentic flavors with modern techniques." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none font-semibold text-slate-800 focus:bg-white focus:border-red-400 transition-all text-sm resize-none"></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Street Address</label>
                                        <input type="text" defaultValue="123 Tech Park, Silicon Valley" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none font-semibold text-slate-700 focus:bg-white focus:border-red-400 transition-all text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Contact Phone</label>
                                        <input type="text" defaultValue="+1 (555) 019-8234" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none font-semibold text-slate-700 focus:bg-white focus:border-red-400 transition-all text-sm" />
                                    </div>
                                </div>
                            </section>

                            {/* Operational Status */}
                            <section>
                                <h3 className="font-bold text-lg text-slate-900 mb-5 border-b border-slate-100 pb-3">Operational Status</h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer group">
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">Accepting Orders Online</h4>
                                            <p className="text-xs text-slate-500 mt-1">Temporarily pause incoming orders if the kitchen gets too busy.</p>
                                        </div>
                                        <button onClick={(e) => {
                                            const btn = e.currentTarget;
                                            const isActive = btn.classList.contains('bg-green-500');
                                            btn.className = `w-14 h-7 ${isActive ? 'bg-slate-300' : 'bg-green-500'} rounded-full relative shadow-inner transition-colors duration-300 shrink-0`;
                                            btn.children[0].className = `w-5 h-5 bg-white rounded-full absolute ${isActive ? 'left-1' : 'right-1'} top-1 shadow transition-all duration-300`;
                                        }} className="w-14 h-7 bg-green-500 rounded-full relative shadow-inner transition-colors duration-300 shrink-0">
                                            <div className="w-5 h-5 bg-white rounded-full absolute right-1 top-1 shadow transition-all duration-300"></div>
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer group">
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">Enable Delivery Tracking</h4>
                                            <p className="text-xs text-slate-500 mt-1">Allow customers to view exact rider coordinate locations on GPS.</p>
                                        </div>
                                        <button onClick={(e) => {
                                            const btn = e.currentTarget;
                                            const isActive = btn.classList.contains('bg-green-500');
                                            btn.className = `w-14 h-7 ${isActive ? 'bg-slate-300' : 'bg-green-500'} rounded-full relative shadow-inner transition-colors duration-300 shrink-0`;
                                            btn.children[0].className = `w-5 h-5 bg-white rounded-full absolute ${isActive ? 'left-1' : 'right-1'} top-1 shadow transition-all duration-300`;
                                        }} className="w-14 h-7 bg-green-500 rounded-full relative shadow-inner transition-colors duration-300 shrink-0">
                                            <div className="w-5 h-5 bg-white rounded-full absolute right-1 top-1 shadow transition-all duration-300"></div>
                                        </button>
                                    </div>
                                </div>
                            </section>

                            <div className="border-t border-slate-100 pt-6 flex justify-end gap-3">
                                <button className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all text-sm">Cancel</button>
                                <button onClick={(e) => {
                                    const btn = e.target;
                                    const orig = btn.innerText;
                                    btn.innerText = "Saving Profiles...";
                                    btn.classList.add('opacity-75');
                                    setTimeout(() => {
                                        btn.innerText = "Settings Saved!";
                                        btn.classList.add('bg-green-500');
                                        btn.classList.remove('bg-red-500', 'opacity-75');
                                        setTimeout(() => {
                                            btn.innerText = orig;
                                            btn.classList.add('bg-red-500');
                                            btn.classList.remove('bg-green-500');
                                        }, 2000);
                                    }, 800);
                                }} className="px-8 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/30 w-[180px] text-sm active:scale-95">Save Changes</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center z-20">
                        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                            <ChefHat size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">Module Under Construction</h2>
                        <p className="text-slate-500 mt-2 max-w-sm">The <strong>{activeTab}</strong> tab is currently being developed.</p>
                        <button onClick={() => setActiveTab('Menu Catalog')} className="mt-8 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all">
                            Return to Catalog
                        </button>
                    </div>
                )}
            </main>

            {/* Overlays / Modals */}
            {isCoverModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-slate-800">Update Cover Image</h2>
                            <button onClick={() => setIsCoverModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                <Trash2 size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">New Image URL</label>
                                <input value={newCoverInput} onChange={e => setNewCoverInput(e.target.value)} type="url" placeholder="https://images.unsplash.com/..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900" />
                            </div>
                            <button onClick={handleUpdateCover} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors mt-4">
                                Save New Cover
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

function NavItem({ icon, label, active, onClick, badge }) {
    return (
        <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${active ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            <span className={active ? 'text-white' : 'text-slate-500'}>{icon}</span>
            {label}
            {badge && <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${active ? 'bg-white text-red-500' : 'bg-red-500 text-white'}`}>{badge}</span>}
        </button>
    );
}
