import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, LinearProgress, Alert } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { getDashboardStats, getDashboardMonitoring, getDashboardChanges, getDashboardInsights, registerAPI, checkAPIHealth } from "../api/services";

/* ── Bento Grid Helpers ── */
const bento = {
    card: {
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16,
        overflow: "visible",
        transition: "border-color 0.2s, box-shadow 0.2s",
        "&:hover": {
            borderColor: "rgba(255,255,255,0.12)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
        },
    },
    label: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", mb: 0.5 },
    bigNum: { color: "#fff", fontSize: 36, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.02em" },
    accent: { color: "#f5a623" },
};

const grid = `
    "kpi1 kpi1 kpi2 kpi2 kpi3 kpi3 kpi4 kpi4"
    "score score score score issues issues risk risk"
    "table table table table table table ai    ai"
    "changes changes changes changes changes changes changes changes"
    / 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr
`;

function fmtDate(d) {
    if (!d || d === "Never" || d === "") return "Never";
    try { const dt = new Date(d); return isNaN(dt.getTime()) ? "---" : dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
    catch { return "---"; }
}

function BentoCard({ gridArea, children, sx = {} }) {
    return (
        <Box sx={{ ...bento.card, gridArea, p: 2.5, display: "flex", flexDirection: "column", ...sx }}>
            {children}
        </Box>
    );
}

/* ── KPI Tiles ── */
function KpiTile({ label, value, color }) {
    return (
        <Box>
            <Typography sx={bento.label}>{label}</Typography>
            <Typography sx={{ ...bento.bigNum, color: color || "#fff" }}>{value}</Typography>
        </Box>
    );
}

/* ── Main Dashboard ── */
function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total_apis: 0, healthy_apis: 0, changed_apis: 0, critical_apis: 0 });
    const [monitoring, setMonitoring] = useState([]);
    const [changes, setChanges] = useState([]);
    const [insights, setInsights] = useState({ risk_summary: { high: 0, medium: 0, low: 0 }, narrative: "" });
    const [apiName, setApiName] = useState("");
    const [apiUrl, setApiUrl] = useState("");
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

    const handleScan = async () => {
        setScanLoading(true); setScanResult(null);
        try {
            const created = await registerAPI(apiName, apiUrl);
            const health = await checkAPIHealth(created.api.id);
            setScanResult(health); loadDashboard();
        } catch (e) { setScanResult({ status: "error", error: e.message }); }
        setScanLoading(false);
    };

    const hasData = stats.total_apis > 0 && (stats.healthy_apis > 0 || stats.changed_apis > 0);
    const compliance = hasData ? Math.round((stats.healthy_apis / stats.total_apis) * 100) : -1;
    const grade = compliance < 0 ? "-" : compliance >= 90 ? "A" : compliance >= 70 ? "B" : compliance >= 50 ? "C" : "D";
    const gradeColor = compliance < 0 ? "rgba(255,255,255,0.2)" : compliance >= 90 ? "#22c55e" : compliance >= 70 ? "#3b82f6" : compliance >= 50 ? "#f5a623" : "#ef4444";

    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, ml: "260px", p: 3 }}>
                <Navbar />

                {/* ── Header ── */}
                <Box sx={{ mb: 3, mt: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>Dashboard</Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 14, mt: 0.5 }}>Monitor, detect and repair API changes automatically</Typography>
                </Box>

                {/* ── Scan Bar ── */}
                <Box sx={{ ...bento.card, p: 1.5, mb: 2.5, display: "flex", gap: 1.5, alignItems: "center" }}>
                    <input placeholder="API name" value={apiName} onChange={e => setApiName(e.target.value)}
                        style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, outline: "none" }} />
                    <input placeholder="https://api.example.com" value={apiUrl} onChange={e => setApiUrl(e.target.value)}
                        style={{ flex: 2, padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, outline: "none" }} />
                    <Button variant="contained" onClick={handleScan} disabled={scanLoading || !apiName || !apiUrl}
                        sx={{ px: 4, py: 1.3, fontSize: 14, whiteSpace: "nowrap" }}>
                        {scanLoading ? "Scanning…" : "Scan API"}
                    </Button>
                </Box>

                {scanResult && (
                    <Alert severity={scanResult.status === "success" ? "success" : "error"} sx={{ mb: 2, borderRadius: 3, background: "rgba(255,255,255,0.04)", color: "#fff", border: "1px solid rgba(255,255,255,0.06)" }}>
                        {scanResult.status === "success" ? `Healthy — ${scanResult.health?.response_time_ms}ms` : `Failed: ${scanResult.error || scanResult.status}`}
                    </Alert>
                )}

                {loading && <LinearProgress sx={{ mb: 2, borderRadius: 2 }} />}

                {/* ═══════════════════════════════════════
                    BENTO GRID
                ═══════════════════════════════════════ */}
                <Box sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(8, 1fr)",
                    gridAutoRows: "minmax(60px, auto)",
                    gap: 1.5,
                    alignItems: "stretch",
                }}>
                    {/* ── Row 1: KPI Tiles ── */}
                    <Box sx={{ gridColumn: "span 2", ...bento.card, p: 2.5 }}>
                        <KpiTile label="Total APIs" value={stats.total_apis} color="#3b82f6" />
                    </Box>
                    <Box sx={{ gridColumn: "span 2", ...bento.card, p: 2.5 }}>
                        <KpiTile label="Healthy" value={stats.healthy_apis} color="#22c55e" />
                    </Box>
                    <Box sx={{ gridColumn: "span 2", ...bento.card, p: 2.5 }}>
                        <KpiTile label="Changed" value={stats.changed_apis} color="#f5a623" />
                    </Box>
                    <Box sx={{ gridColumn: "span 2", ...bento.card, p: 2.5 }}>
                        <KpiTile label="Compliance" value={compliance >= 0 ? `${compliance}%` : "N/A"} color={gradeColor} />
                    </Box>

                    {/* ── Row 2 Left: Overall Score (4 cols, tall) ── */}
                    <Box sx={{ gridColumn: "span 4", gridRow: "span 2", ...bento.card, p: 3, display: "flex", alignItems: "center", gap: 3 }}>
                        <Box sx={{
                            width: 80, height: 80, borderRadius: "50%",
                            border: `4px solid ${gradeColor}`,
                            display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
                            flexShrink: 0,
                        }}>
                            <Typography sx={{ color: gradeColor, fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{grade}</Typography>
                            <Typography sx={{ color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 600 }}>{compliance >= 0 ? `${compliance}/100` : "No data"}</Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 16, mb: 0.5 }}>Overall Score</Typography>
                            <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 13, mb: 2 }}>API Health Rating</Typography>
                            <Box sx={{ display: "flex", gap: 1.5 }}>
                                {[{ l: "Design", g: hasData ? (stats.healthy_apis > 0 ? "A" : "C") : "-" }, { l: "Security", g: hasData ? (stats.critical_apis === 0 ? "B" : "D") : "-" }, { l: "Performance", g: grade }].map((s, i) => (
                                    <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, background: "rgba(255,255,255,0.04)", px: 1.5, py: 0.7, borderRadius: 2, border: "1px solid rgba(255,255,255,0.06)" }}>
                                        <Box sx={{ width: 26, height: 26, borderRadius: 1.5, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.5)" }}>{s.g}</Box>
                                        <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 500 }}>{s.l}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>

                    {/* ── Row 2 Right Top: Issues ── */}
                    <Box sx={{ gridColumn: "span 2", ...bento.card, p: 2.5, textAlign: "center", justifyContent: "center", display: "flex", flexDirection: "column" }}>
                        <Typography sx={{ fontSize: 42, fontWeight: 800, color: "#ef4444" }}>{stats.critical_apis + stats.changed_apis}</Typography>
                        <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 13, fontWeight: 500 }}>Issues Detected</Typography>
                    </Box>

                    {/* ── Row 2 Right: Risk Summary ── */}
                    <Box sx={{ gridColumn: "span 2", ...bento.card, p: 2.5, display: "flex", flexDirection: "column" }}>
                        <Typography sx={{ ...bento.label, mb: 1.5 }}>Risk Summary</Typography>
                        <Box sx={{ display: "flex", gap: 1, flex: 1, alignItems: "center" }}>
                            {[{ l: "High", v: insights.risk_summary?.high || 0, c: "#ef4444" }, { l: "Med", v: insights.risk_summary?.medium || 0, c: "#f5a623" }, { l: "Low", v: insights.risk_summary?.low || 0, c: "#22c55e" }].map((r, i) => (
                                <Box key={i} sx={{ flex: 1, textAlign: "center", py: 1.2, borderRadius: 2, background: `${r.c}08`, border: `1px solid ${r.c}15` }}>
                                    <Typography sx={{ color: r.c, fontSize: 22, fontWeight: 800 }}>{r.v}</Typography>
                                    <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 600 }}>{r.l}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* ── Row 3 Left: Recent Requests Table (6 cols, tall) ── */}
                    <Box sx={{ gridColumn: "span 6", gridRow: "span 1", ...bento.card, p: 0, overflow: "visible", display: "flex", flexDirection: "column" }}>
                        <Box sx={{ px: 2.5, pt: 2.5, pb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Recent Requests</Typography>
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                                {["24H", "72H", "1W"].map(t => (
                                    <Box key={t} sx={{
                                        px: 1.8, py: 0.5, borderRadius: 2, fontSize: 12, fontWeight: 600, cursor: "pointer",
                                        background: t === "24H" ? "rgba(245,166,35,0.12)" : "transparent",
                                        color: t === "24H" ? "#f5a623" : "rgba(255,255,255,0.3)",
                                        "&:hover": { background: "rgba(255,255,255,0.04)" },
                                    }}>{t}</Box>
                                ))}
                            </Box>
                        </Box>
                        <TableContainer sx={{ flex: 1 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        {["Method", "Status", "Name", "Response", "Threat", "Time"].map(h => (
                                            <TableCell key={h} sx={{ color: "rgba(255,255,255,0.3)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{h}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {monitoring.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} sx={{ color: "rgba(255,255,255,0.2)", textAlign: "center", py: 6, borderBottom: "none" }}>No requests yet. Scan an API to begin.</TableCell></TableRow>
                                    ) : monitoring.slice(0, 10).map((m, i) => {
                                        const ok = m.status === "healthy";
                                        return (
                                            <TableRow key={i} sx={{ "&:hover": { background: "rgba(255,255,255,0.02)" } }}>
                                                <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                                                    <Box sx={{ display: "inline-block", px: 1, py: 0.2, borderRadius: 1, background: "rgba(34,197,94,0.1)", color: "#22c55e", fontSize: 11, fontWeight: 700, fontFamily: "monospace" }}>GET</Box>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                                                    <Chip size="small" label={m.status} sx={{ fontSize: 11, height: 22, background: ok ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)", color: ok ? "#22c55e" : "rgba(255,255,255,0.35)" }} />
                                                </TableCell>
                                                <TableCell sx={{ color: "#fff", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>{m.name}</TableCell>
                                                <TableCell sx={{ color: "rgba(255,255,255,0.5)", fontSize: 13, borderBottom: "1px solid rgba(255,255,255,0.03)" }}>{m.response_time_ms}ms</TableCell>
                                                <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                                                    <Chip size="small" label={ok ? "Low" : m.status === "unchecked" ? "—" : "High"} sx={{ fontSize: 11, height: 22, background: ok ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.03)", color: ok ? "#22c55e" : "rgba(255,255,255,0.25)" }} />
                                                </TableCell>
                                                <TableCell sx={{ color: "rgba(255,255,255,0.3)", fontSize: 12, borderBottom: "1px solid rgba(255,255,255,0.03)" }}>{fmtDate(m.last_checked)}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>

                    {/* ── Row 3 Right: AI Insight (2 cols) ── */}
                    <Box sx={{ gridColumn: "span 2", gridRow: "span 1", ...bento.card, p: 2.5, display: "flex", flexDirection: "column" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "#f5a623", boxShadow: "0 0 8px rgba(245,166,35,0.4)", animation: "pulse 2s infinite", "@keyframes pulse": { "0%,100%": { opacity: 0.5 }, "50%": { opacity: 1 } } }} />
                            <Typography sx={{ ...bento.label, mb: 0 }}>AI Insight</Typography>
                        </Box>
                        <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.7, flex: 1 }}>
                            {insights.narrative || "No insights yet. Scan an API to get started."}
                        </Typography>
                        <Button variant="text" size="small" onClick={() => navigate("/api-changes")} sx={{ mt: 1, color: "#f5a623", fontWeight: 600, fontSize: 13, justifyContent: "flex-start" }}>
                            View Impact Analysis →
                        </Button>
                    </Box>

                    {/* ── Row 4: Recent Changes (full width) ── */}
                    <Box sx={{ gridColumn: "span 8", ...bento.card, p: 2.5 }}>
                        <Typography sx={{ ...bento.label, mb: 1.5 }}>Recent Changes</Typography>
                        {changes.length === 0 ? (
                            <Box sx={{ textAlign: "center", py: 3, color: "rgba(255,255,255,0.2)", fontSize: 14 }}>No changes detected yet.</Box>
                        ) : (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
                                {changes.slice(0, 6).map((c, i) => (
                                    <Box key={i} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.5, borderBottom: i < Math.min(changes.length, 6) - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", "&:hover": { background: "rgba(255,255,255,0.02)", borderRadius: 2, mx: -1, px: 1 }, transition: "background 0.15s" }}>
                                        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                                            <Chip size="small" label={c.severity || "info"} sx={{
                                                fontSize: 11, height: 22, fontWeight: 600,
                                                background: c.severity === "high" ? "rgba(239,68,68,0.1)" : c.severity === "medium" ? "rgba(245,166,35,0.1)" : "rgba(34,197,94,0.1)",
                                                color: c.severity === "high" ? "#ef4444" : c.severity === "medium" ? "#f5a623" : "#22c55e",
                                            }} />
                                            <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>{c.description || c.api_change || "API change detected"}</Typography>
                                        </Box>
                                        <Typography sx={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>{fmtDate(c.created_at)}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
export default Dashboard;
