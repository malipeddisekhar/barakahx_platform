import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';

export function Layout({ children }) {
    const location = useLocation();

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden">
            {/* Soft animated background */}
            <div className="soft-gradient-bg fixed inset-0 -z-10" />


            <Navbar />

            <main className="container mx-auto px-4 py-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            <footer className="mt-auto border-t bg-background/40 backdrop-blur-sm py-8">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} BarakahX Study Platform. Study calmly. Prepare confidently.
                    </p>
                </div>
            </footer>
        </div>
    );
}
