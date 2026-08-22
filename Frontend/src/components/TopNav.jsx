import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Typography, Button, IconButton, Tooltip } from "@mui/material";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

const NAV = [
    { label: "Endpoint Tree", path: "/tree", Icon: AccountTreeRoundedIcon },
    { label: "Public APIs", path: "/public-apis", Icon: HubRoundedIcon },
];

export default function TopNav() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const logout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <Box
            component="nav"
            sx={{
                display: "flex",
                alignItems: "center",
                height: 56,
                px: 3,
                background: "#0B1437",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                position: "sticky",
                top: 0,
                zIndex: 100,
            }}
        >
            {/* Brand */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mr: 6 }}>
                <Box
                    sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 1.5,
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Typography sx={{ fontSize: 13, fontWeight: 900, color: "#fff", lineHeight: 1 }}>N</Typography>
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: 14, color: "#fff", letterSpacing: -0.3 }}>
                    NovaGrid
                </Typography>
            </Box>

            {/* Nav Items */}
            <Box sx={{ display: "flex", gap: 0.5, flex: 1 }}>
                {NAV.map(({ label, path, Icon }) => {
                    const active = pathname === path;
                    return (
                        <Button
                            key={path}
                            startIcon={<Icon sx={{ fontSize: 17 }} />}
                            onClick={() => navigate(path)}
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: 13,
                                borderRadius: 1.5,
                                px: 2,
                                py: 0.6,
                                gap: 0.75,
                                color: active ? "#fff" : "rgba(255,255,255,0.4)",
                                background: active ? "rgba(99,102,241,0.15)" : "transparent",
                                "&:hover": {
                                    background: active ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                                    color: "#fff",
                                },
                                transition: "all 0.15s",
                            }}
                        >
                            {label}
                        </Button>
                    );
                })}
            </Box>

            {/* Logout */}
            <Tooltip title="Sign out">
                <IconButton
                    onClick={logout}
                    size="small"
                    sx={{
                        color: "rgba(255,255,255,0.25)",
                        "&:hover": { color: "#ef4444", background: "rgba(239,68,68,0.1)" },
                    }}
                >
                    <LogoutRoundedIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </Box>
    );
}
