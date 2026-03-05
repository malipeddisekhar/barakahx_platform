import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, User, LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

export function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Signed out successfully');
        navigate('/login', { replace: true });
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link to="/library" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-elegant">
                        <BookOpen className="h-6 w-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-primary">BarakahX Study Platform</span>
                </Link>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            {/* User info badge */}
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-xs font-semibold text-foreground">
                                    {user?.role === 'admin' && (
                                        <ShieldCheck className="inline h-3 w-3 mr-1 text-primary" />
                                    )}
                                    {user?.username}
                                </span>
                                <span className="text-[10px] text-muted-foreground capitalize">{user?.role}</span>
                            </div>

                            {/* Admin dashboard quick link — only for admins */}
                            {user?.role === 'admin' && (
                                <Link
                                    to="/admin/dashboard"
                                    className={cn(
                                        'hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                                        location.pathname.startsWith('/admin')
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                                    )}
                                >
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    Dashboard
                                </Link>
                            )}

                            {/* Logout */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleLogout}
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                title="Sign out"
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    ) : (
                        <Link to="/login">
                            <Button size="sm" className="gap-2 px-5 rounded-xl">
                                <User className="h-4 w-4" />
                                Sign In
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
