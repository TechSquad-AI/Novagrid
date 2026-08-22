import React, { useState, useEffect } from "react";
import {
    Box, Typography, Card, CardContent, Chip, CircularProgress,
    Alert, Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
    Tabs, Tab,
} from "@mui/material";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import { getChangeReports, diffWithPrevious } from "../api/services";

export default function History() {
    const [tab, setTab] = useState(0);
    const [reports, setReports] = useState([]);
    const [diff, setDiff] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [r, d] = await Promise.allSettled([getChangeReports(), diffWithPrevious()]);
                if (r.status === "fulfilled") setReports(r.value?.reports || []);
                if (d.status === "fulfilled") setDiff(d.value);
            } catch {}
            setLoading(false);
        })();
    }, []);

    if (loading) return (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 16 }}>
            <CircularProgress size={28} sx={{ color: "#6366f1" }} />
        </Box>
    );

    const allEvents = reports.map(r => ({
        type: "change",
        label: r.change_type,
        detail: r.detail,
        severity: r.severity,
        status: r.status,
        date: r.created_at,
    })).sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                <HistoryRoundedIcon sx={{ fontSize: 24, color: "#6366f1" }} />
                <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: 22, color: "#0f172a" }}>History</Typography>
                    <Typography sx={{ color: "#94a3b8", fontSize: 12, mt: 0.3 }}>
                        Audit trail of all scans, changes, and fixes
                    </Typography>
                </Box>
            </Box>

            {/* Summary Cards */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 1.5, mb: 3 }}>
                {[
                    { label: "Total Events", value: allEvents.length, color: "#6366f1" },
                    { label: "Approved", value: allEvents.filter(e => e.status === "approved").length, color: "#10b981" },
                    { label: "Rejected", value: allEvents.filter(e => e.status === "rejected").length, color: "#ef4444" },
                    { label: "Pending", value: allEvents.filter(e => e.status === "pending").length, color: "#f59e0b" },
                ].map((k) => (
                    <Card key={k.label} sx={{ p: 2, textAlign: "center", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                        <Typography sx={{ fontSize: 28, fontWeight: 800, color: k.color }}>{k.value}</Typography>
                        <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>{k.label}</Typography>
                    </Card>
                ))}
            </Box>

            <Tabs value={tab} onChange={(_, v) => setTab(v)}
                sx={{ mb: 2, borderBottom: "1px solid #e2e8f0", "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: 12, minHeight: 36 } }}>
                <Tab label="Timeline" />
                <Tab label="Change Log" />
            </Tabs>

            {/* Tab 0: Timeline */}
            {tab === 0 && (
                <Card sx={{ borderRadius: 2, border: "1px solid #e2e8f0" }}>
                    <CardContent>
                        {allEvents.length === 0 ? (
                            <Alert severity="info" sx={{ borderRadius: 1.5, fontSize: 12 }}>No events yet. Run a scan or analysis to start tracking.</Alert>
                        ) : (
                            <TableContainer sx={{ maxHeight: 500 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700, fontSize: 11, background: "#f8fafc" }}>Date</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: 11, background: "#f8fafc" }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: 11, background: "#f8fafc" }}>Type</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: 11, background: "#f8fafc" }}>Severity</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: 11, background: "#f8fafc" }}>Detail</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {allEvents.map((e, i) => (
                                            <TableRow key={i} sx={{ "&:hover": { background: "#f8fafc" } }}>
                                                <TableCell sx={{ fontSize: 10, color: "#94a3b8", whiteSpace: "nowrap" }}>
                                                    {e.date ? new Date(e.date).toLocaleString() : "\u2014"}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip size="small" label={e.status}
                                                        sx={{ fontSize: 9, height: 18, fontWeight: 600,
                                                            background: e.status === "approved" ? "#ecfdf5" : e.status === "rejected" ? "#fef2f2" : "#fef3c7",
                                                            color: e.status === "approved" ? "#059669" : e.status === "rejected" ? "#dc2626" : "#d97706",
                                                        }} />
                                                </TableCell>
                                                <TableCell sx={{ fontSize: 11, fontFamily: "monospace" }}>{e.label}</TableCell>
                                                <TableCell>
                                                    <Chip size="small" label={e.severity || "low"}
                                                        color={e.severity === "high" ? "error" : "warning"} sx={{ fontSize: 9, height: 18 }} />
                                                </TableCell>
                                                <TableCell sx={{ fontSize: 11, color: "#334155" }}>{e.detail}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Tab 1: Change Log */}
            {tab === 1 && (
                <Card sx={{ borderRadius: 2, border: "1px solid #e2e8f0" }}>
                    <CardContent>
                        {diff?.diff ? (
                            <>
                                <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
                                    <Chip label={`${diff.diff.summary?.breaking || 0} Breaking`} color="error" size="small" />
                                    <Chip label={`${diff.diff.summary?.safe || 0} Safe`} color="success" size="small" />
                                    <Chip label={`${diff.diff.summary?.warnings || 0} Warnings`} color="warning" size="small" />
                                </Box>
                                {(diff.diff.breaking || []).map((c, i) => (
                                    <Alert key={`b${i}`} severity="error" sx={{ mb: 1, borderRadius: 1.5, fontSize: 11 }}>{c.detail || c}</Alert>
                                ))}
                                {(diff.diff.safe || []).map((c, i) => (
                                    <Alert key={`s${i}`} severity="success" sx={{ mb: 1, borderRadius: 1.5, fontSize: 11 }}>{c.detail || c}</Alert>
                                ))}
                                {(diff.diff.warnings || []).map((c, i) => (
                                    <Alert key={`w${i}`} severity="warning" sx={{ mb: 1, borderRadius: 1.5, fontSize: 11 }}>{c.detail || c}</Alert>
                                ))}
                            </>
                        ) : (
                            <Alert severity="info" sx={{ borderRadius: 1.5, fontSize: 12 }}>No diff data available. Run a scan first.</Alert>
                        )}
                    </CardContent>
                </Card>
            )}
        </Box>
    );
}
