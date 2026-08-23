import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box, Typography, Card, CardContent, Chip, CircularProgress,
    Alert, Button, Table, TableBody, TableCell, TableHead, TableRow,
} from "@mui/material";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import DifferenceRoundedIcon from "@mui/icons-material/DifferenceRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { getChangeReports, listPublicAPIs } from "../api/services";

const MC = { GET: "#10b981", POST: "#6366f1", PUT: "#f59e0b", PATCH: "#f59e0b", DELETE: "#ef4444" };

export default function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState(null);
    const [apiCount, setApiCount] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const [r, apis] = await Promise.allSettled([getChangeReports(), listPublicAPIs()]);
                if (r.status === "fulfilled") setReports(r.value);
                if (apis.status === "fulfilled") setApiCount((apis.value?.apis || []).length);
            } catch { setError("Failed to load dashboard"); }
            setLoading(false);
        })();
    }, []);

    if (loading) return (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 16 }}>
            <CircularProgress size={28} sx={{ color: "#6366f1" }} />
        </Box>
    );

    const pending = reports?.reports || [];
    const pendingCount = Array.isArray(pending) ? pending.length : 0;

    const kpis = [
        { label: "Monitored APIs", value: apiCount, color: "#10b981" },
        { label: "Changes Detected", value: pendingCount, color: pendingCount > 0 ? "#ef4444" : "#10b981" },
        { label: "Pending Review", value: pendingCount, color: pendingCount > 0 ? "#f59e0b" : "#10b981" },
    ];

    const quickActions = [
        { label: "Public APIs", desc: "Register and monitor OpenAPI specs", path: "/public-apis", color: "#10b981", icon: <HubRoundedIcon /> },
        { label: "Impact Analysis", desc: "Detect breaking changes", path: "/impact", color: "#f59e0b", icon: <DifferenceRoundedIcon /> },
        { label: "Human Validation", desc: "Approve or reject changes", path: "/human-validation", color: "#8b5cf6", icon: <span style={{fontSize:18}}>\u2714</span> },
        { label: "History", desc: "View audit trail of changes", path: "/history", color: "#64748b", icon: <HistoryRoundedIcon /> },
    ];

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: 22, color: "#0f172a" }}>Dashboard</Typography>
                    <Typography sx={{ color: "#94a3b8", fontSize: 12, mt: 0.3 }}>
                        NovaGrid API Guardian — Overview of your API monitoring
                    </Typography>
                </Box>
            </Box>

            {/* KPI Cards */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)", md: "repeat(7, 1fr)" }, gap: 1.5, mb: 4 }}>
                {kpis.map((k) => (
                    <Card key={k.label} sx={{ p: 2, textAlign: "center", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                        <Typography sx={{ fontSize: 28, fontWeight: 800, color: k.color, lineHeight: 1.1 }}>{k.value}</Typography>
                        <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, mt: 0.5, textTransform: "uppercase", letterSpacing: 0.3 }}>{k.label}</Typography>
                    </Card>
                ))}
            </Box>

            {/* Quick Actions */}
            <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#0f172a", mb: 1.5 }}>Quick Actions</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 1.5, mb: 4 }}>
                {quickActions.map((a) => (
                    <Card key={a.label}
                        onClick={() => navigate(a.path)}
                        sx={{
                            p: 2, borderRadius: 2, border: "1px solid #e2e8f0", cursor: "pointer",
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            transition: "all 0.15s",
                            "&:hover": { borderColor: a.color, boxShadow: `0 0 0 1px ${a.color}20`, transform: "translateY(-1px)" },
                        }}
                    >
                        <Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                                <Box sx={{ color: a.color, display: "flex" }}>{a.icon}</Box>
                                <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{a.label}</Typography>
                            </Box>
                            <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>{a.desc}</Typography>
                        </Box>
                        <ArrowForwardRoundedIcon sx={{ fontSize: 18, color: "#d1d5db" }} />
                    </Card>
                ))}
            </Box>

            {/* System Status */}
            <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#0f172a", mb: 1.5 }}>System Status</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1.5 }}>
                {[
                    { label: "Backend API", status: "Running", ok: true },
                    { label: "Database", status: "Connected", ok: true },
                    { label: "viaSocket", status: "Active", ok: true },
                ].map((s) => (
                    <Card key={s.label} sx={{ p: 2, borderRadius: 2, border: "1px solid #e2e8f0" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{s.label}</Typography>
                            <Chip size="small" label={s.status} sx={{
                                fontSize: 9, height: 18, fontWeight: 700,
                                background: s.ok ? "#ecfdf5" : "#fef2f2",
                                color: s.ok ? "#059669" : "#dc2626",
                            }} />
                        </Box>
                    </Card>
                ))}
            </Box>
        </Box>
    );
}
