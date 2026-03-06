import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

/**
 * Protects a route by role.
 * - If auth is loading  → show spinner
 * - If not authenticated → redirect to /login
 * - If authenticated but wrong role → redirect to /
 * - Otherwise → render children
 */
export function ProtectedRoute({ children, requiredRole }) {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-muted-foreground">Loading...</span>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        // Redirect to the user's own dashboard instead of a generic path
        const home = user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
        return <Navigate to={home} replace />;
    }

    return children;
}
