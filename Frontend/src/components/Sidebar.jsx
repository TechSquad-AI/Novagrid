import React from "react";
import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, Divider } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
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

    return (
        <Box sx={{
            width: 260, flexShrink: 0, height: "100vh", position: "fixed", top: 0, left: 0,
            background: "#0d0d14",
            borderRight: "1px solid rgba(255,255,255,0.04)",
            display: "flex", flexDirection: "column",
        }}>
            {/* Logo */}
            <Box sx={{ p: 2.5, pb: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{
                        width: 38, height: 38, borderRadius: 2.5,
                        background: "linear-gradient(135deg, #f5a623, #e8941a)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, fontWeight: 900, color: "#0a0a0f",
                    }}>N</Box>
                    <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: 17, lineHeight: 1.2 }}>NovaGrid</Typography>
                        <Typography sx={{ color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 500 }}>AI API Intelligence</Typography>
                    </Box>
                </Box>
            </Box>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.04)" }} />

            {/* Menu */}
            <List sx={{ px: 1.5, py: 1, flex: 1 }}>
                {menuItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <ListItemButton key={item.text} onClick={() => navigate(item.path)}
                            sx={{
                                borderRadius: 2, mb: 0.3, py: 1.1, px: 1.5,
                                background: active ? "rgba(245,166,35,0.08)" : "transparent",
                                borderLeft: active ? "3px solid #f5a623" : "3px solid transparent",
                                transition: "all 0.15s",
                                "&:hover": { background: "rgba(255,255,255,0.03)" },
                            }}>
                            <ListItemIcon sx={{ color: active ? "#f5a623" : "rgba(255,255,255,0.25)", minWidth: 32, transition: "color 0.15s" }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} sx={{ "& .MuiTypography-root": { color: active ? "#fff" : "rgba(255,255,255,0.4)", fontWeight: active ? 600 : 400, fontSize: 13.5, transition: "color 0.15s" } }} />
                        </ListItemButton>
                    );
                })}
            </List>

            {/* Status */}
            <Box sx={{ p: 1.5, mx: 1.5, mb: 1.5, borderRadius: 2, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.1)" }}>
                <Typography sx={{ color: "#22c55e", fontSize: 11, fontWeight: 700 }}>System Online</Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.25)", fontSize: 10, mt: 0.2 }}>All systems operational</Typography>
            </Box>
        </Box>
    );
}
export default Sidebar;
