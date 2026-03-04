import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, LogIn, UserPlus, Loader2, ShieldCheck, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [loading, setLoading] = useState(false);

    // Login form
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Register form
    const [regUsername, setRegUsername] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regRole, setRegRole] = useState('user');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(email, password);
            toast.success(`Welcome back, ${user.username}!`);
            // Role-based redirect
            navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await register(regUsername, regEmail, regPassword, regRole);
            toast.success('Account created successfully!');
            navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            {/* Background gradient */}
            <div className="soft-gradient-bg fixed inset-0 -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-3 group">
                        <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-elegant">
                            <BookOpen className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <span className="text-2xl font-bold text-primary tracking-tight">BarakahX</span>
                    </Link>
                    <p className="mt-3 text-muted-foreground text-sm">
                        {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-background/70 backdrop-blur-md border border-border/50 rounded-2xl shadow-elegant p-8 space-y-6">
                    {/* Tab toggle */}
                    <div className="flex bg-secondary/50 rounded-xl p-1">
                        <button
                            onClick={() => setMode('login')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'login'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setMode('register')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'register'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Register
                        </button>
                    </div>

                    {/* Login Form */}
                    {mode === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Password</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-11"
                                />
                            </div>
                            <Button type="submit" className="w-full h-11 gap-2 mt-2" disabled={loading}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                                Sign In
                            </Button>
                        </form>
                    )}

                    {/* Register Form */}
                    {mode === 'register' && (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Username</label>
                                <Input
                                    placeholder="johndoe"
                                    value={regUsername}
                                    onChange={(e) => setRegUsername(e.target.value)}
                                    required
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={regEmail}
                                    onChange={(e) => setRegEmail(e.target.value)}
                                    required
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Password</label>
                                <Input
                                    type="password"
                                    placeholder="Min. 6 characters"
                                    value={regPassword}
                                    onChange={(e) => setRegPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="h-11"
                                />
                            </div>

                            {/* Role selector */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Account Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRegRole('user')}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${regRole === 'user'
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-border text-muted-foreground hover:border-primary/50'
                                            }`}
                                    >
                                        <User className="h-5 w-5" />
                                        <span className="text-xs font-medium">Student</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRegRole('admin')}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${regRole === 'admin'
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-border text-muted-foreground hover:border-primary/50'
                                            }`}
                                    >
                                        <ShieldCheck className="h-5 w-5" />
                                        <span className="text-xs font-medium">Admin</span>
                                    </button>
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-11 gap-2 mt-2" disabled={loading}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                                Create Account
                            </Button>
                        </form>
                    )}
                </div>

                <p className="text-center mt-6 text-xs text-muted-foreground">
                    <Link to="/" className="hover:text-primary underline underline-offset-2">
                        ← Back to Library
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
