import React, { useState, useEffect, useCallback } from "react";
import {
    Box, Typography, Card, CardContent, Button, Chip, CircularProgress,
    Alert, Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
    Tabs, Tab, TextField, Snackbar,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import { getChangeReports, approveChange, rejectChange } from "../api/services";

export default function HumanValidation() {
    const [tab, setTab] = useState(0);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [comment, setComment] = useState({});
    const [snack, setSnack] = useState({ open: false, msg: "" });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await getChangeReports();
            setReports(r.reports || []);
        } catch { setReports([]); }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleApprove = async (id) => {
        setActionLoading(id);
        try {
            await approveChange(id);
            setSnack({ open: true, msg: "Change approved" });
            await load();
        } catch { setSnack({ open: true, msg: "Failed to approve" }); }
        setActionLoading(null);
    };

    const handleReject = async (id) => {
        setActionLoading(id);
        try {
            await rejectChange(id);
            setSnack({ open: true, msg: "Change rejected" });
            await load();
        } catch { setSnack({ open: true, msg: "Failed to reject" }); }
        setActionLoading(null);
    };

    if (loading) return (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 16 }}>
            <CircularProgress size={28} sx={{ color: "#6366f1" }} />
        </Box>
    );

    const pending = reports.filter(r => r.status === "pending");
    const approved = reports.filter(r => r.status === "approved");
    const rejected = reports.filter(r => r.status === "rejected");

    const filtered = tab === 0 ? pending : tab === 1 ? approved : tab === 2 ? rejected : reports;

    const stats = [
        { label: "Pending Review", value: pending.length, color: "#f59e0b", icon: <HourglassTopRoundedIcon sx={{ fontSize: 18 }} /> },
        { label: "Approved", value: approved.length, color: "#10b981", icon: <CheckCircleRoundedIcon sx={{ fontSize: 18 }} /> },
        { label: "Rejected", value: rejected.length, color: "#ef4444", icon: <CancelRoundedIcon sx={{ fontSize: 18 }} /> },
        { label: "Total", value: reports.length, color: "#6366f1" },
    ];

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
            <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 22, color: "#0f172a" }}>Human Validation</Typography>
                <Typography sx={{ color: "#94a3b8", fontSize: 12, mt: 0.3 }}>
                    Review detected API changes — approve or reject before they are applied
                </Typography>
            </Box>

            {/* Stats */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 1.5, mb: 3 }}>
                {stats.map((s) => (
                    <Card key={s.label} sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5, borderRadius: 2, border: "1px solid #e2e8f0" }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 2, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                            {s.icon}
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1.1 }}>{s.value}</Typography>
                            <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>{s.label}</Typography>
                        </Box>
                    </Card>
                ))}
            </Box>

            {/* Tabs */}
            <Tabs value={tab} onChange={(_, v) => setTab(v)}
                sx={{ mb: 2, borderBottom: "1px solid #e2e8f0", "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: 12, minHeight: 36 } }}>
                <Tab label={`Pending (${pending.length})`} />
                <Tab label={`Approved (${approved.length})`} />
                <Tab label={`Rejected (${rejected.length})`} />
                <Tab label={`All (${reports.length})`} />
            </Tabs>

            {/* Table */}
            <Card sx={{ borderRadius: 2, border: "1px solid #e2e8f0" }}>
                <CardContent sx={{ p: 0 }}>
                    {filtered.length === 0 ? (
                        <Box sx={{ p: 6, textAlign: "center" }}>
                            <CheckCircleRoundedIcon sx={{ fontSize: 40, color: "#e2e8f0", mb: 1 }} />
                            <Typography sx={{ color: "#94a3b8", fontSize: 13 }}>
                                {tab === 0 ? "No pending changes to review" : "No items in this category"}
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, fontSize: 11, background: "#f8fafc" }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: 11, background: "#f8fafc" }}>Severity</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: 11, background: "#f8fafc" }}>Type</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: 11, background: "#f8fafc" }}>Method</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: 11, background: "#f8fafc" }}>Path</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: 11, background: "#f8fafc" }}>Detail</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: 11, background: "#f8fafc" }}>Date</TableCell>
                                        {tab === 0 && <TableCell sx={{ fontWeight: 700, fontSize: 11, background: "#f8fafc" }}>Actions</TableCell>}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filtered.map((r) => (
                                        <TableRow key={r.id} sx={{ "&:hover": { background: "#f8fafc" } }}>
                                            <TableCell>
                                                <Chip size="small" label={r.status}
                                                    sx={{ fontSize: 9, height: 18, fontWeight: 600,
                                                        background: r.status === "approved" ? "#ecfdf5" : r.status === "rejected" ? "#fef2f2" : "#fef3c7",
                                                        color: r.status === "approved" ? "#059669" : r.status === "rejected" ? "#dc2626" : "#d97706" }} />
                                            </TableCell>
                                            <TableCell>
                                                <Chip size="small" label={r.severity || "low"}
                                                    color={r.severity === "high" ? "error" : "warning"} sx={{ fontSize: 9, height: 18 }} />
                                            </TableCell>
                                            <TableCell sx={{ fontSize: 10, fontFamily: "monospace", color: "#64748b" }}>{r.change_type}</TableCell>
                                            <TableCell>
                                                <Chip size="small" label={r.method || "\u2014"} sx={{ fontSize: 9, height: 18, background: "#f1f5f9" }} />
                                            </TableCell>
                                            <TableCell sx={{ fontSize: 11, fontFamily: "monospace" }}>{r.path || "\u2014"}</TableCell>
                                            <TableCell sx={{ fontSize: 11, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.detail}</TableCell>
                                            <TableCell sx={{ fontSize: 10, color: "#94a3b8", whiteSpace: "nowrap" }}>
                                                {r.created_at ? new Date(r.created_at).toLocaleString() : "\u2014"}
                                            </TableCell>
                                            {tab === 0 && (
                                                <TableCell>
                                                    <Box sx={{ display: "flex", gap: 0.5 }}>
                                                        <Button size="small" onClick={() => handleApprove(r.id)} disabled={actionLoading === r.id}
                                                            sx={{ fontSize: 10, textTransform: "none", color: "#10b981", fontWeight: 700, minWidth: 0, px: 1 }}>
                                                            {actionLoading === r.id ? "..." : "Approve"}
                                                        </Button>
                                                        <Button size="small" onClick={() => handleReject(r.id)} disabled={actionLoading === r.id}
                                                            sx={{ fontSize: 10, textTransform: "none", color: "#ef4444", fontWeight: 700, minWidth: 0, px: 1 }}>
                                                            Reject
                                                        </Button>
                                                    </Box>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            {/* How it works */}
            <Card sx={{ mt: 3, borderRadius: 2, border: "1px solid #e2e8f0" }}>
                <CardContent>
                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#0f172a", mb: 1.5 }}>How Human Validation Works</Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" }, gap: 2 }}>
                        {[
                            { step: "1", title: "Detect", desc: "NovaGrid detects a change by comparing API specs", color: "#6366f1" },
                            { step: "2", title: "Classify", desc: "Change is classified as Breaking, Safe, or Warning", color: "#f59e0b" },
                            { step: "3", title: "Review", desc: "You review the change here and decide", color: "#10b981" },
                            { step: "4", title: "Act", desc: "Approve to acknowledge or Reject to flag for fix", color: "#ef4444" },
                        ].map((s) => (
                            <Box key={s.step} sx={{ textAlign: "center" }}>
                                <Box sx={{ width: 32, height: 32, borderRadius: "50%", background: `${s.color}15`, color: s.color, display: "inline-flex", alignItems: "center", justifyContent: "center", mb: 1, fontWeight: 800, fontSize: 14 }}>{s.step}</Box>
                                <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#0f172a", mb: 0.3 }}>{s.title}</Typography>
                                <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>{s.desc}</Typography>
                            </Box>
                        ))}
                    </Box>
                </CardContent>
            </Card>

            <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })} message={snack.msg} />
        </Box>
    );
}
