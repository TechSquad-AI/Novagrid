import React from "react";
import { Box, Typography, Button, Chip } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate("/login"); };

    return (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.5, mb: 1 }}>
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                <Chip size="small" label="Online" sx={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", fontSize: 11, fontWeight: 600, height: 24, border: "1px solid rgba(34,197,94,0.15)" }} />
                <Chip size="small" label="0 Alerts" sx={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 500, height: 24, border: "1px solid rgba(255,255,255,0.06)" }} />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{user?.email || "User"}</Typography>
                <Button variant="outlined" size="small" onClick={handleLogout} sx={{ fontSize: 12, py: 0.5, px: 1.5, textTransform: "none" }}>Logout</Button>
            </Box>
        </Box>
    );
}
export default Navbar;
