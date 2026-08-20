import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../context/SidebarContext";
import Navbar from "../components/Navbar";
import { getDashboardMonitoring } from "../api/services";

function LiveMonitoring() {
    const { open: sidebarOpen } = useSidebar();
    const sidebarMargin = sidebarOpen ? "250px" : "0px";
    const navigate = useNavigate();
    const [monitoring, setMonitoring] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const r = await getDashboardMonitoring();
            setMonitoring(r.monitoring || []);
        } catch {}
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const healthy = monitoring.filter(m => m.status === "healthy").length;
    const unhealthy = monitoring.filter(m => m.status === "unhealthy").length;
    const unchecked = monitoring.filter(m => m.status === "unchecked").length;
    const avgResponse = monitoring.filter(m => m.response_time_ms > 0).reduce((a, b) => a + b.response_time_ms, 0) / Math.max(monitoring.filter(m => m.response_time_ms > 0).length, 1);

    return (
        <Box sx={{ display: "flex", height: "100vh", overflowY: "auto", background: "#f8f9fb" }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, ml: sidebarMargin, p: 3, position: "relative", zIndex: 1 }}>
                <Navbar subtitle="Real-time API monitoring" title="Live Monitoring" />

                <Button size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashboard")} sx={{ color: "#6b7280", mb: 2, textTransform: "none" }}>Back to Dashboard</Button>

                {/* Header + Refresh */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1.5, py: 0.5, borderRadius: 2, background: "rgba(16,185,129,0.08)" }}>
                            <FiberManualRecordIcon sx={{ fontSize: 8, color: "#10b981", animation: "pulse 2s infinite", "@keyframes pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.3 } } }} />
                            <Typography sx={{ color: "#10b981", fontSize: 12, fontWeight: 700 }}>Live</Typography>
                        </Box>
                        <Typography sx={{ color: "#9ca3af", fontSize: 13 }}>Auto-refreshes on page load</Typography>
                    </Box>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData} disabled={loading} sx={{ borderRadius: 2, textTransform: "none" }}>
                        Refresh
                    </Button>
                </Box>

                {/* Stats Row */}
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mb: 3 }}>
                    {[
                        { label: "Total APIs", value: monitoring.length, color: "#1a1f36", bg: "rgba(26,115,232,0.08)" },
                        { label: "Healthy", value: healthy, color: "#0d9488", bg: "rgba(13,148,136,0.08)" },
                        { label: "Unhealthy", value: unhealthy, color: "#dc2626", bg: "rgba(220,38,38,0.08)" },
                        { label: "Avg Response", value: `${Math.round(avgResponse)}ms`, color: "#1a73e8", bg: "rgba(26,115,232,0.08)" },
                    ].map((s, i) => (
                        <Box key={i} sx={{ background: "#fff", borderRadius: 2, p: 2, border: "1px solid #e5e7eb", textAlign: "center" }}>
                            <Typography sx={{ color: "#6b7280", fontSize: 12, fontWeight: 600 }}>{s.label}</Typography>
                            <Typography sx={{ color: s.color, fontSize: 22, fontWeight: 800 }}>{s.value}</Typography>
                        </Box>
                    ))}
                </Box>

                {/* Monitoring Table */}
                <Box sx={{ background: "#fff", borderRadius: 2.5, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ background: "#f9fafb" }}>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 13, color: "#374151" }}>API / Endpoint</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 13, color: "#374151" }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 13, color: "#374151" }}>Response Time</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 13, color: "#374151" }}>HTTP Status</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 13, color: "#374151" }}>Uptime</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 13, color: "#374151" }}>Last Checked</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 13, color: "#374151" }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {monitoring.map((m, i) => (
                                    <TableRow key={i} sx={{ "&:hover": { background: "#f9fafb" }, cursor: "pointer" }} onClick={() => navigate("/analyze-api")}>
                                        <TableCell>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{m.name}</Typography>
                                                <Chip size="small" label="GET" sx={{ fontSize: 10, height: 18, background: "rgba(13,148,136,0.1)", color: "#0d9488", fontWeight: 700 }} />
                                            </Box>
                                            <Typography sx={{ fontSize: 11, color: "#9ca3af", fontFamily: "monospace", mt: 0.3 }}>{m.url}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                <FiberManualRecordIcon sx={{ fontSize: 8, color: m.status === "healthy" ? "#10b981" : m.status === "unchecked" ? "#f59e0b" : "#ef4444" }} />
                                                <Chip size="small" label={m.status === "healthy" ? "200 OK" : m.status === "unchecked" ? "Not Scanned" : m.status}
                                                    sx={{ fontSize: 11, fontWeight: 600, background: m.status === "healthy" ? "rgba(13,148,136,0.1)" : m.status === "unchecked" ? "rgba(245,158,11,0.1)" : "rgba(220,38,38,0.1)", color: m.status === "healthy" ? "#0d9488" : m.status === "unchecked" ? "#f59e0b" : "#dc2626" }} />
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: m.response_time_ms > 300 ? "#dc2626" : m.response_time_ms > 100 ? "#f59e0b" : "#0d9488" }}>
                                                {m.response_time_ms > 0 ? `${m.response_time_ms}ms` : "—"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontSize: 13, color: "#1a1f36" }}>{m.http_status > 0 ? m.http_status : "—"}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ color: m.status === "healthy" ? "#0d9488" : "#dc2626", fontSize: 12, fontWeight: 600 }}>{m.status === "healthy" ? "99.9%" : "—"}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>{m.last_checked && m.last_checked !== "Never" ? new Date(m.last_checked).toLocaleString() : "Never"}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Button size="small" onClick={(e) => { e.stopPropagation(); navigate("/analyze-api"); }} sx={{ color: "#1a73e8", textTransform: "none", fontSize: 12 }}>Analyze</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {monitoring.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} sx={{ textAlign: "center", py: 6, color: "#9ca3af" }}>No APIs registered yet.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                <Typography sx={{ color: "#9ca3af", fontSize: 12, textAlign: "center", py: 2 }}>NovaGrid API Guardian © 2025</Typography>
            </Box>
        </Box>
    );
}
export default LiveMonitoring;
