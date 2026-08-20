import React from "react";
import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "../context/SidebarContext";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SearchIcon from "@mui/icons-material/Search";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";

const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Analyze API", icon: <SearchIcon />, path: "/analyze-api" },
    { text: "API Changes", icon: <ChangeCircleIcon />, path: "/api-changes" },
    { text: "AI Fix", icon: <AutoFixHighIcon />, path: "/ai-fix" },
    { text: "Human Validation", icon: <VerifiedUserIcon />, path: "/human-validation" },
    { text: "History", icon: <HistoryIcon />, path: "/history" },
    { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { open, close } = useSidebar();

    return (
        <>
            {/* Backdrop - visible when sidebar is open on small screens */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={close}
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(0,0,0,0.4)",
                            zIndex: 9,
                            display: "none", /* shown via media query below */
                        }}
                        className="sidebar-backdrop"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ x: -260 }}
                        animate={{ x: 0 }}
                        exit={{ x: -260 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            width: 250,
                            flexShrink: 0,
                            height: "100vh",
                            position: "fixed",
                            top: 0,
                            left: 0,
                            background: "#0f172a",
                            borderRight: "1px solid rgba(255,255,255,0.06)",
                            display: "flex",
                            flexDirection: "column",
                            zIndex: 10,
                            overflowY: "auto",
                        }}
                    >
                        {/* Logo */}
                        <Box sx={{ p: 2.5, pb: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Box sx={{
                                    width: 42, height: 42, borderRadius: 2.5,
                                    background: "linear-gradient(135deg, #4318FF, #7551FF)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    boxShadow: "0 8px 24px rgba(67,24,255,0.35)",
                                }}>
                                    <Typography sx={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>N</Typography>
                                </Box>
                                <Box>
                                    <Typography sx={{ fontWeight: 800, fontSize: 16, color: "#fff", lineHeight: 1.2 }}>NovaGrid</Typography>
                                    <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 500 }}>API Guardian</Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Navigation */}
                        <List sx={{ px: 1.5, py: 0 }}>
                            {menuItems.map((item, index) => {
                                const active = location.pathname === item.path;
                                return (
                                    <motion.div key={item.text}
                                        initial={{ opacity: 0, x: -12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + index * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
                                        <ListItemButton onClick={() => { navigate(item.path); close(); }}
                                            sx={{
                                                borderRadius: 2, mb: 0.4, py: 1, px: 1.5,
                                                background: active ? "rgba(67,24,255,0.15)" : "transparent",
                                                borderLeft: active ? "3px solid #4318FF" : "3px solid transparent",
                                                transition: "all 0.2s",
                                                "&:hover": { background: "rgba(67,24,255,0.08)" },
                                            }}>
                                            <ListItemIcon sx={{
                                                color: active ? "#4318FF" : "rgba(255,255,255,0.3)",
                                                minWidth: 32, transition: "color 0.2s",
                                            }}>{item.icon}</ListItemIcon>
                                            <ListItemText primary={item.text} sx={{
                                                "& .MuiTypography-root": {
                                                    color: active ? "#fff" : "rgba(255,255,255,0.45)",
                                                    fontWeight: active ? 600 : 400,
                                                    fontSize: 13,
                                                    transition: "color 0.2s",
                                                },
                                            }} />
                                        </ListItemButton>
                                    </motion.div>
                                );
                            })}
                        </List>

                        {/* Spacer */}
                        <Box sx={{ flex: 1 }} />

                        {/* Last Scan Card */}
                        <Box sx={{ p: 2, mx: 1.5, mb: 1.5, borderRadius: 3, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, mb: 0.8 }}>Last Scan</Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.5 }}>
                                <Box sx={{ width: 7, height: 7, borderRadius: "50%", background: "#05CD99" }} />
                                <Typography sx={{ color: "#05CD99", fontSize: 12, fontWeight: 600 }}>Success</Typography>
                            </Box>
                            <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: 10, mb: 1.5 }}>May 18, 2025 10:30 AM</Typography>
                            <Box component="button" onClick={() => { navigate("/dashboard"); close(); }}
                                sx={{
                                    width: "100%", py: 1, borderRadius: 2,
                                    background: "linear-gradient(135deg, #4318FF, #7551FF)",
                                    border: "none", color: "#fff", fontSize: 12, fontWeight: 700,
                                    cursor: "pointer",
                                    "&:hover": { opacity: 0.9 },
                                }}>Run New Scan</Box>
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CSS for backdrop on small screens */}
            <style>{`
                @media (max-width: 900px) {
                    .sidebar-backdrop { display: block !important; }
                }
            `}</style>
        </>
    );
}
export default Sidebar;
