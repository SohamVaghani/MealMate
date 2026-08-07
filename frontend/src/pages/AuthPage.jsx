import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Flame, User, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Determine the target role from URL query param (e.g. ?role=ADMIN)
    const queryParams = new URLSearchParams(location.search);
    const targetRole = queryParams.get('role') || 'CUSTOMER';

    const handleToggle = () => {
        setIsLogin(!isLogin);
        setError('');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const endpoint = isLogin ? (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api/auth/login/' : (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api/auth/signup/';
        const payload = isLogin
            ? { email: formData.email, password: formData.password, role: targetRole }
            : { ...formData, role: targetRole };

        try {
            const res = await axios.post(endpoint, payload);
            if (res.data.success) {
                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify(res.data.user));
                localStorage.setItem('token', res.data.token);

                // Redirect based on role
                const actRole = res.data.user.role;
                if (actRole === 'ADMIN') navigate('/admin');
                else if (actRole === 'RESTAURANT') navigate('/restaurant');
                else if (actRole === 'DELIVERY') navigate('/delivery');
                else navigate('/user'); // customer
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex selection:bg-red-500/30">

            {/* Left Box: Graphic Split Screen */}
            <div className="hidden lg:flex w-1/2 bg-gray-900 relative flex-col justify-between overflow-hidden p-12">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1544148103-0773bf10d330?w=1200&q=80"
                        alt="Restaurant Kitchen"
                        className="w-full h-full object-cover opacity-30 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-900/80 to-gray-900"></div>
                </div>

                <div className="relative z-10 flex items-center gap-3">
                    <div className="bg-white rounded-lg p-1.5 shadow-md flex justify-center min-w-[44px]">
                        <img src="/logo.png" alt="MealMate Logo" className="h-[36px] w-auto max-w-[140px] object-contain mix-blend-multiply" />
                    </div>
                    <span className="text-3xl font-black text-white tracking-tight">MealMate.</span>
                </div>

                <div className="relative z-10 mb-10 max-w-lg">
                    <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight">
                        The ultimate destination for food lovers and makers.
                    </h1>
                    <p className="mt-6 text-gray-400 font-medium text-lg">
                        {targetRole === 'ADMIN' ? 'Secure backend access for platform operators.' :
                            targetRole === 'RESTAURANT' ? 'Manage your menus and live orders seamlessly.' :
                                'Discover hundreds of local restaurants and get it delivered fiery fast.'}
                    </p>

                    <div className="mt-12 space-y-4">
                        <div className="flex items-center gap-3 text-gray-300 font-medium">
                            <CheckCircle2 size={20} className="text-green-500" /> Fast & reliable order processing
                        </div>
                        <div className="flex items-center gap-3 text-gray-300 font-medium">
                            <CheckCircle2 size={20} className="text-green-500" /> Real-time live dashboard sync
                        </div>
                        <div className="flex items-center gap-3 text-gray-300 font-medium">
                            <CheckCircle2 size={20} className="text-green-500" /> Premium partner network
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Box: Form Section */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-white relative">

                {/* Mobile top logo */}
                <div className="absolute top-8 left-8 flex lg:hidden items-center gap-2">
                    <img src="/logo.png" alt="MealMate Logo" className="h-[36px] w-auto max-w-[140px] object-contain mix-blend-multiply" />
                    <span className="text-2xl font-black text-gray-900 tracking-tight">MealMate.</span>
                </div>

                <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">

                    <div className="mb-10 text-center lg:text-left">
                        <span className="inline-block px-3 py-1 bg-red-50 text-red-600 font-black tracking-widest text-[10px] uppercase rounded-full mb-4">
                            {targetRole} PORTAL
                        </span>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                            {isLogin ? 'Welcome back' : 'Create an account'}
                        </h2>
                        <p className="text-gray-500 mt-2 font-medium">
                            {isLogin ? 'Enter your credentials to access your dashboard.' : 'Join the platform to get started today.'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-bottom-2">
                            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {!isLogin && (
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Username</label>
                                <div className="relative flex items-center">
                                    <User size={18} className="absolute left-4 text-gray-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        name="username"
                                        required
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-gray-900 font-semibold outline-none focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-400/10 transition-all text-sm placeholder:text-gray-400 placeholder:font-medium"
                                        placeholder="johndoe123"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                                {isLogin ? 'Username or Email' : 'Email Address'}
                            </label>
                            <div className="relative flex items-center">
                                <Mail size={18} className="absolute left-4 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-gray-900 font-semibold outline-none focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-400/10 transition-all text-sm placeholder:text-gray-400 placeholder:font-medium"
                                    placeholder={isLogin ? "admin@mealmate.com" : "you@example.com"}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Password</label>
                                {isLogin && <a href="#" className="text-xs font-bold text-red-500 hover:text-red-600">Forgot?</a>}
                            </div>
                            <div className="relative flex items-center">
                                <Lock size={18} className="absolute left-4 text-gray-400 pointer-events-none" />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-gray-900 font-semibold outline-none focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-400/10 transition-all text-sm placeholder:text-gray-400 placeholder:font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 mt-4 bg-gray-900 hover:bg-black text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Processing...' : (isLogin ? 'Sign In Securely' : 'Create Account')}
                            {!loading && <ArrowRight size={18} />}
                        </button>

                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm font-medium text-gray-500">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button onClick={handleToggle} className="text-red-500 font-bold hover:underline py-2">
                                {isLogin ? 'Sign Up' : 'Log In'}
                            </button>
                        </p>
                    </div>

                </div>
            </div>

        </div>
    );
}
