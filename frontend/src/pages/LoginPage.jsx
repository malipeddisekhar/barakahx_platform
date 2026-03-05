import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, LogIn, UserPlus, Loader2,
    GraduationCap, Target, Star, Lightbulb,
    CheckCircle2, Quote, ArrowRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';

// ─── Static data ────────────────────────────────────────────────────
const FEATURES = [
    { icon: GraduationCap, label: 'Placement Preparation Materials' },
    { icon: Target, label: 'Aptitude Practice Resources' },
    { icon: Star, label: 'Academic Study Notes' },
    { icon: Lightbulb, label: 'Curated Learning Files' },
];

const QUOTES = {
    login: 'Consistency in learning creates confidence in success.',
    register: 'Your future career begins with the knowledge you build today.',
};

// ─── Info Panel (sits inside the sliding coloured block) ────────────
function InfoPanel({ mode, onSwitch }) {
    return (
        <div className="flex flex-col justify-between h-full px-10 py-12 text-white select-none">
            {/* Brand */}
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight">BarakahX</span>
            </div>

            {/* Main copy */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                >
                    <div>
                        <p className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-2">Study Platform</p>
                        <h2 className="text-3xl font-extrabold leading-snug">
                            Learn Today.<br />Lead Tomorrow.
                        </h2>
                        <p className="mt-3 text-white/75 text-sm leading-relaxed">
                            A smart learning hub designed for students preparing for placements,
                            aptitude tests, and academic success.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                        {FEATURES.map(({ icon: Icon, label }) => (
                            <div key={label} className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                                    <Icon className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm text-white/90">{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Quote */}
                    <div className="bg-white/10 border border-white/20 rounded-2xl p-5">
                        <Quote className="h-4 w-4 text-white/40 mb-2" />
                        <p className="text-white/90 text-sm italic leading-relaxed">
                            "{QUOTES[mode]}"
                        </p>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Switch button */}
            <button
                type="button"
                onClick={onSwitch}
                className="group flex items-center justify-center gap-2 py-3 rounded-xl border border-white/30 text-white/80 text-sm font-medium hover:bg-white/15 hover:text-white transition-all"
            >
                {mode === 'register'
                    ? 'Already have an account? Sign In'
                    : 'New here? Create Account'}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
}

// ─── Login Form ─────────────────────────────────────────────────────
function LoginForm({ onSubmit, email, setEmail, password, setPassword, loading }) {
    return (
        <div className="flex flex-col justify-center h-full px-10 max-w-sm mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Welcome back 👋</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Sign in to access your resources and continue learning.
                </p>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Email address</label>
                    <Input type="email" placeholder="you@example.com" value={email}
                        onChange={(e) => setEmail(e.target.value)} required className="h-11" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Password</label>
                    <Input type="password" placeholder="••••••••" value={password}
                        onChange={(e) => setPassword(e.target.value)} required className="h-11" />
                </div>
                <Button type="submit" className="w-full h-11 gap-2 rounded-xl mt-2" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                    Sign In to My Account
                </Button>
            </form>
            <p className="text-center text-xs text-muted-foreground mt-5 italic">
                Your resources are waiting. Let's get back to learning ✨
            </p>
        </div>
    );
}

// ─── Register Form ───────────────────────────────────────────────────
function RegisterForm({ onSubmit, username, setUsername, email, setEmail, password, setPassword, loading }) {
    return (
        <div className="flex flex-col justify-center h-full px-10 max-w-sm mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Start learning today 🚀</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Create a free account and unlock all study materials instantly.
                </p>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Username</label>
                    <Input placeholder="e.g. arjun_student" value={username}
                        onChange={(e) => setUsername(e.target.value)} required className="h-11" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Email address</label>
                    <Input type="email" placeholder="you@example.com" value={email}
                        onChange={(e) => setEmail(e.target.value)} required className="h-11" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Password</label>
                    <Input type="password" placeholder="Min. 6 characters" value={password}
                        onChange={(e) => setPassword(e.target.value)} required minLength={6} className="h-11" />
                </div>
                {/* Benefits */}
                <div className="bg-primary/5 border border-primary/15 rounded-xl px-4 py-3 space-y-1.5">
                    {['Placement & aptitude prep', 'Academic notes & resume guides', 'Free access to all resources'].map((t) => (
                        <div key={t} className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="text-xs text-muted-foreground">{t}</span>
                        </div>
                    ))}
                </div>
                <Button type="submit" className="w-full h-11 gap-2 rounded-xl" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                    Create Free Account
                </Button>
            </form>
            <p className="text-center text-xs text-muted-foreground mt-4 italic">
                "Every expert was once a beginner. Your journey starts here." 🌱
            </p>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────
export function LoginPage() {
    const { login, register } = useAuth();
    const navigate = useNavigate();

    // 'register' = info LEFT + form RIGHT  |  'login' = form LEFT + info RIGHT
    const [mode, setMode] = useState('register');
    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [regUsername, setRegUsername] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');

    // ── Handlers (auth logic unchanged) ──────────────────────────────
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(email, password);
            toast.success(`Welcome back, ${user.username}!`);
            navigate(user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard', { replace: true });
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
            const user = await register(regUsername, regEmail, regPassword, 'user');
            toast.success('Account created successfully!');
            navigate('/user/dashboard', { replace: true });
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const toggle = () => setMode((m) => (m === 'register' ? 'login' : 'register'));

    // Panel slides using x transform (reliable cross-browser):
    // register → panel at x:0  (left half)
    // login    → panel at x:100% of its own w (= right half of screen since w=50vw)
    const panelX = mode === 'register' ? '0%' : '100%';

    return (
        <div className="min-h-screen flex">
            {/* ── DESKTOP SPLIT SCREEN ──────────────────────────────────── */}
            <div className="hidden lg:flex w-full h-screen overflow-hidden relative">

                {/* ── FORM AREA (always full width, content positioned by mode) ── */}
                <div className="absolute inset-0 flex">
                    {/* Left half */}
                    <div className="w-1/2 h-full flex items-center justify-center bg-background">
                        <AnimatePresence mode="wait">
                            {mode === 'login' && (
                                <motion.div key="lf" className="w-full h-full"
                                    initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                                    <LoginForm onSubmit={handleLogin} email={email} setEmail={setEmail}
                                        password={password} setPassword={setPassword} loading={loading} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    {/* Right half */}
                    <div className="w-1/2 h-full flex items-center justify-center bg-background">
                        <AnimatePresence mode="wait">
                            {mode === 'register' && (
                                <motion.div key="rf" className="w-full h-full"
                                    initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.3 }}>
                                    <RegisterForm onSubmit={handleRegister}
                                        username={regUsername} setUsername={setRegUsername}
                                        email={regEmail} setEmail={setRegEmail}
                                        password={regPassword} setPassword={setRegPassword}
                                        loading={loading} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── SLIDING INFO PANEL (z-10, moves over the form area) ── */}
                <motion.div
                    className="absolute top-0 left-0 w-1/2 h-full z-10"
                    animate={{ x: panelX }}
                    transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
                    style={{ willChange: 'transform' }}
                >
                    {/* Gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/75" />
                    {/* Dot pattern */}
                    <div className="absolute inset-0 opacity-[0.07]"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='3' fill='white'/%3E%3C/svg%3E\")" }} />
                    <div className="relative h-full">
                        <InfoPanel mode={mode} onSwitch={toggle} />
                    </div>
                </motion.div>
            </div>

            {/* ── MOBILE LAYOUT ─────────────────────────────────────────── */}
            <div className="lg:hidden flex flex-col w-full min-h-screen">
                {/* Brand strip */}
                <div className="bg-gradient-to-br from-primary to-primary/80 px-6 py-8 text-white">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-lg">BarakahX Study Platform</span>
                    </div>
                    <p className="text-white/80 text-sm">
                        A smart learning hub for placement prep, aptitude tests &amp; academic success.
                    </p>
                    <p className="text-white/60 text-xs italic mt-2">"{QUOTES[mode]}"</p>
                </div>

                {/* Tab toggle */}
                <div className="px-6 pt-6">
                    <div className="flex bg-secondary/60 rounded-xl p-1">
                        {['register', 'login'].map((m) => (
                            <button key={m} type="button" onClick={() => setMode(m)}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === m ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>
                                {m === 'login' ? 'Sign In' : 'Register'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <div className="flex-1 px-6 pb-8 pt-4">
                    <AnimatePresence mode="wait">
                        {mode === 'login' ? (
                            <motion.div key="mob-login" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
                                <LoginForm onSubmit={handleLogin} email={email} setEmail={setEmail}
                                    password={password} setPassword={setPassword} loading={loading} />
                            </motion.div>
                        ) : (
                            <motion.div key="mob-reg" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
                                <RegisterForm onSubmit={handleRegister}
                                    username={regUsername} setUsername={setRegUsername}
                                    email={regEmail} setEmail={setRegEmail}
                                    password={regPassword} setPassword={setRegPassword} loading={loading} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <p className="text-center pb-6 text-xs text-muted-foreground">
                    <Link to="/" className="hover:text-primary underline underline-offset-2">
                        ← Browse the resource library
                    </Link>
                </p>
            </div>
        </div>
    );
}
