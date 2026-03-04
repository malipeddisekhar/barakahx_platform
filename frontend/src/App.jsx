import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LibraryPage } from './pages/LibraryPage';
import { AdminPage } from './pages/AdminPage';
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
                                    {/* Public: resource library */}
                                    <Route path="/" element={<LibraryPage />} />

                                    {/* Protected: admin only */}
                                    <Route
                                        path="/admin"
                                        element={
                                            <ProtectedRoute requiredRole="admin">
                                                <AdminPage />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Fallback */}
                                    <Route path="*" element={<Navigate to="/" replace />} />
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
