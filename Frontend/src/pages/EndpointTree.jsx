import React, { useState, useEffect, useCallback } from "react";
import {
    Box, Typography, Button, Card, CardContent, Chip, CircularProgress,
    Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
    Alert, Tabs, Tab, Badge, Snackbar, IconButton,
} from "@mui/material";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import DifferenceRoundedIcon from "@mui/icons-material/DifferenceRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import {
    scanAndStore, getTreeData, validateEndpoints, getChangeReports,
    approveChange, rejectChange, diffWithPrevious,
} from "../api/services";
import TreeGraph, { TreeLegend } from "../components/TreeGraph";

const MC = { GET: "#10b981", POST: "#6366f1", PUT: "#f59e0b", PATCH: "#f59e0b", DELETE: "#ef4444" };

export default function EndpointTree() {
    const [tab, setTab] = useState(0);
    const [treeData, setTreeData] = useState(null);
    const [validation, setValidation] = useState(null);
    const [reports, setReports] = useState(null);
    const [diff, setDiff] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [sel, setSel] = useState(null);
    const [snack, setSnack] = useState({ open: false, msg: "" });

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [t, v, r] = await Promise.allSettled([
                getTreeData(), validateEndpoints(), getChangeReports()
            ]);
            if (t.status === "fulfilled") setTreeData(t.value);
            if (v.status === "fulfilled") setValidation(v.value);
            if (r.status === "fulfilled") setReports(r.value);
        } catch (e) {
            console.error(e);
            setError("Failed to load data");
        }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleScan = async () => {
        setScanning(true);
        try {
            const r = await scanAndStore();
            const count = r.manifest?.total_endpoints || 0;
            setSnack({ open: true, msg: `Scanned ${count} endpoints` });
            await load();
        } catch { setSnack({ open: true, msg: "Scan failed" }); }
        setScanning(false);
    };

    const handleDiff = async () => {
        try {
            const r = await diffWithPrevious();
            setDiff(r);
            setTab(3);
        } catch { setSnack({ open: true, msg: "Diff failed" }); }
    };

    if (loading) return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pt: 16, gap: 1.5 }}>
            <CircularProgress size={28} sx={{ color: "#6366f1" }} />
            <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>Loading endpoints...</Typography>
        </Box>
    );

    if (error) return (
        <Box sx={{ p: 4 }}>
            <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
            <Button onClick={load} sx={{ mt: 2 }} startIcon={<RefreshRoundedIcon />}>Retry</Button>
        </Box>
    );

    const tree = treeData?.tree;
    const total = treeData?.total_endpoints || 0;
    const methods = treeData?.methods_summary || {};
    const rawWarnings = validation?.issues || validation?.warnings || [];
    const warnings = Array.isArray(rawWarnings) ? rawWarnings : [];
    const rawPending = reports?.reports || [];
    const pending = Array.isArray(rawPending) ? rawPending : [];

    return (
        <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <AccountTreeRoundedIcon sx={{ fontSize: 24, color: "#6366f1" }} />
                    <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: 20, color: "#0f172a" }}>Endpoint Tree</Typography>
                        <Typography sx={{ color: "#94a3b8", fontSize: 12, mt: 0.2 }}>
                            {total} endpoints · {Object.keys(methods).length} methods · {warnings.length} warnings
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button variant="outlined" startIcon={<DifferenceRoundedIcon />} onClick={handleDiff}
                        sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 600, fontSize: 13, borderColor: "#e2e8f0", color: "#64748b" }}>
                        Diff
                    </Button>
                    <Button variant="contained" startIcon={scanning ? <CircularProgress size={14} color="inherit" /> : <RefreshRoundedIcon />}
                        onClick={handleScan} disabled={scanning}
                        sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700, fontSize: 13, px: 2.5,
                            background: "#6366f1", "&:hover": { background: "#4f46e5" } }}>
                        {scanning ? "Scanning..." : "Scan Now"}
                    </Button>
                </Box>
            </Box>

            {/* KPIs */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(4, 1fr)", md: "repeat(7, 1fr)" }, gap: 1.25, mb: 3 }}>
                {[
                    { l: "Total", v: total, c: "#6366f1" },
                    { l: "GET", v: methods.GET || 0, c: "#10b981" },
                    { l: "POST", v: methods.POST || 0, c: "#6366f1" },
                    { l: "PUT", v: methods.PUT || 0, c: "#f59e0b" },
                    { l: "PATCH", v: methods.PATCH || 0, c: "#f59e0b" },
                    { l: "DELETE", v: methods.DELETE || 0, c: "#ef4444" },
                    { l: "Warnings", v: warnings.length, c: warnings.length ? "#f59e0b" : "#10b981" },
                ].map(({ l, v, c }) => (
                    <Card key={l} sx={{ p: 1.5, textAlign: "center", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                        <Typography sx={{ fontSize: 22, fontWeight: 800, color: c, lineHeight: 1.1 }}>{v}</Typography>
                        <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, mt: 0.3, textTransform: "uppercase", letterSpacing: 0.4 }}>{l}</Typography>
                    </Card>
                ))}
            </Box>

            {/* Tabs */}
            <Tabs value={tab} onChange={(_, v) => setTab(v)}
                sx={{ mb: 2, borderBottom: "1px solid #e2e8f0", "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: 12, minHeight: 36 } }}>
                <Tab label="Tree Graph" />
                <Tab label={<Badge badgeContent={warnings.length} color="warning" max={99}>Validation</Badge>} />
                <Tab label={<Badge badgeContent={pending.length} color="error" max={99}>Reports</Badge>} />
                {diff && <Tab label="Diff" />}
            </Tabs>

            {/* Tab 0: SVG Tree Graph */}
            {tab === 0 && (
                <>
                    <TreeGraph
                        tree={tree}
                        onSelect={(ep) => setSel(sel?.path === ep.path && sel?.method === ep.method ? null : ep)}
                        selectedId={sel ? `${sel.method}${sel.path}` : null}
                    />
                    <TreeLegend />
                </>
            )}

            {/* Selected endpoint detail */}
            {tab === 0 && sel && (
                <Card sx={{ mt: 2, borderRadius: 2, border: "1px solid #e2e8f0" }}>
                    <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Chip label={sel.method} size="small"
                                    sx={{ width: 48, height: 20, fontSize: 10, fontWeight: 700, background: MC[sel.method], color: "#fff" }} />
                                <Typography sx={{ fontWeight: 700, fontSize: 14, fontFamily: "monospace", color: "#0f172a" }}>{sel.path}</Typography>
                            </Box>
                            <IconButton size="small" onClick={() => setSel(null)}>
                                <CloseRoundedIcon fontSize="small" />
                            </IconButton>
                        </Box>
                        <Box sx={{ height: 1, background: "#e2e8f0", my: 1 }} />
                        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 2 }}>
                            <Field label="Function" value={`${sel.function}()`} />
                            <Field label="Source" value={sel.file?.split("\\").pop()} />
                            <Field label="Line" value={sel.line} />
                            <Field label="Validation" value={sel.has_validation ? "Has validation" : "No validation"} color={sel.has_validation ? "#10b981" : "#f59e0b"} />
                            <Field label="Body Model" value={sel.has_body_model ? "Yes" : "No"} color={sel.has_body_model ? "#10b981" : "#ef4444"} />
                            <Field label="Response" value={sel.response_model || "None"} color={sel.response_model ? "#10b981" : "#64748b"} />
                        </Box>
                        {sel.docstring && (
                            <Box sx={{ mt: 2, p: 1.5, background: "#f8fafc", borderRadius: 1.5 }}>
                                <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3, mb: 0.3 }}>Docstring</Typography>
                                <Typography sx={{ fontSize: 12, color: "#334155", fontFamily: "monospace" }}>{sel.docstring}</Typography>
                            </Box>
                        )}
                        {sel.params?.length > 0 && (
                            <Box sx={{ mt: 1.5 }}>
                                <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3, mb: 0.5 }}>Parameters</Typography>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                    {sel.params.map((p, i) => (
                                        <Chip key={i} label={`${p.name}${p.type ? `: ${p.type}` : ""}`} size="small"
                                            sx={{ fontSize: 10, height: 20, background: "#f1f5f9", color: "#475569" }} />
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Tab 1: Validation */}
            {tab === 1 && (
                <Card sx={{ borderRadius: 2, border: "1px solid #e2e8f0" }}>
                    <CardContent>
                        <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#0f172a", mb: 1.5 }}>
                            Validation Issues ({warnings.length})
                        </Typography>
                        {warnings.length === 0 ? (
                            <Alert severity="success" sx={{ borderRadius: 1.5, fontSize: 12 }}>All endpoints validated.</Alert>
                        ) : (
                            <TableContainer sx={{ maxHeight: 400 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700, background: "#f8fafc", fontSize: 11, py: 1 }}>#</TableCell>
                                            <TableCell sx={{ fontWeight: 700, background: "#f8fafc", fontSize: 11, py: 1 }}>Warning</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {warnings.map((w, i) => (
                                            <TableRow key={i} sx={{ "&:hover": { background: "#f8fafc" } }}>
                                                <TableCell sx={{ fontSize: 10, color: "#94a3b8", width: 40 }}>{i + 1}</TableCell>
                                                <TableCell sx={{ fontSize: 11, fontFamily: "monospace" }}>
                                                    {typeof w === "string" ? w : w.message || JSON.stringify(w)}
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

            {/* Tab 2: Reports */}
            {tab === 2 && (
                <Card sx={{ borderRadius: 2, border: "1px solid #e2e8f0" }}>
                    <CardContent>
                        <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#0f172a", mb: 1.5 }}>
                            Change Reports ({pending.length} pending)
                        </Typography>
                        {pending.length === 0 ? (
                            <Alert severity="success" sx={{ borderRadius: 1.5, fontSize: 12 }}>No pending changes.</Alert>
                        ) : (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Severity</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Type</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Detail</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {pending.map((r) => (
                                            <TableRow key={r.id}>
                                                <TableCell><Chip size="small" label={r.severity || "low"} color={r.severity === "high" ? "error" : "warning"} sx={{ fontSize: 9, height: 18 }} /></TableCell>
                                                <TableCell sx={{ fontSize: 11, fontFamily: "monospace" }}>{r.change_type}</TableCell>
                                                <TableCell sx={{ fontSize: 11 }}>{r.detail}</TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: "flex", gap: 0.5 }}>
                                                        <Button size="small" onClick={async () => { await approveChange(r.id); load(); }}
                                                            sx={{ fontSize: 10, textTransform: "none", color: "#10b981", fontWeight: 700, minWidth: 0, px: 1 }}>Approve</Button>
                                                        <Button size="small" onClick={async () => { await rejectChange(r.id); load(); }}
                                                            sx={{ fontSize: 10, textTransform: "none", color: "#ef4444", fontWeight: 700, minWidth: 0, px: 1 }}>Reject</Button>
                                                    </Box>
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

            {/* Tab 3: Diff */}
            {tab === 3 && diff && (
                <Card sx={{ borderRadius: 2, border: "1px solid #e2e8f0" }}>
                    <CardContent>
                        <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#0f172a", mb: 1.5 }}>Diff Report</Typography>
                        <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
                            <Chip label={`${diff.diff?.summary?.breaking || 0} Breaking`} color="error" size="small" />
                            <Chip label={`${diff.diff?.summary?.safe || 0} Safe`} color="success" size="small" />
                            <Chip label={`${diff.diff?.summary?.warnings || 0} Warnings`} color="warning" size="small" />
                        </Box>
                        {(diff.diff?.breaking || []).map((c, i) => <Alert key={`b${i}`} severity="error" sx={{ mb: 1, borderRadius: 1.5, fontSize: 11 }}>{c.detail || c}</Alert>)}
                        {(diff.diff?.safe || []).map((c, i) => <Alert key={`s${i}`} severity="success" sx={{ mb: 1, borderRadius: 1.5, fontSize: 11 }}>{c.detail || c}</Alert>)}
                        {(diff.diff?.warnings || []).map((c, i) => <Alert key={`w${i}`} severity="warning" sx={{ mb: 1, borderRadius: 1.5, fontSize: 11 }}>{c.detail || c}</Alert>)}
                    </CardContent>
                </Card>
            )}

            <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })} message={snack.msg} />
        </Box>
    );
}

function Field({ label, value, color }) {
    return (
        <Box>
            <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3, mb: 0.2 }}>{label}</Typography>
            <Typography sx={{ fontSize: 12, color: color || "#334155", fontFamily: "monospace", wordBreak: "break-all" }}>{String(value ?? "\u2014")}</Typography>
        </Box>
    );
}
