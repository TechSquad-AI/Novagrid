import React from "react";
import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, Divider } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardIcon from "@mui/icons-material/Dashboard";
import WebIcon from "@mui/icons-material/Web";
import SearchIcon from "@mui/icons-material/Search";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import InsightsIcon from "@mui/icons-material/Insights";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import ScienceIcon from "@mui/icons-material/Science";
import SettingsIcon from "@mui/icons-material/Settings";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

const mainMenu = [
    { text: "Dashboard", icon: <DashboardIcon fontSize="small" />, path: "/dashboard" },
    { text: "APIs", icon: <WebIcon fontSize="small" />, path: "/tables" },
    { text: "Analyze API", icon: <SearchIcon fontSize="small" />, path: "/analyze-api" },
    { text: "API Changes", icon: <ChangeCircleIcon fontSize="small" />, path: "/api-changes" },
    { text: "Live Monitoring", icon: <MonitorHeartIcon fontSize="small" />, path: "/live-monitoring", badge: "Live" },
    { text: "Impact Analysis", icon: <InsightsIcon fontSize="small" />, path: "/api-changes" },
    { text: "AI Fix", icon: <AutoFixHighIcon fontSize="small" />, path: "/ai-fix" },
    { text: "Human Validation", icon: <VerifiedUserIcon fontSize="small" />, path: "/human-validation" },
    { text: "Test Results", icon: <ScienceIcon fontSize="small" />, path: "/history" },
    { text: "AI Suggestions", icon: <BoltIcon fontSize="small" />, path: "/ai-fix" },
    { text: "Settings", icon: <SettingsIcon fontSize="small" />, path: "/settings" },
];

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Box sx={{
            width: 230, flexShrink: 0, height: "100vh", position: "fixed", top: 0, left: 0,
            background: "#0f172a", display: "flex", flexDirection: "column", zIndex: 10,
            borderRight: "1px solid rgba(255,255,255,0.06)",
        }}>
            {/* Logo */}
            <Box sx={{ p: 2, pb: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{
                    width: 38, height: 38, borderRadius: 2.5,
                    background: "linear-gradient(135deg, #1a73e8, #7c3aed)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <Box sx={{ width: 20, height: 20, borderRadius: 1, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
                    </Box>
                </Box>
                <Box>
                    <Typography sx={{ color: "#fff", fontSize: 15, fontWeight: 800, lineHeight: 1.2, letterSpacing: "0.02em" }}>NOVAGRID</Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 500 }}>API Guardian</Typography>
                </Box>
            </Box>

            {/* Menu */}
            <List sx={{ px: 1, py: 0.5, flex: 1, overflowY: "auto" }}>
                {mainMenu.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <ListItemButton key={item.text + item.path} onClick={() => navigate(item.path)}
                            sx={{
                                borderRadius: 2, mb: 0.25, py: 1, px: 1.5, minHeight: 38,
                                background: active ? "rgba(26,115,232,0.15)" : "transparent",
                                "&:hover": { background: active ? "rgba(26,115,232,0.15)" : "rgba(255,255,255,0.05)" },
                            }}>
                            <ListItemIcon sx={{ color: active ? "#1a73e8" : "rgba(255,255,255,0.4)", minWidth: 30 }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} sx={{ "& .MuiTypography-root": { color: active ? "#fff" : "rgba(255,255,255,0.6)", fontWeight: active ? 600 : 400, fontSize: 13 } }} />
                            {item.badge && (
                                <Box sx={{ px: 1, py: 0.2, borderRadius: 1, background: "rgba(16,185,129,0.2)", fontSize: 10, fontWeight: 700, color: "#10b981" }}>{item.badge}</Box>
                            )}
                        </ListItemButton>
                    );
                })}
            </List>

            {/* Last Scan Card */}
            <Box sx={{ p: 1.5, mx: 1, mb: 1, borderRadius: 2.5, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <Typography sx={{ color: "#fff", fontSize: 12, fontWeight: 700, mb: 0.5 }}>Last Scan</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                    <CheckCircleIcon sx={{ color: "#10b981", fontSize: 14 }} />
                    <Typography sx={{ color: "#10b981", fontSize: 11, fontWeight: 600 }}>Success</Typography>
                </Box>
                <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>May 18, 2025 10:30 AM</Typography>
                <Box component="button" sx={{
                    mt: 1, width: "100%", py: 1, borderRadius: 2, border: "none", background: "#1a73e8",
                    color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
                    "&:hover": { background: "#1557b0" },
                }}>Run New Scan</Box>
            </Box>
        </Box>
    );
}
export default Sidebar;
