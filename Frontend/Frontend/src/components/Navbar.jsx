import React, { useState } from "react";
import { Box, Typography, IconButton, Badge, Avatar, Tooltip } from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

function Navbar({ title, subtitle }) {
    const { user, signOut } = useAuth();
    const { mode, toggleTheme } = useThemeMode();
    const navigate = useNavigate();
    const isDark = mode === "dark";

    return (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.5, mb: 1 }}>
            {/* Left: Breadcrumb */}
            <Box>
                {subtitle && (
                    <Typography sx={{ color: "#9ca3af", fontSize: 13, mb: 0.3 }}>{subtitle}</Typography>
                )}
                {title && (
                    <Typography sx={{ color: "#1a1f36", fontSize: 22, fontWeight: 700 }}>{title}</Typography>
                )}
            </Box>

            {/* Right: Actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1.5, py: 0.5, borderRadius: 2, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)" }}>
                    <FiberManualRecordIcon sx={{ color: "#10b981", fontSize: 8 }} />
                    <Typography sx={{ color: "#10b981", fontSize: 12, fontWeight: 600 }}>Live</Typography>
                </Box>

                <Tooltip title="Notifications">
                    <IconButton size="small" sx={{ color: "#6b7280" }}>
                        <Badge badgeContent={3} color="error" sx={{ "& .MuiBadge-badge": { fontSize: 10, height: 16, minWidth: 16 } }}>
                            <NotificationsNoneIcon fontSize="small" />
                        </Badge>
                    </IconButton>
                </Tooltip>

                <Tooltip title={isDark ? "Light mode" : "Dark mode"}>
                    <IconButton size="small" onClick={toggleTheme} sx={{ color: "#6b7280" }}>
                        {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                    </IconButton>
                </Tooltip>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }} onClick={() => navigate("/profile")}>
                    <Avatar sx={{ width: 32, height: 32, background: "#1a73e8", fontSize: 13, fontWeight: 700 }}>
                        {(user?.email || "U").charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography sx={{ color: "#1a1f36", fontSize: 13, fontWeight: 600 }}>{user?.email?.split("@")[0] || "User"}</Typography>
                        <Typography sx={{ color: "#9ca3af", fontSize: 11 }}>Team</Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
export default Navbar;
