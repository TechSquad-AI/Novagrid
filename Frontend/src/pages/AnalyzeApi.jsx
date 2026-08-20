import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Chip, Button, TextField, Alert, LinearProgress, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import TimelineIcon from "@mui/icons-material/Timeline";
import CodeIcon from "@mui/icons-material/Code";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import RefreshIcon from "@mui/icons-material/Refresh";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../context/SidebarContext";
import Navbar from "../components/Navbar";
import { registerAPI, checkAPIHealth, getImpactAnalysis, getDependencies } from "../api/services";

function AnalyzeApi() {
    const { open: sidebarOpen } = useSidebar();
    const sidebarMargin = sidebarOpen ? "250px" : "0px";
    const navigate = useNavigate();
    const [apiName, setApiName] = useState("");
    const [apiUrl, setApiUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [impact, setImpact] = useState(null);
    const [deps, setDeps] = useState(null);

    const handleAnalyze = async () => {
        if (!apiName || !apiUrl) return;
        setLoading(true); setResult(null);
        try {
            const created = await registerAPI(apiName, apiUrl);
            if (created.status === "error") throw new Error(created.message);
            const health = await checkAPIHealth(created.api.id);
            setResult({ api: created.api, health: health.health || health });
            try { const imp = await getImpactAnalysis(created.api.id); setImpact(imp); } catch {}
            try { const d = await getDependencies(created.api.id); setDeps(d); } catch {}
        } catch (e) { setResult({ error: e.message }); }
        setLoading(false);
    };

    const healthy = result?.health?.status === "healthy";

    return (
        <Box sx={{ display: "flex", height: "100vh", overflowY: "auto", background: "#f8f9fb" }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, ml: sidebarMargin, p: 3, position: "relative", zIndex: 1 }}>
                <Navbar subtitle="Analyze a specific API" />

                {/* Search */}
                <Box sx={{ display: "flex", gap: 1.5, mb: 3, background: "#fff", borderRadius: 2, p: 1.5, border: "1px solid #e5e7eb" }}>
                    <TextField fullWidth size="small" placeholder="API name" value={apiName} onChange={e => setApiName(e.target.value)}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                    <TextField fullWidth size="small" placeholder="https://api.example.com" value={apiUrl} onChange={e => setApiUrl(e.target.value)}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                    <Button variant="contained" onClick={handleAnalyze} disabled={loading || !apiName || !apiUrl} sx={{ px: 4 }}>Analyze API</Button>
                </Box>

                {loading && <LinearProgress sx={{ mb: 2 }} />}

                {result?.error && <Alert severity="error" sx={{ mb: 2 }}>{result.error}</Alert>}

                {result?.api && (
                    <>
                        {/* Header */}
                        <Box sx={{ mb: 2 }}>
                            <Button size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashboard")} sx={{ color: "#6b7280", mb: 1, textTransform: "none" }}>Back to Dashboard</Button>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                        <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#1a1f36" }}>API Analysis: {result.api.name}</Typography>
                                        <Chip size="small" label={healthy ? "Healthy" : "Unhealthy"}
                                            sx={{ background: healthy ? "rgba(13,148,136,0.1)" : "rgba(220,38,38,0.1)", color: healthy ? "#0d9488" : "#dc2626", fontWeight: 700 }} />
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                                        <Chip size="small" label="POST" sx={{ fontSize: 10, height: 20, background: "rgba(26,115,232,0.1)", color: "#1a73e8", fontWeight: 700 }} />
                                        <Typography sx={{ color: "#6b7280", fontSize: 13, fontFamily: "monospace" }}>{result.api.base_url}</Typography>
                                        <IconButton size="small"><ContentCopyIcon sx={{ fontSize: 14, color: "#9ca3af" }} /></IconButton>
                                    </Box>
                                </Box>
                                <Box sx={{ textAlign: "right" }}>
                                    <Typography sx={{ color: "#9ca3af", fontSize: 12 }}>Last checked: Just now</Typography>
                                    <Button size="small" startIcon={<RefreshIcon />} onClick={handleAnalyze} sx={{ color: "#1a73e8", textTransform: "none", fontWeight: 600 }}>Recheck API</Button>
                                </Box>
                            </Box>
                        </Box>

                        {/* KPI Row */}
                        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mb: 3 }}>
                            {[
                                { label: "Status", value: healthy ? "200 OK" : "Error", sub: healthy ? "Success" : "Failed", color: healthy ? "#0d9488" : "#dc2626", bg: healthy ? "rgba(13,148,136,0.1)" : "rgba(220,38,38,0.1)" },
                                { label: "Response Time", value: `${result.health?.response_time_ms || 0}ms`, sub: "Average", color: "#1a73e8", bg: "rgba(26,115,232,0.1)" },
                                { label: "Uptime (24h)", value: healthy ? "99.8%" : "0%", sub: healthy ? "Excellent" : "Poor", color: "#0d9488", bg: "rgba(13,148,136,0.1)" },
                                { label: "Risk Level", value: impact?.severity || "Unknown", sub: "Risk assessment", color: impact?.severity === "high" ? "#dc2626" : "#0d9488", bg: impact?.severity === "high" ? "rgba(220,38,38,0.1)" : "rgba(13,148,136,0.1)" },
                            ].map((k, i) => (
                                <Box key={i} sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                        <Box sx={{ width: 32, height: 32, borderRadius: 2, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            {i === 0 && <CheckCircleIcon sx={{ fontSize: 16, color: k.color }} />}
                                            {i === 1 && <TimelineIcon sx={{ fontSize: 16, color: k.color }} />}
                                            {i === 2 && <TimelineIcon sx={{ fontSize: 16, color: k.color }} />}
                                            {i === 3 && <WarningAmberIcon sx={{ fontSize: 16, color: k.color }} />}
                                        </Box>
                                        <Typography sx={{ color: "#6b7280", fontSize: 12, fontWeight: 500 }}>{k.label}</Typography>
                                    </Box>
                                    <Typography sx={{ color: k.color, fontSize: 24, fontWeight: 800 }}>{k.value}</Typography>
                                    <Typography sx={{ color: "#9ca3af", fontSize: 12 }}>{k.sub}</Typography>
                                </Box>
                            ))}
                        </Box>

                        {/* Request / Response / Dependencies */}
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, mb: 3 }}>
                            <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                                    <CodeIcon sx={{ color: "#1a73e8", fontSize: 18 }} />
                                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1a1f36" }}>Request</Typography>
                                </Box>
                                <Typography sx={{ color: "#6b7280", fontSize: 12, mb: 1 }}>Method: POST</Typography>
                                <Typography sx={{ color: "#6b7280", fontSize: 12, mb: 1 }}>Content-Type: application/json</Typography>
                                <Box sx={{ background: "#0f172a", borderRadius: 2, p: 2, mt: 1 }}>
                                    <pre style={{ color: "#a5f3fc", fontSize: 12, margin: 0, fontFamily: "monospace" }}>{'{"amount": 100, "currency": "INR"}'}</pre>
                                </Box>
                                <Button size="small" sx={{ mt: 1, color: "#1a73e8", textTransform: "none", fontSize: 12 }}>View Full Request</Button>
                            </Box>
                            <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                                    <CodeIcon sx={{ color: "#0d9488", fontSize: 18 }} />
                                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1a1f36" }}>Response</Typography>
                                </Box>
                                <Typography sx={{ color: "#6b7280", fontSize: 12, mb: 1 }}>Status: {healthy ? "200 OK" : "Error"}</Typography>
                                <Typography sx={{ color: "#6b7280", fontSize: 12, mb: 1 }}>Content-Type: application/json</Typography>
                                <Box sx={{ background: "#0f172a", borderRadius: 2, p: 2, mt: 1 }}>
                                    <pre style={{ color: "#86efac", fontSize: 12, margin: 0, fontFamily: "monospace" }}>{'{"id": 123, "status": "success", "message": "Payment processed"}'}</pre>
                                </Box>
                                <Button size="small" sx={{ mt: 1, color: "#1a73e8", textTransform: "none", fontSize: 12 }}>View Full Response</Button>
                            </Box>
                            <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                                    <CodeIcon sx={{ color: "#ea580c", fontSize: 18 }} />
                                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1a1f36" }}>Code Dependencies</Typography>
                                    <Chip size="small" label={`${deps?.nodes?.length || 0} files`} sx={{ ml: "auto", fontSize: 10, height: 20, background: "rgba(234,88,12,0.1)", color: "#ea580c" }} />
                                </Box>
                                {(deps?.nodes || []).slice(1, 4).map((n, i) => (
                                    <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, py: 1, borderBottom: "1px solid #f3f4f6" }}>
                                        <Box sx={{ width: 28, height: 28, borderRadius: 1.5, background: "rgba(234,88,12,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <CodeIcon sx={{ fontSize: 14, color: "#ea580c" }} />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography sx={{ fontSize: 13, color: "#1a1f36", fontWeight: 500 }}>{n.label}</Typography>
                                            <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>Line 3</Typography>
                                        </Box>
                                    </Box>
                                ))}
                                <Button size="small" onClick={() => navigate("/api-changes")} sx={{ mt: 1, color: "#1a73e8", textTransform: "none", fontSize: 12 }}>View All Dependencies</Button>
                            </Box>
                        </Box>

                        {/* Live Monitoring + Recent Changes + Impact */}
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, mb: 3 }}>
                            <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                    <FiberManualRecordIcon sx={{ fontSize: 6, color: "#10b981" }} />
                                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1a1f36" }}>Live Monitoring</Typography>
                                    <Chip size="small" label="Live" sx={{ fontSize: 10, height: 18, background: "rgba(16,185,129,0.1)", color: "#10b981", ml: "auto" }} />
                                </Box>
                                <Typography sx={{ color: "#6b7280", fontSize: 12 }}>Response Time (ms)</Typography>
                                <Box sx={{ height: 100, background: "#f9fafb", borderRadius: 2, mt: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Typography sx={{ color: "#9ca3af", fontSize: 12 }}>Chart placeholder</Typography>
                                </Box>
                                <Box sx={{ mt: 1, display: "flex", justifyContent: "space-between" }}>
                                    <Typography sx={{ color: "#6b7280", fontSize: 11 }}>Current Status</Typography>
                                    <Typography sx={{ color: "#0d9488", fontSize: 11, fontWeight: 600 }}>200 OK</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1a1f36" }}>Recent Changes</Typography>
                                    <Chip size="small" label="Modified" sx={{ fontSize: 10, height: 18, background: "rgba(234,88,12,0.1)", color: "#ea580c", ml: "auto" }} />
                                </Box>
                                <Typography sx={{ color: "#1a1f36", fontSize: 13, fontWeight: 500, mb: 0.5 }}>Request body modified</Typography>
                                <Typography sx={{ color: "#6b7280", fontSize: 12, mb: 1 }}>Added: currency</Typography>
                                <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                                    <Box sx={{ flex: 1, background: "#0f172a", borderRadius: 1.5, p: 1.5 }}>
                                        <Typography sx={{ color: "#fca5a5", fontSize: 11, fontFamily: "monospace" }}>{"{ amount: 100 }"}</Typography>
                                    </Box>
                                    <Typography sx={{ color: "#9ca3af", alignSelf: "center" }}>→</Typography>
                                    <Box sx={{ flex: 1, background: "#0f172a", borderRadius: 1.5, p: 1.5 }}>
                                        <Typography sx={{ color: "#86efac", fontSize: 11, fontFamily: "monospace" }}>{"{ amount: 100, currency: \"INR\" }"}</Typography>
                                    </Box>
                                </Box>
                                <Typography sx={{ color: "#9ca3af", fontSize: 11, mt: 1 }}>Changed 5 min ago</Typography>
                                <Button size="small" onClick={() => navigate("/api-changes")} sx={{ mt: 1, color: "#1a73e8", textTransform: "none", fontSize: 12 }}>View All Changes</Button>
                            </Box>
                            <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                    <WarningAmberIcon sx={{ fontSize: 16, color: "#dc2626" }} />
                                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1a1f36" }}>Impact Analysis</Typography>
                                    <Chip size="small" label="High Risk" sx={{ fontSize: 10, height: 18, background: "rgba(220,38,38,0.1)", color: "#dc2626", ml: "auto" }} />
                                </Box>
                                <Typography sx={{ color: "#6b7280", fontSize: 12, mb: 1.5 }}>Potentially affected:</Typography>
                                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, mb: 1.5 }}>
                                    {[{ l: "Files", v: impact?.affected_files?.length || 0 }, { l: "Functions", v: impact?.affected_functions?.length || 0 }, { l: "Tests", v: impact?.affected_tests?.length || 0 }].map((s, i) => (
                                        <Box key={i} sx={{ textAlign: "center", py: 1, borderRadius: 1.5, background: "#f9fafb" }}>
                                            <Typography sx={{ color: "#1a1f36", fontSize: 16, fontWeight: 800 }}>{s.v}</Typography>
                                            <Typography sx={{ color: "#9ca3af", fontSize: 11 }}>{s.l}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                                <Typography sx={{ color: "#6b7280", fontSize: 12, mb: 1 }}>This change may break existing functionality in the files listed above.</Typography>
                                <Button size="small" onClick={() => navigate("/api-changes")} sx={{ color: "#1a73e8", textTransform: "none", fontSize: 12 }}>View Affected Code</Button>
                            </Box>
                        </Box>

                        {/* AI Recommendation + Test Results */}
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3 }}>
                            <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1a1f36" }}>AI Recommendation</Typography>
                                </Box>
                                <Typography sx={{ color: "#374151", fontSize: 13, lineHeight: 1.7, mb: 1 }}>
                                    The payment API request body has changed. 2 files may require updates.
                                </Typography>
                                <Typography sx={{ color: "#374151", fontSize: 13, lineHeight: 1.7, mb: 2 }}>
                                    Recommended action: Update the request payload to include the new field "currency".
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                                    <Box>
                                        <Typography sx={{ color: "#6b7280", fontSize: 11 }}>Confidence Score</Typography>
                                        <Typography sx={{ color: "#1a1f36", fontSize: 20, fontWeight: 800 }}>92%</Typography>
                                        <Typography sx={{ color: "#0d9488", fontSize: 11, fontWeight: 600 }}>High</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                    <Button variant="contained" size="small" onClick={() => navigate("/ai-fix")} sx={{ textTransform: "none" }}>Generate Fix</Button>
                                    <Button variant="outlined" size="small" sx={{ textTransform: "none" }}>View Suggested Code</Button>
                                </Box>
                            </Box>
                            <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb" }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1a1f36", mb: 1.5 }}>Test Results (After Fix)</Typography>
                                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, mb: 2 }}>
                                    {[{ l: "Total Tests", v: 12, c: "#1a1f36" }, { l: "Passed", v: 12, c: "#0d9488" }, { l: "Failed", v: 0, c: "#dc2626" }, { l: "Skipped", v: 0, c: "#6b7280" }].map((t, i) => (
                                        <Box key={i} sx={{ textAlign: "center", py: 1, borderRadius: 1.5, background: "#f9fafb" }}>
                                            <Typography sx={{ color: t.c, fontSize: 18, fontWeight: 800 }}>{t.v}</Typography>
                                            <Typography sx={{ color: "#9ca3af", fontSize: 11 }}>{t.l}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1.5, px: 2, borderRadius: 2, background: "rgba(13,148,136,0.06)", border: "1px solid rgba(13,148,136,0.15)" }}>
                                    <CheckCircleIcon sx={{ color: "#0d9488", fontSize: 18 }} />
                                    <Box>
                                        <Typography sx={{ color: "#0d9488", fontSize: 13, fontWeight: 700 }}>All tests passed</Typography>
                                        <Typography sx={{ color: "#6b7280", fontSize: 12 }}>Fix validated 2 min ago</Typography>
                                    </Box>
                                </Box>
                                <Button size="small" onClick={() => navigate("/history")} sx={{ mt: 1, color: "#1a73e8", textTransform: "none", fontSize: 12 }}>View Test Details</Button>
                            </Box>
                        </Box>
                    </>
                )}

                {!result && !loading && (
                    <Box sx={{ background: "#fff", borderRadius: 2.5, p: 6, border: "1px solid #e5e7eb", textAlign: "center" }}>
                        <Typography sx={{ color: "#6b7280", fontSize: 16, mb: 1 }}>Enter an API name and URL to analyze</Typography>
                        <Typography sx={{ color: "#9ca3af", fontSize: 13 }}>NovaGrid will scan the endpoint and provide health, impact, and dependency analysis</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
export default AnalyzeApi;
