import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LogOut, Library, Edit3, BookOpen, X,
    Loader2, GraduationCap, Sparkles, Clock, Save,
    Zap
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';

// ── Avatar with auto-generated initials ──────────────────────────────────────
function Avatar({ username, size = 'lg' }) {
    const initials = (username || 'U')
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    const sizeClasses = size === 'lg'
        ? 'h-20 w-20 text-2xl'
        : 'h-10 w-10 text-sm';
    return (
        <div className={`${sizeClasses} rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold shadow-lg select-none`}>
            {initials}
        </div>
    );
}

// ── Edit Profile Modal ────────────────────────────────────────────────────────
function EditProfileModal({ user, onClose, onSave }) {
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {};
            if (username.trim() && username !== user.username) payload.username = username.trim();
            if (email.trim() && email !== user.email) payload.email = email.trim();
            if (password && password.length >= 6) payload.password = password;

            if (Object.keys(payload).length === 0) {
                toast.info('No changes detected');
                setSaving(false);
                return;
            }
            await onSave(payload);
            toast.success('Profile updated successfully!');
            onClose();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                transition={{ duration: 0.25 }}
                className="relative bg-background rounded-2xl shadow-2xl border border-border/50 w-full max-w-md p-6 space-y-5"
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Edit3 className="h-4 w-4" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">Edit Profile</h2>
                            <p className="text-xs text-muted-foreground">Update your account details</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Avatar preview */}
                <div className="flex justify-center">
                    <Avatar username={username || user?.username} size="lg" />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Username</label>
                        <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Your username"
                            className="h-11"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Email</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="h-11"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">
                            New Password
                            <span className="ml-1 text-xs text-muted-foreground font-normal">(leave blank to keep current)</span>
                        </label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 6 characters"
                            className="h-11"
                            minLength={6}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 gap-2" disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// ── Main UserDashboard ────────────────────────────────────────────────────────
export function UserDashboard() {
    const { user, logout, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [showEditModal, setShowEditModal] = useState(false);
    const [resourceCount, setResourceCount] = useState(null);

    // Fetch resource count for activity card
    useEffect(() => {
        api.get('/resources')
            .then(({ data }) => setResourceCount(data.length))
            .catch(() => setResourceCount(0));
    }, []);

    const handleLogout = () => {
        logout();
        toast.success('Signed out successfully');
        navigate('/login', { replace: true });
    };

    const joinedDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const loginTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const cardVariants = {
        hidden: { opacity: 0, y: 24 },
        visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.07 } }),
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* ── Page Header ───────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back, <span className="font-semibold text-primary">{user?.username}</span> 👋
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="gap-2 self-start sm:self-auto border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
            </motion.div>

            {/* ── Main Grid ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* ── Profile Card ─── */}
                <motion.div
                    custom={0}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="lg:col-span-1 bg-background/70 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col gap-5"
                >
                    {/* Avatar + name */}
                    <div className="flex flex-col items-center text-center gap-3">
                        <Avatar username={user?.username} size="lg" />
                        <div>
                            <p className="text-xl font-bold">{user?.username}</p>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                            <GraduationCap className="h-3.5 w-3.5" />
                            Student
                        </span>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-border/40" />

                    {/* Details */}
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Role</span>
                            <span className="font-medium capitalize">{user?.role}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Email</span>
                            <span className="font-medium truncate max-w-[160px]">{user?.email}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Joined</span>
                            <span className="font-medium">{joinedDate}</span>
                        </div>
                    </div>

                    {/* Edit Profile Button */}
                    <Button
                        className="w-full gap-2 mt-auto"
                        variant="outline"
                        onClick={() => setShowEditModal(true)}
                    >
                        <Edit3 className="h-4 w-4" />
                        Edit Profile
                    </Button>
                </motion.div>

                {/* ── Right Column ─── */}
                <div className="lg:col-span-2 flex flex-col gap-5">

                    {/* Activity Card */}
                    <motion.div
                        custom={1}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        className="bg-background/70 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-sm"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Zap className="h-4 w-4" />
                            </div>
                            <h3 className="font-semibold">Activity Overview</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                                <p className="text-2xl font-bold text-primary">
                                    {resourceCount === null ? '—' : resourceCount}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">Resources Available</p>
                            </div>
                            <div className="bg-secondary/40 rounded-xl p-4 border border-border/30">
                                <div className="flex items-center gap-1.5 text-foreground">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-sm font-semibold">{loginTime}</p>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Last Login Today</p>
                            </div>
                        </div>
                        <Link to="/library" className="block mt-4">
                            <Button className="w-full gap-2" size="sm">
                                <BookOpen className="h-4 w-4" />
                                Browse Library
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Motivation Card */}
                    <motion.div
                        custom={2}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-primary/10 to-transparent border border-primary/20 rounded-2xl p-6 shadow-sm"
                    >
                        <div className="absolute top-3 right-4 opacity-10">
                            <Sparkles className="h-16 w-16 text-primary" />
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-primary">Study Motivation</h3>
                        </div>
                        <blockquote className="text-base text-foreground font-medium leading-relaxed">
                            "Stay consistent. Every small step in learning<br />
                            <span className="text-primary">builds your future.</span>"
                        </blockquote>
                        <p className="text-xs text-muted-foreground mt-3">— BarakahX Study Platform</p>
                    </motion.div>
                </div>
            </div>

            {/* ── Quick Actions ─────────────────────────────────── */}
            <motion.div
                custom={3}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
            >
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Link to="/library">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-background/60 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
                        >
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                <Library className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Browse Library</p>
                                <p className="text-xs text-muted-foreground">Access all resources</p>
                            </div>
                        </motion.div>
                    </Link>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowEditModal(true)}
                        className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-background/60 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
                    >
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            <Edit3 className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">Update Profile</p>
                            <p className="text-xs text-muted-foreground">Edit your account info</p>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="flex items-center gap-3 p-4 rounded-xl border border-destructive/20 bg-background/60 hover:border-destructive/40 hover:bg-destructive/5 transition-all cursor-pointer group"
                    >
                        <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive group-hover:bg-destructive group-hover:text-destructive-foreground transition-all">
                            <LogOut className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">Logout</p>
                            <p className="text-xs text-muted-foreground">Sign out securely</p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* ── Edit Profile Modal ─────────────────────────────── */}
            <AnimatePresence>
                {showEditModal && (
                    <EditProfileModal
                        user={user}
                        onClose={() => setShowEditModal(false)}
                        onSave={updateProfile}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
