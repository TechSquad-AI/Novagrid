import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, LinearProgress, Alert, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { getDashboardStats, getDashboardMonitoring, getDashboardChanges, getDashboardInsights, getDashboardCharts, registerAPI, checkAPIHealth } from "../api/services";

function StatusDot({ ok }) {
    return <FiberManualRecordIcon sx={{ fontSize: 8, color: ok ? "#10b981" : "#ef4444" }} />;
}

function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total_apis: 0, healthy_apis: 0, changed_apis: 0, critical_apis: 0 });
    const [monitoring, setMonitoring] = useState([]);
    const [changes, setChanges] = useState([]);
    const [insights, setInsights] = useState({ risk_summary: { high: 0, medium: 0, low: 0 }, narrative: "" });
    const [searchQuery, setSearchQuery] = useState("");
    const [scanLoading, setScanLoading] = useState(false);
    const [scanResult, setScanResult] = useState(null);

    useEffect(() => { loadDashboard(); }, []);

    const loadDashboard = async () => {
        setLoading(true);
        try {
            const [s, m, c, i] = await Promise.allSettled([getDashboardStats(), getDashboardMonitoring(), getDashboardChanges(), getDashboardInsights()]);
            if (s.status === "fulfilled") setStats(s.value);
            if (m.status === "fulfilled") setMonitoring(m.value.monitoring || []);
            if (c.status === "fulfilled") setChanges(c.value.changes || []);
            if (i.status === "fulfilled") setInsights(i.value);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleAnalyze = async () => {
        if (!searchQuery) return;
        setScanLoading(true);
        try {
            const created = await registerAPI("Analyzed API", searchQuery);
            if (created.status !== "error" && created.api) {
                const health = await checkAPIHealth(created.api.id);
                setScanResult(health);
                loadDashboard();
                setTimeout(() => navigate("/analyze-api"), 1000);
            }
        } catch (e) { setScanResult({ status: "error", error: e.message }); }
        setScanLoading(false);
    };

    const healthyPct = stats.total_apis ? Math.round((stats.healthy_apis / stats.total_apis) * 100) : 0;
    const changedPct = stats.total_apis ? Math.round((stats.changed_apis / stats.total_apis) * 100) : 0;
    const criticalPct = stats.total_apis ? Math.round((stats.critical_apis / stats.total_apis) * 100) : 0;

    const kpiCards = [
        { label: "Total APIs", value: stats.total_apis, sub: `${stats.total_apis} this week`, color: "#1a73e8", icon: <WebIcon />, trend: "up" },
        { label: "Healthy APIs", value: stats.healthy_apis, sub: `${healthyPct}%`, color: "#0d9488", icon: <CheckCircleIcon />, trend: "up" },
        { label: "Changed APIs", value: stats.changed_apis, sub: `${changedPct}%`, color: "#ea580c", icon: <WarningAmberIcon />, trend: "up" },
        { label: "Critical APIs", value: stats.critical_apis, sub: stats.critical_apis === 0 ? "No change" : `${criticalPct}%`, color: "#dc2626", icon: <ErrorOutlineIcon />, trend: "stable" },
    ];

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", background: "#f0f2f5" }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, ml: "230px", p: 3, position: "relative", zIndex: 1 }}>
                <Navbar subtitle="Welcome back, TechSquad-AI 👋" />

                {/* Search Bar */}
                <Box sx={{ display: "flex", gap: 1.5, mb: 3, background: "#fff", borderRadius: 2, p: 1.5, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
                        <SearchIcon sx={{ color: "#9ca3af" }} />
                        <input
                            placeholder="Search by API name, endpoint or URL (e.g. payment, /users, https://api.example.com/users)"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleAnalyze()}
                            style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#1a1f36", background: "transparent" }}
                        />
                    </Box>
                    <Button variant="contained" onClick={handleAnalyze} disabled={scanLoading || !searchQuery} sx={{ px: 3, borderRadius: 2 }}>Analyze API</Button>
                    <Button variant="outlined" onClick={() => navigate("/analyze-api")} sx={{ px: 3, borderRadius: 2, borderColor: "#1a73e8", color: "#1a73e8" }}>+ New Scan</Button>
                </Box>

                {scanResult && (
                    <Alert severity={scanResult.status === "success" ? "success" : "error"} sx={{ mb: 2 }} onClose={() => setScanResult(null)}>
                        {scanResult.status === "success" ? `Healthy — ${scanResult.health?.response_time_ms}ms` : `Error: ${scanResult.error || scanResult.status}`}
                    </Alert>
                )}

                {loading && <LinearProgress sx={{ mb: 2 }} />}

                {/* KPI Cards */}
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mb: 3 }}>
                    {kpiCards.map((kpi, i) => (
                        <Box key={i} sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "box-shadow 0.2s", "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" } }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                                <Box sx={{ width: 40, height: 40, borderRadius: 2.5, background: `${kpi.color}10`, display: "flex", alignItems: "center", justifyContent: "center", color: kpi.color }}>
                                    {React.cloneElement(kpi.icon, { fontSize: "small" })}
                                </Box>
                                <Typography sx={{ color: "#6b7280", fontSize: 13, fontWeight: 500 }}>{kpi.label}</Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                                <Typography sx={{ color: "#1a1f36", fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{kpi.value}</Typography>
                                <Typography sx={{ color: kpi.trend === "up" ? "#0d9488" : "#6b7280", fontSize: 13, fontWeight: 600 }}>{kpi.sub}</Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>

                {/* Recently Viewed APIs */}
                <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", mb: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#1a1f36" }}>Recently Viewed APIs</Typography>
                        <Button size="small" onClick={() => navigate("/tables")} sx={{ color: "#1a73e8", fontWeight: 600, fontSize: 13 }}>View All</Button>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1.5, overflowX: "auto", pb: 0.5 }}>
                        {monitoring.slice(0, 5).map((m, i) => (
                            <Box key={i} sx={{ minWidth: 160, flex: "0 0 auto", p: 1.5, borderRadius: 2, border: "1px solid #e5e7eb", cursor: "pointer", "&:hover": { borderColor: "#1a73e8" }, transition: "border-color 0.15s" }}
                                onClick={() => navigate("/analyze-api")}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                    <Typography sx={{ color: "#1a1f36", fontSize: 14, fontWeight: 600 }}>{m.name}</Typography>
                                    <Chip size="small" label="GET" sx={{ fontSize: 10, height: 20, background: "rgba(13,148,136,0.1)", color: "#0d9488", fontWeight: 700 }} />
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <Typography sx={{ color: m.status === "healthy" ? "#0d9488" : "#dc2626", fontSize: 12, fontWeight: 600 }}>{m.status === "healthy" ? "200 OK" : m.status}</Typography>
                                    <Typography sx={{ color: "#9ca3af", fontSize: 11 }}>2 min ago</Typography>
                                </Box>
                            </Box>
                        ))}
                        {monitoring.length === 0 && (
                            <Typography sx={{ color: "#9ca3af", fontSize: 13, py: 2 }}>No recently viewed APIs.</Typography>
                        )}
                    </Box>
                </Box>

                {/* Live Monitoring + Recent Changes */}
                <Box sx={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 2, mb: 3 }}>
                    {/* Live Monitoring */}
                    <Box sx={{ background: "#fff", borderRadius: 2.5, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                        <Box sx={{ px: 2.5, pt: 2, pb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#1a1f36" }}>Live Monitoring</Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1, py: 0.2, borderRadius: 1, background: "rgba(16,185,129,0.08)" }}>
                                    <FiberManualRecordIcon sx={{ fontSize: 6, color: "#10b981", animation: "pulse 2s infinite", "@keyframes pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.3 } } }} />
                                    <Typography sx={{ color: "#10b981", fontSize: 11, fontWeight: 600 }}>Live</Typography>
                                </Box>
                            </Box>
                        </Box>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>API / Endpoint</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Response Time</TableCell>
                                        <TableCell>Uptime</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {monitoring.slice(0, 5).map((m, i) => (
                                        <TableRow key={i} sx={{ "&:hover": { background: "#f9fafb" } }}>
                                            <TableCell>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <Typography sx={{ fontWeight: 500, fontSize: 13 }}>{m.name}</Typography>
                                                    <Chip size="small" label="GET" sx={{ fontSize: 10, height: 18, background: "rgba(13,148,136,0.1)", color: "#0d9488", fontWeight: 700 }} />
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                    <StatusDot ok={m.status === "healthy"} />
                                                    <Typography sx={{ color: m.status === "healthy" ? "#0d9488" : "#dc2626", fontSize: 12, fontWeight: 600 }}>{m.status === "healthy" ? "200 OK" : m.status}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ fontSize: 13 }}>{m.response_time_ms}ms</TableCell>
                                            <TableCell>
                                                <Typography sx={{ color: m.status === "healthy" ? "#0d9488" : "#dc2626", fontSize: 12, fontWeight: 600 }}>{m.status === "healthy" ? "99.9%" : "—"}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {monitoring.length === 0 && (
                                        <TableRow><TableCell colSpan={4} sx={{ textAlign: "center", py: 4, color: "#9ca3af" }}>No monitoring data.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Box sx={{ px: 2.5, pb: 1.5, pt: 0.5 }}>
                            <Button size="small" sx={{ color: "#1a73e8", fontWeight: 600, fontSize: 13, textTransform: "none" }} onClick={() => navigate("/tables")}>
                                View Live Monitoring <ArrowForwardIcon sx={{ fontSize: 14, ml: 0.5 }} />
                            </Button>
                        </Box>
                    </Box>

                    {/* Recent Changes */}
                    <Box sx={{ background: "#fff", borderRadius: 2.5, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                        <Box sx={{ px: 2.5, pt: 2, pb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#1a1f36" }}>Recent Changes</Typography>
                            <Button size="small" sx={{ color: "#1a73e8", fontWeight: 600, fontSize: 13 }}>View All</Button>
                        </Box>
                        <Box sx={{ px: 2.5, pb: 2 }}>
                            {changes.length === 0 ? (
                                <Typography sx={{ color: "#9ca3af", fontSize: 13, py: 3, textAlign: "center" }}>No recent changes.</Typography>
                            ) : changes.slice(0, 4).map((c, i) => (
                                <Box key={i} sx={{ py: 1.5, borderBottom: i < changes.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                        <Chip size="small" label={c.severity || "info"} sx={{
                                            fontSize: 10, height: 20, fontWeight: 700,
                                            background: c.severity === "high" ? "rgba(220,38,38,0.08)" : c.severity === "medium" ? "rgba(234,88,12,0.08)" : "rgba(13,148,136,0.08)",
                                            color: c.severity === "high" ? "#dc2626" : c.severity === "medium" ? "#ea580c" : "#0d9488",
                                        }} />
                                        <Typography sx={{ color: "#1a1f36", fontSize: 13, fontWeight: 500 }}>{c.description || c.api_change || "API change"}</Typography>
                                    </Box>
                                    <Typography sx={{ color: "#9ca3af", fontSize: 12 }}>{c.detail || ""}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>

                {/* Alerts + Risk + AI */}
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, mb: 3 }}>
                    {/* Recent Alerts */}
                    <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1a1f36" }}>Recent Alerts</Typography>
                            <Button size="small" sx={{ color: "#1a73e8", fontWeight: 600, fontSize: 12 }}>View All</Button>
                        </Box>
                        {[
                            { icon: <ErrorOutlineIcon sx={{ fontSize: 14, color: "#dc2626" }} />, text: "Breaking change detected in /users", sub: "Response schema changed", time: "2h ago" },
                            { icon: <WarningAmberIcon sx={{ fontSize: 14, color: "#ea580c" }} />, text: "Modified API /payment", sub: "Request body structure changed", time: "5h ago" },
                            { icon: <WarningAmberIcon sx={{ fontSize: 14, color: "#ea580c" }} />, text: "High response time for /order", sub: "Response time is above 3s", time: "10h ago" },
                        ].map((a, i) => (
                            <Box key={i} sx={{ display: "flex", gap: 1, py: 1, borderBottom: i < 2 ? "1px solid #f3f4f6" : "none" }}>
                                {a.icon}
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ color: "#1a1f36", fontSize: 12, fontWeight: 500 }}>{a.text}</Typography>
                                    <Typography sx={{ color: "#9ca3af", fontSize: 11 }}>{a.sub}</Typography>
                                </Box>
                                <Typography sx={{ color: "#9ca3af", fontSize: 11, whiteSpace: "nowrap" }}>{a.time}</Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Risk Summary */}
                    <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1a1f36", mb: 2 }}>Risk Summary</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <Box sx={{ position: "relative", width: 100, height: 100 }}>
                                <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#0d9488" strokeWidth="10" strokeDasharray={`${(stats.healthy_apis / Math.max(stats.total_apis, 1)) * 251} 251`} strokeLinecap="round" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#ea580c" strokeWidth="10" strokeDasharray={`${(stats.changed_apis / Math.max(stats.total_apis, 1)) * 251} 251`} strokeDashoffset={`-${(stats.healthy_apis / Math.max(stats.total_apis, 1)) * 251}`} strokeLinecap="round" />
                                </svg>
                                <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                                    <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#1a1f36" }}>{stats.total_apis}</Typography>
                                    <Typography sx={{ fontSize: 10, color: "#9ca3af" }}>APIs</Typography>
                                </Box>
                            </Box>
                            <Box>
                                {[{ label: "High Risk", count: insights.risk_summary?.high || 0, color: "#dc2626", pct: stats.total_apis ? Math.round((insights.risk_summary?.high || 0) / stats.total_apis * 100) : 0 },
                                { label: "Medium Risk", count: insights.risk_summary?.medium || 0, color: "#ea580c", pct: stats.total_apis ? Math.round((insights.risk_summary?.medium || 0) / stats.total_apis * 100) : 0 },
                                { label: "Low Risk", count: insights.risk_summary?.low || 0, color: "#0d9488", pct: stats.total_apis ? Math.round((insights.risk_summary?.low || 0) / stats.total_apis * 100) : 0 },
                                ].map((r, i) => (
                                    <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                        <FiberManualRecordIcon sx={{ fontSize: 8, color: r.color }} />
                                        <Typography sx={{ color: "#6b7280", fontSize: 12, flex: 1 }}>{r.label}</Typography>
                                        <Typography sx={{ color: "#1a1f36", fontSize: 12, fontWeight: 600 }}>{r.count}</Typography>
                                        <Typography sx={{ color: "#9ca3af", fontSize: 11 }}>({r.pct}%)</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>

                    {/* AI Insight */}
                    <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1a1f36", mb: 1.5 }}>AI Insight</Typography>
                        <Typography sx={{ color: "#374151", fontSize: 13, lineHeight: 1.7, mb: 2 }}>
                            {insights.narrative || "No insights yet. Scan an API to get started."}
                        </Typography>
                        <Button variant="contained" size="small" onClick={() => navigate("/api-changes")} sx={{ borderRadius: 2 }}>
                            View Impact Analysis
                        </Button>
                    </Box>
                </Box>

                {/* Footer */}
                <Typography sx={{ color: "#9ca3af", fontSize: 12, textAlign: "center", py: 2 }}>NovaGrid API Guardian © 2025</Typography>
            </Box>
        </Box>
    );
}

import WebIcon from "@mui/icons-material/Web";
export default Dashboard;
