import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LibraryPage } from './pages/LibraryPage';
import { AdminPage } from './pages/AdminPage';
import { UserDashboard } from './pages/UserDashboard';
import { LoginPage } from './pages/LoginPage';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Login page — full screen, no layout wrapper */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* All other pages share the Layout (navbar + footer) */}
                    <Route
                        path="/*"
                        element={
                            <Layout>
                                <Routes>
                                    {/* Root → redirect to library */}
                                    <Route path="/" element={<Navigate to="/library" replace />} />

                                    {/* Protected: resource library (any authenticated user) */}
                                    <Route
                                        path="/library"
                                        element={
                                            <ProtectedRoute>
                                                <LibraryPage />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Protected: user dashboard */}
                                    <Route
                                        path="/user/dashboard"
                                        element={
                                            <ProtectedRoute requiredRole="user">
                                                <UserDashboard />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Protected: admin dashboard */}
                                    <Route
                                        path="/admin/dashboard"
                                        element={
                                            <ProtectedRoute requiredRole="admin">
                                                <AdminPage />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin"
                                        element={<Navigate to="/admin/dashboard" replace />}
                                    />

                                    {/* Fallback */}
                                    <Route path="*" element={<Navigate to="/library" replace />} />
                                </Routes>
                            </Layout>
                        }
                    />
                </Routes>
                <Toaster position="top-right" expand={false} richColors />
            </Router>
        </AuthProvider>
    );
}

export default App;
