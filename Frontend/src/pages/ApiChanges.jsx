import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, LinearProgress, Select, MenuItem } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { getAllAPIs, getImpactAnalysis, getDependencies } from "../api/services";

const card = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "visible", p: 3 };

function ApiChanges() {
    const [apis, setApis] = useState([]);
    const [selectedApi, setSelectedApi] = useState("");
    const [impact, setImpact] = useState(null);
    const [deps, setDeps] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => { getAllAPIs().then(r => { const d = r.data || []; setApis(d); if (d.length > 0) setSelectedApi(d[0].id); }).catch(() => {}); }, []);
    useEffect(() => {
        if (!selectedApi) return;
        setLoading(true);
        Promise.allSettled([getImpactAnalysis(selectedApi), getDependencies(selectedApi)])
            .then(([i, d]) => { if (i.status === "fulfilled") setImpact(i.value); if (d.status === "fulfilled") setDeps(d.value); })
            .finally(() => setLoading(false));
    }, [selectedApi]);

    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, ml: "260px", p: 3 }}>
                <Navbar />
                <Box sx={{ mb: 3, mt: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>API Changes</Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 14, mt: 0.5 }}>Impact Score, Dependency Graph, Affected Files.</Typography>
                </Box>
                <Box sx={{ ...card, display: "flex", gap: 1.5, alignItems: "center" }}>
                    <Select value={selectedApi} onChange={e => setSelectedApi(e.target.value)} sx={{ minWidth: 280 }}
                        MenuProps={{ PaperProps: { style: { maxHeight: 300, background: "rgba(15,15,25,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 } } }}>
                        {apis.map(a => <MenuItem key={a.id} value={a.id}>{a.name || a.base_url}</MenuItem>)}
                    </Select>
                </Box>
                {apis.length === 0 && !loading && (
                    <Box sx={{ ...card, mt: 2, textAlign: "center", py: 6 }}>
                        <Typography sx={{ color: "rgba(255,255,255,0.25)", fontSize: 14 }}>No APIs registered yet. Scan an API on the Dashboard first.</Typography>
                    </Box>
                )}
                {loading && <LinearProgress sx={{ mt: 2 }} />}
                {impact && (
                    <Grid container spacing={1.5} sx={{ mt: 1.5 }}>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ ...card, textAlign: "center", py: 4 }}>
                                <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>Impact Score</Typography>
                                <Typography variant="h1" sx={{ color: impact.severity === "high" ? "#ef4444" : impact.severity === "medium" ? "#f5a623" : "#22c55e", fontWeight: 900, mt: 1 }}>{impact.risk_score}</Typography>
                                <Chip label={impact.severity?.toUpperCase()} color={impact.severity === "high" ? "error" : impact.severity === "medium" ? "warning" : "success"} sx={{ mt: 1.5 }} />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Box sx={{ ...card }}>
                                <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", mb: 1.5 }}>Summary</Typography>
                                <Grid container spacing={2}>
                                    {[{ l: "Changes", v: impact.changes_count || 0 }, { l: "Files", v: impact.affected_files?.length || 0 }, { l: "Functions", v: impact.affected_functions?.length || 0 }, { l: "Tests", v: impact.affected_tests?.length || 0 }].map((s, i) => (
                                        <Grid item xs={3} key={i}>
                                            <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{s.l}</Typography>
                                            <Typography sx={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>{s.v}</Typography>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </Grid>
                        {impact.affected_files?.length > 0 && (
                            <Grid item xs={12} md={6}>
                                <Box sx={{ ...card }}>
                                    <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", mb: 1.5 }}>Affected Files</Typography>
                                    {impact.affected_files.map((f, i) => <Chip key={i} label={f} sx={{ mr: 1, mb: 1, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }} />)}
                                </Box>
                            </Grid>
                        )}
                        {impact.affected_functions?.length > 0 && (
                            <Grid item xs={12} md={6}>
                                <Box sx={{ ...card }}>
                                    <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", mb: 1.5 }}>Affected Functions</Typography>
                                    {impact.affected_functions.map((f, i) => <Chip key={i} label={f} sx={{ mr: 1, mb: 1, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }} />)}
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                )}
            </Box>
        </Box>
    );
}
export default ApiChanges;
