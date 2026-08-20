import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AnalyzeApi from "./pages/AnalyzeApi";
import ApiChanges from "./pages/ApiChanges";
import AiFix from "./pages/AiFix";
import HumanValidation from "./pages/HumanValidation";
import History from "./pages/History";
import Settings from "./pages/Settings";
import AllApis from "./pages/AllApis";
import LiveMonitoring from "./pages/LiveMonitoring";

const pageVariants = {
    initial: { opacity: 0, y: 16, filter: "blur(6px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -10, filter: "blur(4px)", transition: { duration: 0.25 } }
};

function AnimatedPage({ children }) {
    return (
        <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"
            style={{ height: "100vh", overflow: "hidden" }}>
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
                <Route path="/profile" element={<AnimatedPage><ProtectedRoute><Profile /></ProtectedRoute></AnimatedPage>} />
                <Route path="/analyze-api" element={<AnimatedPage><ProtectedRoute><AnalyzeApi /></ProtectedRoute></AnimatedPage>} />
                <Route path="/api-changes" element={<AnimatedPage><ProtectedRoute><ApiChanges /></ProtectedRoute></AnimatedPage>} />
                <Route path="/ai-fix" element={<AnimatedPage><ProtectedRoute><AiFix /></ProtectedRoute></AnimatedPage>} />
                <Route path="/human-validation" element={<AnimatedPage><ProtectedRoute><HumanValidation /></ProtectedRoute></AnimatedPage>} />
                <Route path="/history" element={<AnimatedPage><ProtectedRoute><History /></ProtectedRoute></AnimatedPage>} />
                <Route path="/settings" element={<AnimatedPage><ProtectedRoute><Settings /></ProtectedRoute></AnimatedPage>} />
                <Route path="/all-apis" element={<AnimatedPage><ProtectedRoute><AllApis /></ProtectedRoute></AnimatedPage>} />
                <Route path="/live-monitoring" element={<AnimatedPage><ProtectedRoute><LiveMonitoring /></ProtectedRoute></AnimatedPage>} />
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
