import React, { useState, useEffect } from "react";
import {
    Box, Typography, Card, CardContent, Button, Chip, CircularProgress,
    Alert, Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
    Tabs, Tab, Snackbar,
} from "@mui/material";
import DifferenceRoundedIcon from "@mui/icons-material/DifferenceRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { diffWithPrevious, getChangeReports } from "../api/services";

export default function ImpactAnalysis() {
    const [tab, setTab] = useState(0);
    const [diff, setDiff] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);
    const [snack, setSnack] = useState({ open: false, msg: "" });

    const load = async () => {
        setLoading(true);
        try {
            const [d, r] = await Promise.allSettled([diffWithPrevious(), getChangeReports()]);
            if (d.status === "fulfilled") setDiff(d.value);
            if (r.status === "fulfilled") setReports(r.value?.reports || []);
        } catch {}
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleCheck = async () => {
        setChecking(true);
        await load();
        setChecking(false);
        setSnack({ open: true, msg: "Impact analysis updated" });
    };

    if (loading) return (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 16 }}>
            <CircularProgress size={28} sx={{ color: "#f59e0b" }} />
        </Box>
    );

    const breaking = diff?.diff?.breaking || [];
    const safe = diff?.diff?.safe || [];
    const warnings = diff?.diff?.warnings || [];
    const summary = diff?.diff?.summary || {};

    const impactScore = Math.min(100, (breaking.length * 25) + (warnings.length * 10) + (safe.length * 2));
    const impactColor = impactScore > 60 ? "#ef4444" : impactScore > 30 ? "#f59e0b" : "#10b981";

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <DifferenceRoundedIcon sx={{ fontSize: 24, color: "#f59e0b" }} />
                    <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: 22, color: "#0f172a" }}>Impact Analysis</Typography>
                        <Typography sx={{ color: "#94a3b8", fontSize: 12, mt: 0.3 }}>
                            Detect breaking changes and assess their impact
                        </Typography>
                    </Box>
                </Box>
                <Button variant="contained" startIcon={checking ? <CircularProgress size={14} color="inherit" /> : <RefreshRoundedIcon />}
                    onClick={handleCheck} disabled={checking}
                    sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700, fontSize: 13, background: "#f59e0b", "&:hover": { background: "#d97706" } }}>
                    {checking ? "Analyzing..." : "Run Analysis"}
                </Button>
            </Box>

            {/* Impact Score + Summary */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, gap: 1.5, mb: 3 }}>
                {/* Impact Score Gauge */}
                <Card sx={{ p: 3, borderRadius: 2, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 3 }}>
                    <Box sx={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
                        <svg width={100} height={100} viewBox="0 0 100 100">
                            <circle cx={50} cy={50} r={40} fill="none" stroke="#e2e8f0" strokeWidth={8} />
                            <circle cx={50} cy={50} r={40} fill="none" stroke={impactColor} strokeWidth={8}
                                strokeDasharray={`${(impactScore / 100) * 251.2} 251.2`}
                                strokeDashoffset={0} transform="rotate(-90 50 50)" strokeLinecap="round" />
                        </svg>
                        <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <Typography sx={{ fontSize: 24, fontWeight: 800, color: impactColor }}>{impactScore}</Typography>
                            <Typography sx={{ fontSize: 8, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Score</Typography>
                        </Box>
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                            {impactScore > 60 ? "High Risk" : impactScore > 30 ? "Medium Risk" : "Low Risk"}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.3 }}>
                            {breaking.length} breaking, {safe.length} safe, {warnings.length} warnings
                        </Typography>
                    </Box>
                </Card>

                {/* Summary Cards */}
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1 }}>
                    <Card sx={{ p: 1.5, textAlign: "center", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                        <Typography sx={{ fontSize: 24, fontWeight: 800, color: "#ef4444" }}>{breaking.length}</Typography>
                        <Typography sx={{ fontSize: 9, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Breaking</Typography>
                    </Card>
                    <Card sx={{ p: 1.5, textAlign: "center", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                        <Typography sx={{ fontSize: 24, fontWeight: 800, color: "#10b981" }}>{safe.length}</Typography>
                        <Typography sx={{ fontSize: 9, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Safe</Typography>
                    </Card>
                    <Card sx={{ p: 1.5, textAlign: "center", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                        <Typography sx={{ fontSize: 24, fontWeight: 800, color: "#f59e0b" }}>{warnings.length}</Typography>
                        <Typography sx={{ fontSize: 9, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Warnings</Typography>
                    </Card>
                </Box>
            </Box>

            {/* Tabs */}
            <Tabs value={tab} onChange={(_, v) => setTab(v)}
                sx={{ mb: 2, borderBottom: "1px solid #e2e8f0", "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: 12, minHeight: 36 } }}>
                <Tab label={`Breaking (${breaking.length})`} />
                <Tab label={`Safe (${safe.length})`} />
                <Tab label={`Warnings (${warnings.length})`} />
                <Tab label={`Reports (${reports.length})`} />
            </Tabs>

            {/* Tab: Breaking */}
            {tab === 0 && (
                <Card sx={{ borderRadius: 2, border: "1px solid #e2e8f0" }}>
                    <CardContent>
                        {breaking.length === 0 ? (
                            <Alert severity="success" sx={{ borderRadius: 1.5, fontSize: 12 }}>No breaking changes detected.</Alert>
                        ) : (
                            breaking.map((c, i) => (
                                <Alert key={i} severity="error" icon={<WarningAmberRoundedIcon />}
                                    sx={{ mb: 1, borderRadius: 1.5, fontSize: 12 }}>
                                    {c.detail || c}
                                </Alert>
                            ))
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Tab: Safe */}
            {tab === 1 && (
                <Card sx={{ borderRadius: 2, border: "1px solid #e2e8f0" }}>
                    <CardContent>
                        {safe.length === 0 ? (
                            <Alert severity="info" sx={{ borderRadius: 1.5, fontSize: 12 }}>No safe changes detected.</Alert>
                        ) : (
                            safe.map((c, i) => (
                                <Alert key={i} severity="success" icon={<CheckCircleRoundedIcon />}
                                    sx={{ mb: 1, borderRadius: 1.5, fontSize: 12 }}>
                                    {c.detail || c}
                                </Alert>
                            ))
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Tab: Warnings */}
            {tab === 2 && (
                <Card sx={{ borderRadius: 2, border: "1px solid #e2e8f0" }}>
                    <CardContent>
                        {warnings.length === 0 ? (
                            <Alert severity="success" sx={{ borderRadius: 1.5, fontSize: 12 }}>No warnings.</Alert>
                        ) : (
                            warnings.map((c, i) => (
                                <Alert key={i} severity="warning" sx={{ mb: 1, borderRadius: 1.5, fontSize: 12 }}>
                                    {c.detail || c}
                                </Alert>
                            ))
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Tab: Reports */}
            {tab === 3 && (
                <Card sx={{ borderRadius: 2, border: "1px solid #e2e8f0" }}>
                    <CardContent>
                        {reports.length === 0 ? (
                            <Alert severity="info" sx={{ borderRadius: 1.5, fontSize: 12 }}>No change reports yet.</Alert>
                        ) : (
                            <TableContainer sx={{ maxHeight: 400 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Type</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Severity</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Detail</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {reports.map((r) => (
                                            <TableRow key={r.id}>
                                                <TableCell>
                                                    <Chip size="small" label={r.status}
                                                        sx={{ fontSize: 9, height: 18, background: r.status === "approved" ? "#ecfdf5" : r.status === "rejected" ? "#fef2f2" : "#fef3c7", color: r.status === "approved" ? "#059669" : r.status === "rejected" ? "#dc2626" : "#d97706" }} />
                                                </TableCell>
                                                <TableCell sx={{ fontSize: 11, fontFamily: "monospace" }}>{r.change_type}</TableCell>
                                                <TableCell>
                                                    <Chip size="small" label={r.severity || "low"}
                                                        color={r.severity === "high" ? "error" : "warning"} sx={{ fontSize: 9, height: 18 }} />
                                                </TableCell>
                                                <TableCell sx={{ fontSize: 11 }}>{r.detail}</TableCell>
                                                <TableCell sx={{ fontSize: 10, color: "#94a3b8" }}>
                                                    {r.created_at ? new Date(r.created_at).toLocaleString() : "\u2014"}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </CardContent>
                </Card>
            )}

            <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })} message={snack.msg} />
        </Box>
    );
}
