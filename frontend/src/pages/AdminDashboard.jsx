import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Store, Users, Bike, Wallet, Settings,
    Search, Bell, ArrowUpRight, ArrowDownRight, MoreVertical,
    Activity, ShieldCheck, Map as MapIcon, DollarSign, ArrowDownToLine, Building, FileText,
    Globe, Star, Eye, Navigation2, Phone, Mail, Clock, Plus, SlidersHorizontal, Shield, Lock, Power, X, Edit2, Trash2, Pause, ShoppingBag, UserMinus, CheckCircle
} from 'lucide-react';

const NavItem = ({ icon, label, active, onClick, badge }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-slate-900 hover:text-slate-200'}`}
    >
        {icon}
        <span className="font-bold text-sm">{label}</span>
        {badge && <span className="ml-auto text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black">{badge}</span>}
    </button>
);

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Overview');

    const [kpiMetrics, setKpiMetrics] = useState({
        total_revenue: "₹0.00", active_orders: 0, restaurant_count: 0, fleet_count: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [fleet, setFleet] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [unassignedOrders, setUnassignedOrders] = useState([]);
    const [pendingPartners, setPendingPartners] = useState([]);
    const [foodItems, setFoodItems] = useState([]);
    const [editingFoodItemId, setEditingFoodItemId] = useState(null);
    const [editingPrice, setEditingPrice] = useState("");
    const [allOrders, setAllOrders] = useState([]);

    const [manageModalOpen, setManageModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [orderModalOpen, setOrderModalOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchAdminData = async () => {
        try {
            const res = await axios.get((import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api/admin/dashboard/');
            setKpiMetrics(res.data.kpis);
            setRecentOrders(res.data.recent_orders || []);
            setFleet(res.data.fleet || []);
            setCustomers(res.data.customers || []);
            setRestaurants(res.data.restaurants || []);
            setUnassignedOrders(res.data.unassigned_orders || []);
            setPendingPartners(res.data.pending_partners || []);
            setFoodItems(res.data.food_items || []);
            setAllOrders(res.data.all_orders || []);
        } catch (error) {
            console.error("Failed to load admin data backend", error);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    const handleProcessPartner = async (partnerId, action) => {
        try {
            await axios.post((import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api/admin/process_partner/', { partner_id: partnerId, action });
            fetchAdminData(); // Refresh list after action
        } catch (error) {
            console.error("Failed to process partner", error);
        }
    };

    const handleManageAction = async (action) => {
        try {
            await axios.post((import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api/admin/manage_restaurant/', {
                restaurant_id: selectedRestaurant.id, action
            });
            setManageModalOpen(false);
            fetchAdminData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateUserRole = async (userId, role) => {
        try {
            await axios.post((import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api/admin/manage_user/', {
                user_id: userId, role
            });
            fetchAdminData();
        } catch (err) {
            console.error(err);
            alert("Failed to update user role");
        }
    };

    const handleManageFoodItem = async (itemId, action, payload = null) => {
        if (action === 'delete' && !window.confirm("Are you sure you want to delete this menu item?")) return;

        let updateData = { item_id: itemId };

        if (action === 'save') {
            updateData.action = 'edit';
            const newPrice = parseFloat(payload);
            if (!newPrice || isNaN(newPrice)) { alert("Invalid price"); return; }
            updateData.price = newPrice;
        } else {
            updateData.action = action;
        }

        try {
            await axios.post((import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api/admin/manage_food_item/', updateData);
            if (action === 'save') setEditingFoodItemId(null);
            fetchAdminData();
        } catch (err) {
            console.error(err);
            alert("Failed to manage food item");
        }
    };

    const handleDispatch = async (orderId, driverId) => {
        if (!driverId) return;
        try {
            await axios.post((import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api/admin/dispatch/', {
                order_id: orderId,
                driver_id: driverId
            });
            fetchAdminData();
        } catch (err) {
            console.error('Dispatch failed', err);
            alert('Failed to dispatch order.');
        }
    };

    const handleUpdateOrderStatus = async (orderId, status) => {
        try {
            await axios.post((import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api/admin/dispatch/', {
                order_id: orderId,
                status: status
            });
            fetchAdminData();
        } catch (err) {
            console.error('Failed to update status', err);
            alert('Failed to update order status');
        }
    };

    const handleDeleteAgent = async (agentId) => {
        try {
            await axios.post((import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api/admin/manage_driver/', {
                action: 'delete',
                driver_id: agentId
            });
            fetchAdminData();
        } catch (err) {
            console.error('Failed to delete agent', err);
            alert('Failed to delete agent');
        }
    };

    // Simulated Analytics Data combining DB counts with static UI aspects
    const kpis = [
        { title: "Total Revenue", value: kpiMetrics.total_revenue, trend: "+12.5%", isPositive: true, icon: <Wallet size={20} />, color: "bg-emerald-500" },
        { title: "Active Orders", value: kpiMetrics.active_orders, trend: "+5.2%", isPositive: true, icon: <Activity size={20} />, color: "bg-blue-500" },
        { title: "Partner Restaurants", value: kpiMetrics.restaurant_count, trend: "-1.2%", isPositive: false, icon: <Store size={20} />, color: "bg-indigo-500" },
        { title: "Delivery Fleet", value: kpiMetrics.fleet_count, trend: "+18.4%", isPositive: true, icon: <Bike size={20} />, color: "bg-orange-500" }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
            case 'In Transit': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Preparing': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const chartBars = [40, 70, 45, 90, 65, 85, 120, 100, 75, 40, 55, 80];

    const handleExportCSV = () => {
        const headers = ["Order ID", "Restaurant", "Customer", "Amount", "Status", "Agent"];
        const rows = allOrders.map(o => [
            o.id,
            `"${o.restaurant}"`,
            `"${o.customer}"`,
            `"${o.amount}"`,
            o.status,
            `"${o.agent}"`
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "mealmate_all_orders_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadReport = () => {
        const headers = ["Txn ID", "Recipient", "Amount", "Status", "Date"];
        const rows = [
            ["SET-9842", "Pizza Paradise", "₹1,450.00", "COMPLETED", "Today, 14:30"],
            ["SET-9841", "Burger Bliss", "₹980.50", "PROCESSING", "Today, 11:15"],
            ["SET-9840", "Sushi Express", "₹2,105.25", "COMPLETED", "Yesterday, 18:45"],
            ["SET-9839", "Taco Truck", "₹435.00", "COMPLETED", "Yesterday, 09:20"]
        ];

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "mealmate_recent_settlements.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportTransactionsCSV = () => {
        const headers = ["Order ID", "Date & Time", "Restaurant / Customer", "Amount", "Status"];
        const rows = recentOrders.map(o => [
            o.id,
            `"${o.time}"`,
            `"${o.restaurant} / ${o.customer}"`,
            `"${o.amount}"`,
            o.status
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "mealmate_recent_transactions.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-500/30 overflow-hidden text-slate-800">

            {/* 🚀 Super Admin Sidebar */}
            <aside className="w-[280px] bg-slate-950 text-slate-400 flex flex-col shadow-2xl relative z-20 flex-shrink-0 hidden lg:flex">
                {/* Glow effect */}
                <div className="absolute top-0 left-0 w-full h-64 bg-indigo-500/10 blur-[80px] pointer-events-none"></div>

                <Link to="/" className="p-8 flex items-center gap-3 relative z-10 hover:opacity-80 transition-opacity">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-500/30">
                        <ShieldCheck size={26} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight">MealMate</h2>
                        <p className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase mt-0.5">Control Center</p>
                    </div>
                </Link>

                <nav className="flex-1 px-5 space-y-2 mt-4 relative z-10">
                    <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')} />
                    <NavItem icon={<Store size={20} />} label="Restaurants" active={activeTab === 'Restaurants'} onClick={() => setActiveTab('Restaurants')} />
                    <NavItem icon={<Users size={20} />} label="Customers" active={activeTab === 'Customers'} onClick={() => setActiveTab('Customers')} />
                    <NavItem icon={<Activity size={20} />} label="Food Items" active={activeTab === 'Food Items'} onClick={() => setActiveTab('Food Items')} />
                    <NavItem icon={<FileText size={20} />} label="All Orders" active={activeTab === 'All Orders'} onClick={() => setActiveTab('All Orders')} />
                    <NavItem icon={<Bike size={20} />} label="Delivery Agents" active={activeTab === 'Delivery Agents'} onClick={() => setActiveTab('Delivery Agents')} />

                    <div className="pt-6 mt-6 border-t border-slate-800/50">
                        <NavItem icon={<Settings size={20} />} label="System Settings" active={activeTab === 'System Settings'} onClick={() => setActiveTab('System Settings')} />
                    </div>
                </nav>

                <div className="p-6 m-5 bg-slate-900/50 rounded-2xl border border-slate-800 backdrop-blur-xl relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff" className="w-10 h-10 rounded-lg shadow-lg" alt="Profile" />
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-200 text-sm truncate">Super Admin</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                <p className="text-[11px] text-slate-400 font-medium truncate">All Systems Operational</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => {
                        localStorage.removeItem('user');
                        localStorage.removeItem('token');
                        window.location.href = '/';
                    }} className="ml-2 w-8 h-8 rounded-full flex items-center justify-center bg-slate-800 hover:bg-red-500 text-slate-400 hover:text-white transition-colors shrink-0">
                        <Power size={14} />
                    </button>
                </div>
            </aside>

            {/* 🌟 Main Content Area */}
            <main className="flex-1 h-screen overflow-y-auto relative w-full flex flex-col">

                {/* Header */}
                <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-2xl border-b border-slate-200/60 px-8 py-4 flex justify-between items-center shadow-sm">
                    <div className="flex bg-slate-100 px-4 py-2.5 rounded-xl w-96 items-center gap-3 border border-transparent focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all shadow-inner">
                        <Search size={18} className="text-slate-400" />
                        <input type="text" placeholder="Search orders, restaurants, or users (Press '/')" className="bg-transparent border-none outline-none w-full text-sm font-medium text-slate-800 placeholder-slate-400" />
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <div className="h-8 w-px bg-slate-200 mx-2"></div>
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-slate-900">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} Local</p>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto w-full flex flex-col gap-8 pb-20">

                    {activeTab === 'Overview' ? (
                        <>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Overview</h1>
                                <p className="text-slate-500 mt-1 font-medium">Real-time metrics and system health across the MealMate network.</p>
                            </div>

                            {/* 📊 KPI Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {kpis.map((kpi, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 relative overflow-hidden group">
                                        <div className={`absolute top-0 left-0 w-full h-1 ${kpi.color} opacity-80`}></div>

                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-3 rounded-xl ${kpi.color} bg-opacity-10 text-${kpi.color.replace('bg-', '')}`}>
                                                <div className="text-slate-700"> {kpi.icon} </div>
                                            </div>
                                            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${kpi.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                {kpi.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                {kpi.trend}
                                            </span>
                                        </div>

                                        <h3 className="text-slate-500 font-bold text-sm tracking-wide">{kpi.title}</h3>
                                        <h2 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{kpi.value}</h2>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                                {/* 📈 Big Chart Area */}
                                <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] flex flex-col">
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Revenue Dynamics</h3>
                                            <p className="text-sm text-slate-500 font-medium">Gross volume across all zip codes</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button onClick={handleExportCSV} className="flex items-center gap-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                                                <ArrowDownToLine size={16} strokeWidth={2.5} />
                                                <span>Export CSV</span>
                                            </button>
                                            <select className="bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 px-4 py-2 rounded-xl outline-none">
                                                <option>Last 12 Months</option>
                                                <option>Last 30 Days</option>
                                                <option>Past Week</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex w-full h-64 mt-auto border-b border-slate-100 pb-4 relative">
                                        <div className="absolute top-0 w-full border-t border-dashed border-slate-200/60 z-0"></div>
                                        <div className="absolute top-1/2 w-full border-t border-dashed border-slate-200/60 z-0"></div>

                                        {(() => {
                                            const maxChartHeight = Math.max(...chartBars, 120);
                                            const points = chartBars.map((val, i) => `${(i / (chartBars.length - 1)) * 1000},${100 - ((val / maxChartHeight) * 100)}`).join(' ');
                                            const areaPoints = `0,100 ${points} 1000,100`;

                                            return (
                                                <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-full overflow-visible z-10 relative">
                                                    <defs>
                                                        <linearGradient id="adminGradient" x1="0" x2="0" y1="0" y2="1">
                                                            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4" />
                                                            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                                                        </linearGradient>
                                                    </defs>
                                                    <polygon points={areaPoints} fill="url(#adminGradient)" />
                                                    <polyline points={points} fill="none" stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            );
                                        })()}
                                    </div>
                                    <div className="flex justify-between mt-4 text-xs font-bold text-slate-400 px-2 lg:px-4">
                                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                                        <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                                    </div>
                                </div>

                                {/* 🔥 Live Feed Panel */}
                                <div className="bg-slate-950 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden flex flex-col">
                                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 blur-[50px] rounded-full"></div>

                                    <div className="flex justify-between items-center mb-6 relative z-10">
                                        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                            Live Feed <span className="relative flex h-2.5 w-2.5 ml-1"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span></span>
                                        </h3>
                                        <button className="text-slate-400 hover:text-white transition-colors"><MoreVertical size={20} /></button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar relative z-10">
                                        {recentOrders.slice(0, 4).map((order, i) => (
                                            <div key={i} className="flex gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                                                    <Bike size={16} className="text-indigo-400" />
                                                </div>
                                                <div className="flex-1 border-b border-slate-800 pb-5">
                                                    <div className="flex justify-between items-start">
                                                        <p className="font-bold text-white text-sm">{order.restaurant}</p>
                                                        <p className="font-black text-emerald-400 text-sm">{order.amount}</p>
                                                    </div>
                                                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{order.customer} • {order.id}</p>
                                                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-2">{order.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => setActiveTab('All Orders')} className="mt-4 w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-colors border border-white/10 relative z-10">
                                        View All Operations
                                    </button>
                                </div>
                            </div>

                            {/* 📋 Data Table */}
                            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] overflow-hidden mt-2">
                                <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Recent Transactions</h3>
                                        <p className="text-sm text-slate-500 font-medium mt-1">Monitor the latest financial and logistical events.</p>
                                    </div>
                                    <button onClick={handleExportTransactionsCSV} className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
                                        Export CSV
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/50">
                                                <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Order ID</th>
                                                <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Date & Time</th>
                                                <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Restaurant / Customer</th>
                                                <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Amount</th>
                                                <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm font-medium divide-y divide-slate-100">
                                            {recentOrders.map((order, i) => (
                                                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-8 py-5">
                                                        <span className="font-bold text-indigo-600 group-hover:text-indigo-700 cursor-pointer">{order.id}</span>
                                                    </td>
                                                    <td className="px-8 py-5 text-slate-500 whitespace-nowrap">Aug 4, 2026<br /><span className="text-xs">{order.time}</span></td>
                                                    <td className="px-8 py-5">
                                                        <p className="font-bold text-slate-900">{order.restaurant}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5">{order.customer}</p>
                                                    </td>
                                                    <td className="px-8 py-5 font-black text-slate-900">{order.amount}</td>
                                                    <td className="px-8 py-5">
                                                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getStatusColor(order.status)}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : activeTab === 'Financials' ? (
                        <>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Hub</h1>
                                <p className="text-slate-500 mt-1 font-medium">Manage payouts, platform revenue, and settlements.</p>
                            </div>

                            {/* 📊 Financial KPI Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { title: "Gross Volume (30d)", value: "₹1,24,500.00", trend: "+14.2%", isPositive: true, icon: <DollarSign size={20} />, color: "bg-indigo-500" },
                                    { title: "Platform Revenue", value: "₹22,410.00", trend: "+11.5%", isPositive: true, icon: <Wallet size={20} />, color: "bg-emerald-500" },
                                    { title: "Restaurant Payouts", value: "₹85,250.00", trend: "+15.1%", isPositive: true, icon: <Building size={20} />, color: "bg-orange-500" },
                                    { title: "Fleet Earnings", value: "₹16,840.00", trend: "+8.4%", isPositive: true, icon: <Bike size={20} />, color: "bg-blue-500" }
                                ].map((kpi, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 relative overflow-hidden group">
                                        <div className={`absolute top-0 left-0 w-full h-1 ${kpi.color} opacity-80`}></div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-3 rounded-xl ${kpi.color} bg-opacity-10 text-${kpi.color.replace('bg-', '')}`}>
                                                <div className="text-slate-700"> {kpi.icon} </div>
                                            </div>
                                            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${kpi.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                {kpi.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                {kpi.trend}
                                            </span>
                                        </div>
                                        <h3 className="text-slate-500 font-bold text-sm tracking-wide">{kpi.title}</h3>
                                        <h2 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{kpi.value}</h2>
                                    </div>
                                ))}
                            </div>

                            {/* Two Column Layout for Financials */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                                {/* 🏦 Pending Settlements */}
                                <div className="bg-indigo-950 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none"></div>
                                    <div className="relative z-10">
                                        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                            Pending Settlements
                                        </h3>
                                        <p className="text-sm text-indigo-200 mt-1">Total amount waiting to be disbursed.</p>
                                        <h1 className="text-5xl font-black text-white mt-6 drop-shadow-md">₹4,250.75</h1>
                                        <div className="mt-8 space-y-4">
                                            <div className="flex justify-between text-sm font-medium text-indigo-100 border-b border-indigo-800/50 pb-4">
                                                <span className="flex items-center gap-2"><Building size={16} className="text-orange-400" /> Restaurants</span>
                                                <span className="font-bold whitespace-nowrap">₹3,840.50</span>
                                            </div>
                                            <div className="flex justify-between text-sm font-medium text-indigo-100 border-b border-indigo-800/50 pb-4">
                                                <span className="flex items-center gap-2"><Bike size={16} className="text-blue-400" /> Delivery Fleet</span>
                                                <span className="font-bold whitespace-nowrap">₹410.25</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="mt-8 w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-indigo-500/30 relative z-10 flex items-center justify-center gap-2">
                                        <ArrowDownToLine size={18} /> Process All Payouts
                                    </button>
                                </div>

                                {/* 📋 Recent Settlements Table */}
                                <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
                                    <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-white z-10 relative">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Settlement History</h3>
                                            <p className="text-sm text-slate-500 font-medium mt-1">Latest processed payments to partners.</p>
                                        </div>
                                        <button onClick={handleDownloadReport} className="bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 font-bold px-4 py-2 rounded-xl transition-colors text-sm flex items-center gap-2">
                                            <FileText size={16} /> Download Report
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-x-auto min-h-[300px]">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50/50">
                                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Txn ID</th>
                                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Recipient</th>
                                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Amount</th>
                                                    <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm font-medium divide-y divide-slate-100">
                                                {[
                                                    { id: "TXN-8891", entity: "The Great Indian Kitchen", type: "Restaurant", amount: "₹3,450.00", status: "Completed", date: "Aug 4, 2026" },
                                                    { id: "TXN-8892", entity: "Alex Rider", type: "Delivery", amount: "₹145.50", status: "Processing", date: "Aug 4, 2026" },
                                                    { id: "TXN-8893", entity: "Pizza Heaven", type: "Restaurant", amount: "₹5,120.00", status: "Completed", date: "Aug 3, 2026" },
                                                    { id: "TXN-8894", entity: "Sarah Jenkins", type: "Delivery", amount: "₹210.00", status: "Failed", date: "Aug 3, 2026" },
                                                ].map((item, i) => (
                                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="px-8 py-4">
                                                            <span className="font-bold text-slate-600">{item.id}</span>
                                                            <p className="text-[10px] text-slate-400 mt-1">{item.date}</p>
                                                        </td>
                                                        <td className="px-8 py-4">
                                                            <p className="font-bold text-slate-900">{item.entity}</p>
                                                            <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${item.type === 'Restaurant' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                                                {item.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-4 font-black text-slate-900">{item.amount}</td>
                                                        <td className="px-8 py-4">
                                                            <span className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 w-fit ${item.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                                                                item.status === 'Processing' ? 'bg-amber-50 text-amber-600' :
                                                                    'bg-red-50 text-red-600'
                                                                }`}>
                                                                {item.status === 'Processing' && <Activity size={12} className="animate-spin" />}
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : activeTab === 'Live Map' ? (
                        <div className="flex-1 bg-slate-200 rounded-[2rem] overflow-hidden relative shadow-2xl border border-slate-100 min-h-[500px]">
                            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&q=80" className="w-full h-full object-cover" alt="Map View" />
                            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4">
                                <MapIcon size={24} className="text-indigo-600" />
                                <div>
                                    <h3 className="font-bold text-slate-900">Live Tracking Active</h3>
                                    <p className="text-xs text-slate-500">Monitoring 43 riders globally</p>
                                </div>
                            </div>
                            <div className="absolute top-1/2 left-1/3 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)] border-2 border-white animate-pulse"></div>
                            <div className="absolute top-1/3 left-1/2 w-4 h-4 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.8)] border-2 border-white animate-bounce"></div>
                            <div className="absolute bottom-1/3 right-1/4 w-4 h-4 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.8)] border-2 border-white animate-ping"></div>
                        </div>
                    ) : activeTab === 'Delivery Agents' ? (
                        <>
                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <Bike size={32} /> Delivery Agents
                                </h1>
                                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm border border-emerald-200/50">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                    {fleet.filter(f => f.status === 'Available').length} Available
                                </span>
                                <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm border border-red-200/50">
                                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                                    {fleet.filter(f => f.status !== 'Available').length} Busy
                                </span>
                            </div>

                            <div className="bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden mb-8">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-100/80">
                                            <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest p-4 pl-6 w-16">ID</th>
                                            <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest p-4">Agent Name</th>
                                            <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest p-4">Contact</th>
                                            <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest p-4 text-center">Current Status</th>
                                            <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest p-4 text-center">Active Order</th>
                                            <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest p-4 text-center">Joined On</th>
                                            <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest p-4 pr-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {fleet.map((driver, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="p-4 pl-6">
                                                    <span className="font-bold text-slate-400 text-xs">#{driver.id.substring(driver.id.length - 2)}</span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">{driver.name[0]}</div>
                                                        <span className="font-bold text-slate-800 text-sm">{driver.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-xs text-slate-600 flex flex-col gap-1">
                                                        <span className="flex items-center gap-1.5"><Mail size={10} className="text-slate-400" /> {driver.name.toLowerCase().split(' ')[0]}.agent@foodexpress.com</span>
                                                        <span className="flex items-center gap-1.5"><Phone size={10} className="text-slate-400" /> 9876543210</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${driver.status === 'Available' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${driver.status === 'Available' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                                        {driver.status === 'Available' ? 'Available' : 'On Delivery'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    {driver.status !== 'Available' ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-1 rounded-md">
                                                            <Activity size={10} /> Order #{Math.floor(Math.random() * 20) + 1}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 font-medium">-</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="text-xs text-slate-500 font-medium">18 Feb 2026</span>
                                                </td>
                                                <td className="p-4 pr-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => { setSelectedDriver(driver); setHistoryModalOpen(true); }}
                                                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors border border-blue-100"
                                                            title="History"
                                                        >
                                                            <Clock size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteAgent(driver.id)}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors border border-red-100"
                                                            title="Suspend"
                                                        >
                                                            <UserMinus size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {fleet.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="p-8 text-center text-slate-400">No delivery agents found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-inner">
                                        <CheckCircle size={28} strokeWidth={2.5} />
                                    </div>
                                    <h2 className="text-4xl font-black text-slate-900 mb-2 truncate">0</h2>
                                    <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">Total Successful Deliveries</p>
                                </div>
                                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 mb-4 shadow-inner">
                                        <Clock size={28} strokeWidth={2.5} />
                                    </div>
                                    <h2 className="text-4xl font-black text-slate-900 mb-2 truncate">{unassignedOrders.length}</h2>
                                    <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">Pending Shipments</p>
                                </div>
                            </div>
                        </>
                    ) : activeTab === 'Customers' ? (
                        <>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customer Database</h1>
                                <p className="text-slate-500 mt-1 font-medium">Manage user accounts and view engagement.</p>
                            </div>
                            {/* Table Filter Bar */}
                            <div className="bg-white p-4 rounded-t-2xl border-b border-slate-200 border border-slate-100 flex flex-wrap gap-4 items-center">
                                <div className="flex-1 min-w-[200px] relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input type="text" placeholder="Search by name or email..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none focus:border-indigo-500" />
                                </div>
                                <select className="border border-slate-200 rounded-lg text-sm px-4 py-2 bg-slate-50 text-slate-600 outline-none w-40">
                                    <option>All Roles</option>
                                    <option>Customer</option>
                                    <option>Owner</option>
                                </select>
                                <button className="bg-[#ef4444] text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm shadow-red-500/20">Filter</button>
                                <button className="bg-slate-100 text-slate-600 px-6 py-2 rounded-lg text-sm font-bold">Clear</button>
                            </div>

                            <div className="bg-white border-x border-b border-slate-100 rounded-b-2xl shadow-sm overflow-hidden overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[1000px]">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-500 font-black">
                                            <th className="p-4 pl-6 w-16">ID</th>
                                            <th className="p-4">User Details</th>
                                            <th className="p-4">Contact</th>
                                            <th className="p-4">Roles</th>
                                            <th className="p-4">Orders</th>
                                            <th className="p-4">LTV</th>
                                            <th className="p-4 pr-6 text-right">Permissions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {customers.map((user, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="p-4 pl-6 text-slate-400 font-bold text-sm">#{i + 1}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black text-sm">{user.name.charAt(0).toUpperCase()}</div>
                                                        <h4 className="font-bold text-slate-800">{user.name}</h4>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-xs text-slate-500 flex flex-col gap-1">
                                                        <span className="flex items-center gap-1"><Mail size={12} /> {user.email}</span>
                                                        <span className="flex items-center gap-1"><Phone size={12} /> {user.phone || '+1 555-0100'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md uppercase tracking-wider">{user.role}</span>
                                                </td>
                                                <td className="p-4 font-black text-slate-800">{user.orders}</td>
                                                <td className="p-4 font-bold text-emerald-600">{user.ltv}</td>
                                                <td className="p-4 pr-6 text-right space-x-2">
                                                    <button onClick={() => handleUpdateUserRole(user.id, 'ADMIN')} className="text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 border border-red-200 text-red-500 rounded-md hover:bg-red-50">Admin</button>
                                                    <button onClick={() => handleUpdateUserRole(user.id, 'DELIVERY')} className="text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 border border-blue-200 text-blue-500 rounded-md hover:bg-blue-50">Delivery</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : activeTab === 'Restaurants' ? (
                        <>
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Partner Restaurants</h1>
                                    <p className="text-slate-500 mt-1 font-medium">Manage restaurant listings, menu approvals, and onboard requests.</p>
                                </div>
                                <button className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 text-sm hover:-translate-y-0.5 transition-transform">
                                    <Plus size={18} /> Add Partner Directly
                                </button>
                            </div>

                            {/* Pending Approvals */}
                            {pendingPartners.length > 0 && (
                                <div className="mb-10 bg-orange-50 border border-orange-100 rounded-[2rem] p-6 lg:p-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[60px] rounded-full pointer-events-none"></div>
                                    <h3 className="text-xl font-bold text-orange-900 tracking-tight flex items-center gap-2 mb-6">
                                        Pending Partner Requests <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-md font-black shadow-sm">{pendingPartners.length} NEW</span>
                                    </h3>
                                    <div className="space-y-4 relative z-10 w-full max-w-4xl">
                                        {pendingPartners.map((req) => (
                                            <div key={req.id} className="bg-white p-5 rounded-2xl border border-orange-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex flex-shrink-0 items-center justify-center font-black text-orange-600 text-xl">{(req.name || "U").charAt(0)}</div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 text-lg">{req.name}</h4>
                                                        <p className="text-xs text-slate-500 font-medium">📍 {req.location} • 🍽️ {req.type} • ⏳ {req.time}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 w-full sm:w-auto">
                                                    <button onClick={() => handleProcessPartner(req.id, 'accept')} className="flex-1 sm:flex-none px-6 py-2 bg-emerald-500 hover:bg-emerald-600 outline-none text-white font-bold rounded-xl text-sm transition-colors shadow-sm shadow-emerald-500/30">Accept</button>
                                                    <button onClick={() => handleProcessPartner(req.id, 'reject')} className="flex-1 sm:flex-none px-6 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold outline-none rounded-xl text-sm transition-colors border border-slate-200 hover:border-red-200">Reject</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-6 mt-8">Active Partners</h3>

                            {/* Table Filter Bar Mockup */}
                            <div className="bg-white p-4 rounded-t-2xl border-b border-slate-200 border border-slate-100 flex flex-wrap gap-4 items-center">
                                <div className="flex-1 min-w-[200px] relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input type="text" placeholder="Search name or cuisine..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none focus:border-indigo-500" />
                                </div>
                                <select className="border border-slate-200 rounded-lg text-sm px-4 py-2 bg-slate-50 text-slate-600 outline-none w-40">
                                    <option>All Cuisines</option>
                                    <option>Street Food</option>
                                    <option>Mughlai</option>
                                </select>
                                <select className="border border-slate-200 rounded-lg text-sm px-4 py-2 bg-slate-50 text-slate-600 outline-none w-40">
                                    <option>All Statuses</option>
                                    <option>Active</option>
                                    <option>Inactive</option>
                                </select>
                                <button className="bg-[#ef4444] text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm shadow-red-500/20">Filter</button>
                                <button className="bg-slate-100 text-slate-600 px-6 py-2 rounded-lg text-sm font-bold">Clear</button>
                            </div>

                            {/* Restaurants Table */}
                            <div className="bg-white border-x border-b border-slate-100 rounded-b-2xl shadow-sm overflow-hidden overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[1000px]">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-500 font-black">
                                            <th className="p-4 pl-6 w-20">Image</th>
                                            <th className="p-4">Restaurant</th>
                                            <th className="p-4">Owner</th>
                                            <th className="p-4">Type</th>
                                            <th className="p-4">Rating</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 pr-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {restaurants.map((res, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="p-4 pl-6">
                                                    <div className="w-12 h-12 rounded-lg bg-slate-200 flex-shrink-0" style={{ backgroundImage: `url(${res.banner_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                                                </td>
                                                <td className="p-4">
                                                    <h3 className="font-bold text-slate-900">{res.name}</h3>
                                                    <p className="text-xs text-slate-500 max-w-[200px] truncate">{res.tagline || '123 Food Lane, Generic City'}</p>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">admin@foodexpress.com</span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">{res.type}</span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1 font-bold text-sm text-slate-800">
                                                        <Star size={14} className="fill-amber-400 text-amber-400" /> {res.rating}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md ${res.status === 'Online' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                        {res.status === 'Online' ? 'Active' : 'Offline'}
                                                    </span>
                                                </td>
                                                <td className="p-4 pr-6 text-right space-x-2">
                                                    <button onClick={() => navigate(`/user?restaurant_id=${res.id}`)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100" title="View Store">
                                                        <Eye size={16} />
                                                    </button>
                                                    <button onClick={() => { setSelectedRestaurant(res); setManageModalOpen(true); }} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors border border-amber-100" title="Manage Config">
                                                        <Edit2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Manage Restaurant Modal */}                            {manageModalOpen && selectedRestaurant && (
                                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                    <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative">
                                        <button onClick={() => setManageModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><X size={24} /></button>
                                        <h2 className="text-2xl font-black text-slate-900 mb-1">{selectedRestaurant.name}</h2>
                                        <p className="text-slate-500 font-medium text-sm mb-6">Manage partner settings and status.</p>

                                        <div className="space-y-4">
                                            <button
                                                onClick={() => handleManageAction('toggle_status')}
                                                className={`w-full py-4 rounded-xl font-bold text-white transition-colors flex items-center justify-center gap-2 ${selectedRestaurant.status === 'Online' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                                            >
                                                {selectedRestaurant.status === 'Online' ? 'Suspend & Force Offline' : 'Approve & Force Online'}
                                            </button>
                                            <button
                                                onClick={() => { if (window.confirm("Are you sure? This cannot be undone.")) handleManageAction('delete') }}
                                                className="w-full py-4 rounded-xl font-bold bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-500 transition-colors"
                                            >
                                                Permanently Remove Partner
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : activeTab === 'Food Items' ? (
                        <>
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2"><svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg> Food Items</h1>
                                </div>
                                <button className="bg-[#ef4444] text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-red-500/30 flex items-center gap-2 text-sm hover:-translate-y-0.5 transition-transform">
                                    <Plus size={18} /> Add Food Item
                                </button>
                            </div>

                            <div className="bg-white p-4 rounded-t-2xl border-b border-slate-200 border border-slate-100 flex flex-wrap gap-4 items-center">
                                <div className="flex-1 min-w-[200px] relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input type="text" placeholder="Search food items..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none focus:border-indigo-500" />
                                </div>
                                <select className="border border-slate-200 rounded-lg text-sm px-4 py-2 bg-slate-50 text-slate-600 outline-none w-40">
                                    <option>All Restaurants</option>
                                    <option>Lucky Restaurant</option>
                                </select>
                                <select className="border border-slate-200 rounded-lg text-sm px-4 py-2 bg-slate-50 text-slate-600 outline-none w-32">
                                    <option>All Categories</option>
                                    <option>Main Course</option>
                                </select>
                                <select className="border border-slate-200 rounded-lg text-sm px-4 py-2 bg-slate-50 text-slate-600 outline-none w-32">
                                    <option>All Availability</option>
                                    <option>Available</option>
                                </select>
                                <button className="bg-[#ef4444] text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm shadow-red-500/20">Filter</button>
                                <button className="bg-slate-100 text-slate-600 px-6 py-2 rounded-lg text-sm font-bold">Clear</button>
                            </div>

                            <div className="bg-white border-x border-b border-slate-100 rounded-b-2xl shadow-sm overflow-hidden overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[1000px]">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-500 font-black">
                                            <th className="p-4 pl-6 w-20">Image</th>
                                            <th className="p-4">Name</th>
                                            <th className="p-4">Restaurant</th>
                                            <th className="p-4">Category</th>
                                            <th className="p-4">Price</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 pr-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {foodItems.map((fi, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="p-4 pl-6">
                                                    <div className="w-12 h-12 rounded-lg bg-slate-200 flex-shrink-0" style={{ backgroundImage: `url(${fi.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                                                </td>
                                                <td className="p-4">
                                                    <h3 className="font-bold text-slate-900">{fi.name}</h3>
                                                    <p className="text-xs text-slate-500 max-w-[200px] truncate">{fi.description}</p>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-sm font-bold text-indigo-600 hover:underline cursor-pointer">{fi.restaurant}</span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-[10px] font-bold text-slate-600 border border-slate-200 bg-slate-50 px-2.5 py-1 rounded-md">{fi.category}</span>
                                                </td>
                                                <td className="p-4">
                                                    {editingFoodItemId === fi.id ? (
                                                        <div className="flex items-center gap-1.5 border border-indigo-200 bg-white rounded-lg px-2 w-24 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 shadow-sm transition-all overflow-hidden">
                                                            <span className="font-black text-slate-400 pl-1">₹</span>
                                                            <input
                                                                type="number"
                                                                value={editingPrice}
                                                                onChange={(e) => setEditingPrice(e.target.value)}
                                                                className="w-full font-black text-slate-800 bg-transparent py-1.5 outline-none"
                                                                autoFocus
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleManageFoodItem(fi.id, 'save', editingPrice);
                                                                    if (e.key === 'Escape') setEditingFoodItemId(null);
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <span className="font-black text-emerald-600">{fi.price}</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md ${fi.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                        {fi.is_available ? 'Available' : 'Unavailable'}
                                                    </span>
                                                </td>
                                                <td className="p-4 pr-6 text-right space-x-2">
                                                    {editingFoodItemId === fi.id ? (
                                                        <>
                                                            <button onClick={() => handleManageFoodItem(fi.id, 'save', editingPrice)} className="p-2 text-emerald-500 hover:bg-emerald-50 bg-white rounded-lg transition-colors border border-emerald-200 shadow-sm" title="Save Price">
                                                                <CheckCircle size={14} />
                                                            </button>
                                                            <button onClick={() => setEditingFoodItemId(null)} className="p-2 text-slate-500 hover:bg-slate-50 bg-white rounded-lg transition-colors border border-slate-200 shadow-sm" title="Cancel">
                                                                <X size={14} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => { setEditingFoodItemId(fi.id); setEditingPrice(fi.price.replace('₹', '')); }} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100" title="Edit Price">
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button onClick={() => handleManageFoodItem(fi.id, 'toggle')} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors border border-amber-100" title="Toggle Availability">
                                                                <Pause size={14} />
                                                            </button>
                                                            <button onClick={() => handleManageFoodItem(fi.id, 'delete')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100" title="Delete Item">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : activeTab === 'All Orders' ? (
                        <>
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2"><ShoppingBag className="w-8 h-8 text-black" /> Orders <span className="text-xs bg-slate-800 text-white px-2 py-1 rounded-md">{allOrders.length} Total</span></h1>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-t-2xl border-b border-slate-200 border border-slate-100 flex flex-wrap gap-4 items-center">
                                <div className="flex-1 min-w-[200px] relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input type="text" placeholder="Search customer, restaurant, id..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none focus:border-indigo-500" />
                                </div>
                                <select className="border border-slate-200 rounded-lg text-sm px-4 py-2 bg-slate-50 text-slate-600 outline-none w-40">
                                    <option>All Statuses</option>
                                    <option>Pending</option>
                                    <option>Confirmed</option>
                                    <option>Delivered</option>
                                </select>
                                <select className="border border-slate-200 rounded-lg text-sm px-4 py-2 bg-slate-50 text-slate-600 outline-none w-40">
                                    <option>All Restaurants</option>
                                    <option>Lucky Restaurant</option>
                                </select>
                                <button className="bg-[#ef4444] text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm shadow-red-500/20">Filter</button>
                                <button className="bg-slate-100 text-slate-600 px-6 py-2 rounded-lg text-sm font-bold">Clear</button>
                            </div>

                            <div className="bg-white border-x border-b border-slate-100 rounded-b-2xl shadow-sm overflow-hidden overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[1000px]">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-500 font-black">
                                            <th className="p-4 pl-6 w-24">Order ID</th>
                                            <th className="p-4">Customer</th>
                                            <th className="p-4">Restaurant</th>
                                            <th className="p-4">Items</th>
                                            <th className="p-4">Amount</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4">Delivery Agent</th>
                                            <th className="p-4 pr-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {allOrders.map((o, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="p-4 pl-6">
                                                    <span className="font-black text-indigo-600 text-sm">{o.id}</span>
                                                </td>
                                                <td className="p-4">
                                                    <h3 className="text-sm font-bold text-slate-900">{o.customer}</h3>
                                                    <p className="text-xs text-slate-500">9123456780</p>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-sm font-medium text-slate-800">{o.restaurant}</span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-sm font-medium text-slate-500">{o.items}</span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="font-bold text-slate-900">{o.amount}</span>
                                                </td>
                                                <td className="p-4">
                                                    <select onChange={(e) => handleUpdateOrderStatus(o.raw_id, e.target.value)} value={o.status || 'PENDING'} className={`text-xs font-bold px-3 py-1.5 rounded-lg border outline-none ${o.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : o.status === 'PENDING' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                                        <option value="PENDING">Pending</option>
                                                        <option value="READY">Confirmed</option>
                                                        <option value="OUT_FOR_DELIVERY">Dispatched</option>
                                                        <option value="DELIVERED">Delivered</option>
                                                    </select>
                                                </td>
                                                <td className="p-4">
                                                    {o.agent !== 'Unassigned' ? (
                                                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-md">
                                                            📍 {o.agent}
                                                        </span>
                                                    ) : o.status === 'DELIVERED' || o.status === 'CANCELLED' ? (
                                                        <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-md">
                                                            {o.agent === 'Unassigned' ? 'System Courier' : o.agent}
                                                        </span>
                                                    ) : (
                                                        <select onChange={(e) => handleDispatch(o.raw_id, e.target.value)} className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 outline-none">
                                                            <option value="">Assign Driver...</option>
                                                            {fleet.filter(f => f.status === 'Available').map(driver => (
                                                                <option key={driver.id} value={driver.id}>{driver.name}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </td>
                                                <td className="p-4 pr-6 text-right">
                                                    <button onClick={() => { setSelectedOrder(o); setOrderModalOpen(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100">
                                                        <Eye size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : activeTab === 'System Settings' ? (
                        <>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h1>
                                <p className="text-slate-500 mt-1 font-medium">Configure platform rules, fees, and security.</p>
                            </div>
                            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                                <div className="space-y-6 max-w-2xl">
                                    <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                                        <div>
                                            <h4 className="font-bold text-slate-800">Platform Commission Fee</h4>
                                            <p className="text-xs text-slate-400 mt-1">Percentage charged on each restaurant order.</p>
                                        </div>
                                        <div className="flex relative items-center">
                                            <input type="number" defaultValue="15" className="w-20 bg-slate-50 border border-slate-200 rounded-lg py-2 pl-3 pr-8 text-slate-800 font-black outline-none focus:border-indigo-500" />
                                            <span className="absolute right-3 text-slate-400 font-bold">%</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                                        <div>
                                            <h4 className="font-bold text-slate-800">Delivery Surge Pricing</h4>
                                            <p className="text-xs text-slate-400 mt-1">Automatically increase delivery fees during peak hours.</p>
                                        </div>
                                        <button onClick={(e) => {
                                            const btn = e.currentTarget;
                                            const isEnabled = btn.classList.contains('bg-emerald-500');
                                            btn.className = `w-12 h-6 ${isEnabled ? 'bg-slate-200' : 'bg-emerald-500'} rounded-full relative shadow-inner`;
                                            btn.children[0].className = `w-4 h-4 bg-white rounded-full absolute ${isEnabled ? 'left-1' : 'right-1'} top-1 shadow-sm transition-all`;
                                        }} className="w-12 h-6 bg-emerald-500 rounded-full relative shadow-inner transition-colors">
                                            <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm transition-all"></div>
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                                        <div>
                                            <h4 className="font-bold text-slate-800 flex items-center gap-2">Maintenance Mode <Shield size={14} className="text-red-500" /></h4>
                                            <p className="text-xs text-slate-400 mt-1">Suspends all orders across the entire network.</p>
                                        </div>
                                        <button onClick={(e) => {
                                            const btn = e.currentTarget;
                                            const isEnabled = btn.classList.contains('bg-emerald-500');
                                            btn.className = `w-12 h-6 ${isEnabled ? 'bg-slate-200' : 'bg-emerald-500'} rounded-full relative shadow-inner transition-colors`;
                                            btn.children[0].className = `w-4 h-4 bg-white rounded-full absolute ${isEnabled ? 'left-1' : 'right-1'} top-1 shadow-sm transition-all`;
                                        }} className="w-12 h-6 bg-slate-200 rounded-full relative shadow-inner transition-colors">
                                            <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm transition-all"></div>
                                        </button>
                                    </div>
                                    <div className="pt-2">
                                        <button onClick={(e) => {
                                            const btn = e.target;
                                            const originalText = btn.innerText;
                                            btn.innerText = 'Saving...';
                                            btn.classList.add('opacity-70');
                                            setTimeout(() => {
                                                btn.innerText = 'Settings Saved!';
                                                btn.classList.replace('bg-slate-900', 'bg-emerald-600');
                                                setTimeout(() => {
                                                    btn.innerText = originalText;
                                                    btn.classList.replace('bg-emerald-600', 'bg-slate-900');
                                                    btn.classList.remove('opacity-70');
                                                }, 2000);
                                            }, 1000);
                                        }} className="bg-slate-900 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-black/20 hover:-translate-y-0.5 transition-all w-fit min-w-[160px]">
                                            Save All Settings
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-24 h-24 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-6">
                                <LayoutDashboard size={40} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900">Module Under Construction</h2>
                            <p className="text-slate-500 mt-2 max-w-sm">The <strong>{activeTab}</strong> tab is currently being developed by the engineering team.</p>
                            <button onClick={() => setActiveTab('Overview')} className="mt-8 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all">
                                Return to Overview
                            </button>
                        </div>
                    )}

                </div>
            </main>

            {historyModalOpen && selectedDriver && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in duration-200">
                        <div className="bg-slate-900 p-6 relative">
                            <button onClick={() => setHistoryModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-bold text-2xl shadow-inner">{selectedDriver.name[0]}</div>
                                <div>
                                    <h2 className="text-2xl font-black text-white">{selectedDriver.name}</h2>
                                    <p className="text-indigo-300 text-sm font-medium">Delivery Agent</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-8">
                            <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2"><Clock size={20} className="text-slate-400" /> Recent Deliveries</h3>
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-emerald-100 text-emerald-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                            <CheckCircle size={16} />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-slate-700 text-sm">Order #{Math.floor(Math.random() * 9000) + 1000}</span>
                                                <span className="text-[10px] text-slate-400 font-bold bg-white px-2 py-1 rounded shadow-sm border border-slate-100">DELIVERED</span>
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium line-clamp-1">{Math.floor(Math.random() * 5) + 1} days ago in Downtown</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {orderModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in duration-200">
                        <div className="bg-slate-900 p-6 relative">
                            <button onClick={() => setOrderModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
                            <h2 className="text-2xl font-black text-white">Log: {selectedOrder.id}</h2>
                            <p className="text-indigo-300 text-sm font-medium mt-1">Detailed Event Timeline</p>
                        </div>
                        <div className="p-8 space-y-5">
                            <div className="grid grid-cols-2 gap-4 mb-2">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Customer</p>
                                    <p className="font-bold text-slate-900 break-words">{selectedOrder.customer}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Restaurant</p>
                                    <p className="font-bold text-slate-900 break-words">{selectedOrder.restaurant}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Items</p>
                                    <p className="font-bold text-slate-900 text-sm line-clamp-2 max-w-[200px]">{selectedOrder.items}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total</p>
                                    <p className="font-black text-red-500 text-xl">{selectedOrder.amount}</p>
                                </div>
                            </div>

                            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center justify-between">
                                <p className="font-bold text-indigo-900 text-sm flex items-center gap-2"><Bike size={16} /> Attached Courier</p>
                                <span className="font-black text-xs uppercase tracking-wider text-indigo-600 bg-white px-2 py-1 rounded shadow-sm">{selectedOrder.agent}</span>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
                                <span className="font-bold text-slate-500 text-sm flex items-center gap-2"><Activity size={16} /> Final State</span>
                                <span className="text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-wider bg-slate-900 text-white">{selectedOrder.status}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
