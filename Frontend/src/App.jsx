import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import PublicAPIs from "./pages/PublicAPIs";
import ImpactAnalysis from "./pages/ImpactAnalysis";
import HumanValidation from "./pages/HumanValidation";
import History from "./pages/History";
import Settings from "./pages/Settings";

function Shell({ children }) {
    return (
        <Box sx={{ display: "flex", height: "100vh", overflow: "hidden", background: "#f4f7fe" }}>
            <Sidebar />
            <Box sx={{ flex: 1, minWidth: 0, overflow: "auto" }}>{children}</Box>
        </Box>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/dashboard" element={<Shell><Dashboard /></Shell>} />
                    <Route path="/public-apis" element={<Shell><PublicAPIs /></Shell>} />
                    <Route path="/impact" element={<Shell><ImpactAnalysis /></Shell>} />
                    <Route path="/human-validation" element={<Shell><HumanValidation /></Shell>} />
                    <Route path="/history" element={<Shell><History /></Shell>} />
                    <Route path="/settings" element={<Shell><Settings /></Shell>} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
