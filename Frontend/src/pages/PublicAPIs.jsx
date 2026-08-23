import React, { useState, useEffect, useCallback } from "react";
import {
    Box, Typography, Button, Card, CardContent, Chip, CircularProgress,
    Table, TableBody, TableCell, TableHead, TableRow, TextField,
    Alert, Snackbar, IconButton, Tooltip, Dialog,
    DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import {
    registerPublicAPI, listPublicAPIs, getPublicAPITree,
    checkPublicAPI, deletePublicAPI,
} from "../api/services";
import TreeGraph, { TreeLegend } from "../components/TreeGraph";

const MC = { GET: "#10b981", POST: "#6366f1", PUT: "#f59e0b", PATCH: "#f59e0b", DELETE: "#ef4444" };

export default function PublicAPIs() {
    const [apis, setApis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [tree, setTree] = useState(null);
    const [treeLoading, setTreeLoading] = useState(false);
    const [dlg, setDlg] = useState(false);
    const [form, setForm] = useState({ name: "", url: "", openapi_url: "" });
    const [registering, setRegistering] = useState(false);
    const [sel, setSel] = useState(null);
    const [snack, setSnack] = useState({ open: false, msg: "" });

    const load = useCallback(async () => {
        setLoading(true);
        try { const r = await listPublicAPIs(); setApis(r.apis || []); }
        catch { setApis([]); }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleRegister = async () => {
        if (!form.name || !form.openapi_url) { setSnack({ open: true, msg: "Name and OpenAPI URL required" }); return; }
        setRegistering(true);
        try {
            const r = await registerPublicAPI(form.name, form.url, form.openapi_url);
            setSnack({ open: true, msg: `${r.name}: ${r.total_endpoints} endpoints discovered` });
            setDlg(false);
            setForm({ name: "", url: "", openapi_url: "" });
            await load();
        } catch (e) { setSnack({ open: true, msg: e.response?.data?.detail || "Failed" }); }
        setRegistering(false);
    };

    const handleViewTree = async (api) => {
        setSelected(api);
        setTreeLoading(true);
        try { const r = await getPublicAPITree(api.id); setTree(r.tree); }
        catch { setTree(null); }
        setTreeLoading(false);
    };

    const handleCheck = async (apiId) => {
        try {
            const r = await checkPublicAPI(apiId);
            setSnack({ open: true, msg: r.has_changes ? `Changes found: ${r.changes?.length || 0} changes` : "No changes" });
            await load();
        } catch { setSnack({ open: true, msg: "Check failed" }); }
    };

    const handleDelete = async (apiId) => {
        try {
            await deletePublicAPI(apiId);
            setSnack({ open: true, msg: "Removed" });
            if (selected?.id === apiId) { setSelected(null); setTree(null); }
            await load();
        } catch { setSnack({ open: true, msg: "Failed" }); }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <HubRoundedIcon sx={{ fontSize: 24, color: "#10b981" }} />
                    <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: 20, color: "#0f172a" }}>
                            {selected ? selected.name : "Public APIs"}
                        </Typography>
                        <Typography sx={{ color: "#94a3b8", fontSize: 12, mt: 0.2 }}>
                            {selected ? `${tree?.total_endpoints || 0} endpoints · Auto-monitored` : `${apis.length} registered APIs`}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                    {selected ? (
                        <Button variant="outlined" startIcon={<ArrowBackRoundedIcon />}
                            onClick={() => { setSelected(null); setTree(null); setSel(null); }}
                            sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 600, fontSize: 13, borderColor: "#e2e8f0", color: "#64748b" }}>
                            Back
                        </Button>
                    ) : (
                        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDlg(true)}
                            sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700, fontSize: 13, px: 2.5, background: "#10b981", "&:hover": { background: "#059669" } }}>
                            Register API
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Content */}
            {selected ? (
                treeLoading ? (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 8, gap: 1 }}>
                        <CircularProgress size={24} sx={{ color: "#10b981" }} />
                        <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>Loading tree...</Typography>
                    </Box>
                ) : tree ? (
                    <>
                        <TreeGraph
                            tree={tree}
                            onSelect={(ep) => setSel(sel?.path === ep.path && sel?.method === ep.method ? null : ep)}
                            selectedId={sel ? `${sel.method}${sel.path}` : null}
                            accentColor="#10b981"
                        />
                        <TreeLegend accentColor="#10b981" />

                        {/* Endpoint detail */}
                        {sel && (
                            <Card sx={{ mt: 2, borderRadius: 2, border: "1px solid #e2e8f0" }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                        <Chip label={sel.method} size="small"
                                            sx={{ width: 48, height: 20, fontSize: 10, fontWeight: 700, background: MC[sel.method], color: "#fff" }} />
                                        <Typography sx={{ fontWeight: 700, fontSize: 14, fontFamily: "monospace", color: "#0f172a", flex: 1 }}>{sel.path}</Typography>
                                        <Button size="small" onClick={() => setSel(null)} sx={{ textTransform: "none", fontSize: 11, color: "#94a3b8" }}>Close</Button>
                                    </Box>
                                    <Box sx={{ height: 1, background: "#e2e8f0", my: 1 }} />
                                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 2 }}>
                                        <Box>
                                            <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", mb: 0.2 }}>Summary</Typography>
                                            <Typography sx={{ fontSize: 12, color: "#334155" }}>{sel.summary || "\u2014"}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", mb: 0.2 }}>Operation ID</Typography>
                                            <Typography sx={{ fontSize: 12, color: "#334155", fontFamily: "monospace" }}>{sel.operation_id || "\u2014"}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", mb: 0.2 }}>Tag</Typography>
                                            <Typography sx={{ fontSize: 12, color: "#334155" }}>{sel.tag || "\u2014"}</Typography>
                                        </Box>
                                    </Box>
                                    {sel.parameters?.length > 0 && (
                                        <Box sx={{ mt: 1.5 }}>
                                            <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", mb: 0.5 }}>Parameters</Typography>
                                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                                {sel.parameters.map((p, i) => (
                                                    <Chip key={i} label={`${p.name}${p.type ? `: ${p.type}` : ""}${p.required ? " *" : ""}`} size="small"
                                                        sx={{ fontSize: 10, height: 20, background: p.required ? "#fef3c7" : "#f1f5f9", color: p.required ? "#b45309" : "#475569" }} />
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                    {sel.responses && Object.keys(sel.responses).length > 0 && (
                                        <Box sx={{ mt: 1.5 }}>
                                            <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", mb: 0.5 }}>Responses</Typography>
                                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                                {Object.entries(sel.responses).map(([code, desc]) => (
                                                    <Chip key={code} label={`${code}: ${desc}`} size="small"
                                                        sx={{ fontSize: 10, height: 20, background: code.startsWith("2") ? "#ecfdf5" : "#fef3c7", color: code.startsWith("2") ? "#065f46" : "#b45309" }} />
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </>
                ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>No tree data available</Alert>
                )
            ) : loading ? (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 8, gap: 1 }}>
                    <CircularProgress size={24} sx={{ color: "#10b981" }} />
                    <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>Loading APIs...</Typography>
                </Box>
            ) : apis.length === 0 ? (
                <Card sx={{ borderRadius: 2, border: "1px solid #e2e8f0", p: 6, textAlign: "center" }}>
                    <HubRoundedIcon sx={{ fontSize: 40, color: "#e2e8f0", mb: 1 }} />
                    <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: 14, mb: 0.5 }}>No APIs registered</Typography>
                    <Typography sx={{ color: "#94a3b8", fontSize: 12, mb: 3 }}>Register a public API with its OpenAPI URL to auto-discover endpoints</Typography>
                    <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDlg(true)}
                        sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, background: "#10b981" }}>
                        Register First API
                    </Button>
                </Card>
            ) : (
                <Card sx={{ borderRadius: 2, border: "1px solid #e2e8f0" }}>
                    <CardContent sx={{ p: 0 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {["Name", "Base URL", "OpenAPI", "Last Checked", "Actions"].map((h) => (
                                        <TableCell key={h} sx={{ fontWeight: 700, fontSize: 11, color: "#64748b", py: 1.5 }}>{h}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {apis.map((api) => (
                                    <TableRow key={api.id} sx={{ "&:hover": { background: "#f8fafc" } }}>
                                        <TableCell>
                                            <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{api.name}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ fontSize: 11, fontFamily: "monospace", color: "#64748b", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {api.base_url || "\u2014"}
                                        </TableCell>
                                        <TableCell>
                                            <Chip size="small" label={api.openapi_url ? "Connected" : "None"}
                                                color={api.openapi_url ? "success" : "default"} sx={{ fontSize: 9, height: 18 }} />
                                        </TableCell>
                                        <TableCell sx={{ fontSize: 11, color: "#94a3b8" }}>
                                            {api.last_checked ? new Date(api.last_checked).toLocaleString() : "Never"}
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: "flex", gap: 0.5 }}>
                                                <Button size="small" onClick={() => handleViewTree(api)}
                                                    startIcon={<AccountTreeRoundedIcon sx={{ fontSize: 14 }} />}
                                                    sx={{ textTransform: "none", fontSize: 11, color: "#6366f1", fontWeight: 600, minWidth: 0, px: 1 }}>
                                                    Tree
                                                </Button>
                                                <Tooltip title="Check for changes">
                                                    <IconButton size="small" onClick={() => handleCheck(api.id)}>
                                                        <RefreshRoundedIcon sx={{ fontSize: 15, color: "#64748b" }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton size="small" onClick={() => handleDelete(api.id)}>
                                                        <DeleteOutlineRoundedIcon sx={{ fontSize: 15, color: "#ef4444" }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Register Dialog */}
            <Dialog open={dlg} onClose={() => setDlg(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, fontSize: 16 }}>Register Public API</DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: "#64748b", fontSize: 12, mb: 2 }}>
                        Enter the OpenAPI URL. NovaGrid auto-discovers all endpoints, payloads, and responses.
                    </Typography>
                    <TextField fullWidth label="API Name" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g., Stripe, Petstore" size="small" sx={{ mb: 1.5 }} />
                    <TextField fullWidth label="Base URL" value={form.url}
                        onChange={(e) => setForm({ ...form, url: e.target.value })}
                        placeholder="e.g., https://api.stripe.com" size="small" sx={{ mb: 1.5 }} />
                    <TextField fullWidth label="OpenAPI URL *" value={form.openapi_url}
                        onChange={(e) => setForm({ ...form, openapi_url: e.target.value })}
                        placeholder="e.g., https://petstore.swagger.io/v2/swagger.json"
                        size="small" helperText="JSON or YAML file describing all API endpoints" sx={{ mb: 1 }}
                        InputProps={{ sx: { fontSize: 11, fontFamily: 'monospace' } }} />
                    <Box sx={{ mt: 1.5, p: 1.5, background: "#f1f5f9", borderRadius: 1.5 }}>
                        <Typography sx={{ fontSize: 10, fontWeight: 600, color: "#64748b", mb: 0.5, textTransform: "uppercase", letterSpacing: 0.3 }}>Quick start — click to fill</Typography>
                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                            {[
                                { n: "Petstore", u: "https://petstore.swagger.io/v2", s: "https://petstore.swagger.io/v2/swagger.json" },
                                { n: "httpbin", u: "https://httpbin.org", s: "https://httpbin.org/spec.json" },
                                { n: "Petstore v3", u: "https://petstore3.swagger.io", s: "https://petstore3.swagger.io/api/v3/openapi.json" },
                                { n: "Stripe", u: "https://api.stripe.com", s: "https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json" },
                                { n: "Ably", u: "https://realtime.ably.io", s: "https://api.apis.guru/v2/specs/ably.io/platform/1.1.0/openapi.json" },
                                { n: "Adafruit", u: "https://io.adafruit.com", s: "https://api.apis.guru/v2/specs/adafruit.com/2.0.0/swagger.json" },
                            ].map((d) => (
                                <Chip key={d.n} label={d.n} size="small" clickable
                                    onClick={() => setForm({ name: d.n, url: d.u, openapi_url: d.s })}
                                    sx={{ fontSize: 10, cursor: "pointer" }} />
                            ))}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDlg(false)} sx={{ textTransform: "none", color: "#64748b" }}>Cancel</Button>
                    <Button variant="contained" onClick={handleRegister} disabled={registering}
                        startIcon={registering ? <CircularProgress size={14} color="inherit" /> : <AddRoundedIcon />}
                        sx={{ textTransform: "none", fontWeight: 700, background: "#10b981", "&:hover": { background: "#059669" } }}>
                        {registering ? "Fetching..." : "Register"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })} message={snack.msg} />
        </Box>
    );
}
