import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AnalyzeApi from "./pages/AnalyzeApi";
import ApiChanges from "./pages/ApiChanges";
import AiFix from "./pages/AiFix";
import HumanValidation from "./pages/HumanValidation";
import History from "./pages/History";
import Settings from "./pages/Settings";

const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }
};

function AnimatedPage({ children }) {
    return (
        <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"
            style={{ minHeight: "100vh", overflow: "visible" }}>
            {children}
        </motion.div>
    );
}

function AnimatedRoutes() {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
                <Route path="/signup" element={<AnimatedPage><Signup /></AnimatedPage>} />
                <Route path="/dashboard" element={<AnimatedPage><ProtectedRoute><Dashboard /></ProtectedRoute></AnimatedPage>} />
                <Route path="/analyze-api" element={<AnimatedPage><ProtectedRoute><AnalyzeApi /></ProtectedRoute></AnimatedPage>} />
                <Route path="/api-changes" element={<AnimatedPage><ProtectedRoute><ApiChanges /></ProtectedRoute></AnimatedPage>} />
                <Route path="/ai-fix" element={<AnimatedPage><ProtectedRoute><AiFix /></ProtectedRoute></AnimatedPage>} />
                <Route path="/human-validation" element={<AnimatedPage><ProtectedRoute><HumanValidation /></ProtectedRoute></AnimatedPage>} />
                <Route path="/history" element={<AnimatedPage><ProtectedRoute><History /></ProtectedRoute></AnimatedPage>} />
                <Route path="/settings" element={<AnimatedPage><ProtectedRoute><Settings /></ProtectedRoute></AnimatedPage>} />
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </AnimatePresence>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <BrowserRouter>
                    <AnimatedRoutes />
                </BrowserRouter>
            </AuthProvider>
        </ErrorBoundary>
    );
}
export default App;
