import React, { useState } from "react";
import { Box, Typography, Grid, TextField, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress, Alert } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { registerAPI, checkAPIHealth, getImpactAnalysis, getDependencies } from "../api/services";

const card = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "visible", p: 3 };

function AnalyzeApi() {
    const [apiName, setApiName] = useState("");
    const [apiUrl, setApiUrl] = useState("");
    const [health, setHealth] = useState(null);
    const [impact, setImpact] = useState(null);
    const [deps, setDeps] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const analyze = async () => {
        setLoading(true); setError(""); setHealth(null); setImpact(null); setDeps(null);
        try {
            const created = await registerAPI(apiName, apiUrl);
            const id = created.api.id;
            const [h, imp, dep] = await Promise.allSettled([checkAPIHealth(id), getImpactAnalysis(id), getDependencies(id)]);
            if (h.status === "fulfilled") setHealth(h.value);
            if (imp.status === "fulfilled") setImpact(imp.value);
            if (dep.status === "fulfilled") setDeps(dep.value);
        } catch (e) { setError(e.message); }
        setLoading(false);
    };

    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, ml: "260px", p: 3 }}>
                <Navbar />
                <Box sx={{ mb: 3, mt: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>Analyze API</Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 14, mt: 0.5 }}>Deep analysis: health, dependencies, impact.</Typography>
                </Box>
                <Box sx={{ ...card, display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
                    <TextField label="API Name" value={apiName} onChange={e => setApiName(e.target.value)} size="small" sx={{ flex: 1, minWidth: 150 }} />
                    <TextField label="API URL" value={apiUrl} onChange={e => setApiUrl(e.target.value)} size="small" sx={{ flex: 2, minWidth: 200 }} />
                    <Button variant="contained" onClick={analyze} disabled={loading || !apiName || !apiUrl} sx={{ px: 4 }}>
                        {loading ? "Analyzing…" : "Analyze"}
                    </Button>
                </Box>
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                {loading && <LinearProgress sx={{ mt: 2 }} />}
                {health && (
                    <Grid container spacing={1.5} sx={{ mt: 1.5 }}>
                        {[{ l: "Status", v: health.health?.status || "unknown", c: health.health?.status === "healthy" ? "#22c55e" : "#ef4444" }, { l: "Response", v: `${health.health?.response_time_ms || 0}ms`, c: "#3b82f6" }, { l: "HTTP", v: String(health.health?.http_status || "-"), c: "#f5a623" }, { l: "Risk", v: `${impact?.risk_score || 0}/100`, c: impact?.severity === "high" ? "#ef4444" : "#22c55e" }].map((s, i) => (
                            <Grid item xs={6} md={3} key={i}>
                                <Box sx={{ ...card, textAlign: "center" }}>
                                    <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", mb: 0.5 }}>{s.l}</Typography>
                                    <Typography sx={{ color: s.c, fontSize: 24, fontWeight: 800 }}>{s.v}</Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                )}
                {impact && (
                    <Box sx={{ ...card, mt: 1.5 }}>
                        <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", mb: 1.5 }}>Impact Analysis</Typography>
                        <Grid container spacing={2}>
                            {[{ l: "Affected Files", v: impact.affected_files?.length || 0 }, { l: "Functions", v: impact.affected_functions?.length || 0 }, { l: "Changes", v: impact.changes_count || 0 }].map((s, i) => (
                                <Grid item xs={4} key={i}>
                                    <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{s.l}</Typography>
                                    <Typography sx={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>{s.v}</Typography>
                                </Grid>
                            ))}
                        </Grid>
                        {impact.affected_files?.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                {impact.affected_files.map((f, i) => <Chip key={i} label={f} sx={{ mr: 1, mb: 1, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }} />)}
                            </Box>
                        )}
                    </Box>
                )}
                {deps && deps.nodes?.length > 0 && (
                    <Box sx={{ ...card, mt: 1.5 }}>
                        <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", mb: 1.5 }}>Dependency Graph</Typography>
                        <TableContainer><Table size="small"><TableHead><TableRow>
                            <TableCell sx={{ color: "rgba(255,255,255,0.3)" }}>Node</TableCell>
                            <TableCell sx={{ color: "rgba(255,255,255,0.3)" }}>Type</TableCell>
                        </TableRow></TableHead><TableBody>
                            {deps.nodes.map((n, i) => (
                                <TableRow key={i}>
                                    <TableCell sx={{ color: "#fff" }}>{n.label}</TableCell>
                                    <TableCell><Chip size="small" label={n.type} /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody></Table></TableContainer>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
export default AnalyzeApi;
