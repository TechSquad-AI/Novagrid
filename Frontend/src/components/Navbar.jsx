import React from "react";
import { Box, Typography, Button, Chip, IconButton, Tooltip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeContext";
import { useSidebar } from "../context/SidebarContext";
import { useNavigate } from "react-router-dom";

function Navbar({ subtitle, title }) {
    const { user, signOut } = useAuth();
    const { mode, toggleTheme } = useThemeMode();
    const { toggle } = useSidebar();
    const navigate = useNavigate();
    const isDark = mode === "dark";

    const handleLogout = () => { signOut(); navigate("/login"); };

    return (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.5, mb: 1 }}>
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                {/* Hamburger Menu Button - ALWAYS VISIBLE */}
                <IconButton
                    onClick={toggle}
                    aria-label="Toggle sidebar"
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        color: "#1a1f36",
                        background: "#f3f4f6",
                        border: "1px solid #d1d5db",
                        flexShrink: 0,
                        "&:hover": { background: "#e5e7eb", borderColor: "#9ca3af" },
                        "&:active": { background: "#d1d5db" },
                    }}
                >
                    <MenuIcon sx={{ fontSize: 22 }} />
                </IconButton>

                {title && (
                    <Typography sx={{ fontWeight: 700, fontSize: 18, color: "#1a1f36" }}>{title}</Typography>
                )}
                {subtitle && !title && (
                    <Typography sx={{ color: "rgba(0,0,0,0.4)", fontSize: 13 }}>{subtitle}</Typography>
                )}
                {subtitle && title && (
                    <Typography sx={{ color: "rgba(0,0,0,0.35)", fontSize: 12 }}>{subtitle}</Typography>
                )}

                <Chip size="small" label="Live" sx={{
                    background: "rgba(16,185,129,0.1)",
                    color: "#10b981",
                    border: "1px solid rgba(16,185,129,0.15)",
                    fontSize: 11, fontWeight: 600, height: 24
                }} />
                <Chip size="small" label="0 Alerts" sx={{
                    background: "rgba(0,0,0,0.04)",
                    color: "rgba(0,0,0,0.35)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    fontSize: 11, fontWeight: 500, height: 24
                }} />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
                    <IconButton onClick={toggleTheme} size="small" sx={{
                        color: "#4318FF",
                        background: "rgba(67,24,255,0.06)",
                        "&:hover": { background: "rgba(67,24,255,0.12)" }
                    }}>
                        {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                    </IconButton>
                </Tooltip>
                <Typography sx={{ color: "rgba(0,0,0,0.4)", fontSize: 13 }}>{user?.email || "User"}</Typography>
                <Button variant="outlined" size="small" onClick={handleLogout} sx={{ fontSize: 12, py: 0.5, px: 2 }}>Logout</Button>
            </Box>
        </Box>
    );
}
export default Navbar;
