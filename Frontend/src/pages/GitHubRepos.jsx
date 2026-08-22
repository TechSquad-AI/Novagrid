import React, { useState, useEffect, useCallback } from "react";
import {
    Box, Typography, Card, CardContent, Button, TextField, CircularProgress,
    Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, Chip,
    IconButton, Tooltip,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { listGitHubRepos, registerGitHubRepo, getGitHubRepoTree, checkGitHubRepo, deleteGitHubRepo } from "../api/services";
import TreeGraph, { TreeLegend } from "../components/TreeGraph";

const MC = { GET: "#10b981", POST: "#6366f1", PUT: "#f59e0b", PATCH: "#f59e0b", DELETE: "#ef4444" };

export default function GitHubRepos() {
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [tree, setTree] = useState(null);
    const [treeLoading, setTreeLoading] = useState(false);
    const [dlg, setDlg] = useState(false);
    const [form, setForm] = useState({ name: "", repo_url: "" });
    const [registering, setRegistering] = useState(false);
    const [sel, setSel] = useState(null);
    const [snack, setSnack] = useState({ open: false, msg: "" });

    const load = useCallback(async () => {
        setLoading(true);
        try { const r = await listGitHubRepos(); setRepos(r.repos || []); }
        catch { setRepos([]); }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleRegister = async () => {
        if (!form.name || !form.repo_url) { setSnack({ open: true, msg: "Name and repo URL required" }); return; }
        setRegistering(true);
        try {
            const r = await registerGitHubRepo(form.name, form.repo_url);
            setSnack({ open: true, msg: `${r.name}: ${r.total_endpoints} endpoints discovered` });
            setDlg(false);
            setForm({ name: "", repo_url: "" });
            await load();
        } catch (e) { setSnack({ open: true, msg: e.response?.data?.detail || "Failed to register" }); }
        setRegistering(false);
    };

    const handleViewTree = async (repo) => {
        setSelected(repo);
        setTreeLoading(true);
        try { const r = await getGitHubRepoTree(repo.id); setTree(r.tree); }
        catch { setTree(null); }
        setTreeLoading(false);
    };

    const handleCheck = async (repoId) => {
        try {
            const r = await checkGitHubRepo(repoId);
            setSnack({ open: true, msg: r.has_changes ? `Changes found: ${r.total_changes} changes` : "No changes detected" });
            await load();
        } catch { setSnack({ open: true, msg: "Check failed" }); }
    };

    const handleDelete = async (repoId) => {
        try {
            await deleteGitHubRepo(repoId);
            setSnack({ open: true, msg: "Removed" });
            if (selected?.id === repoId) { setSelected(null); setTree(null); }
            await load();
        } catch { setSnack({ open: true, msg: "Failed" }); }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <span style={{ fontSize: 24 }}>{"\u25B3"}</span>
                    <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: 22, color: "#0f172a" }}>
                            {selected ? selected.name : "GitHub Repos"}
                        </Typography>
                        <Typography sx={{ color: "#94a3b8", fontSize: 12, mt: 0.3 }}>
                            {selected ? `${tree?.total_endpoints || 0} endpoints discovered from code` : `${repos.length} monitored repositories`}
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
                            Add Repository
                        </Button>
                    )}
                </Box>
            </Box>

            {selected ? (
                treeLoading ? (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 8, gap: 1 }}>
                        <CircularProgress size={24} sx={{ color: "#10b981" }} />
                        <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>Scanning repository...</Typography>
                    </Box>
                ) : tree ? (
                    <>
                        <TreeGraph tree={tree} onSelect={(ep) => setSel(sel?.path === ep.path && sel?.method === ep.method ? null : ep)} selectedId={sel ? `${sel.method}${sel.path}` : null} accentColor="#10b981" />
                        <TreeLegend accentColor="#10b981" />
                        {sel && (
                            <Card sx={{ mt: 2, borderRadius: 2, border: "1px solid #e2e8f0" }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                        <Chip label={sel.method} size="small" sx={{ width: 48, height: 20, fontSize: 10, fontWeight: 700, background: MC[sel.method], color: "#fff" }} />
                                        <Typography sx={{ fontWeight: 700, fontSize: 14, fontFamily: "monospace", color: "#0f172a", flex: 1 }}>{sel.path}</Typography>
                                        <Button size="small" onClick={() => setSel(null)} sx={{ textTransform: "none", fontSize: 11, color: "#94a3b8" }}>Close</Button>
                                    </Box>
                                    <Box sx={{ height: 1, background: "#e2e8f0", my: 1 }} />
                                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 2 }}>
                                        <Box>
                                            <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", mb: 0.2 }}>Function</Typography>
                                            <Typography sx={{ fontSize: 12, color: "#334155", fontFamily: "monospace" }}>{sel.function || "\u2014"}()</Typography>
                                        </Box>
                                        <Box>
                                            <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", mb: 0.2 }}>Source File</Typography>
                                            <Typography sx={{ fontSize: 12, color: "#334155", fontFamily: "monospace" }}>{sel.file || "\u2014"}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", mb: 0.2 }}>Validation</Typography>
                                            <Chip size="small" label={sel.has_validation ? "Validated" : "No validation"} sx={{ fontSize: 9, height: 18, background: sel.has_validation ? "#ecfdf5" : "#fef3c7", color: sel.has_validation ? "#059669" : "#d97706" }} />
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        )}
                    </>
                ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>No tree data available. Click check to scan.</Alert>
                )
            ) : loading ? (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 8, gap: 1 }}>
                    <CircularProgress size={24} sx={{ color: "#10b981" }} />
                    <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>Loading...</Typography>
                </Box>
            ) : repos.length === 0 ? (
                <Card sx={{ borderRadius: 2, border: "1px solid #e2e8f0", p: 6, textAlign: "center" }}>
                    <Typography sx={{ fontSize: 40, color: "#e2e8f0", mb: 1 }}>{"\u25B3"}</Typography>
                    <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: 14, mb: 0.5 }}>No repositories monitored</Typography>
                    <Typography sx={{ color: "#94a3b8", fontSize: 12, mb: 3 }}>Add a GitHub repo to auto-scan for API endpoints</Typography>
                    <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDlg(true)}
                        sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, background: "#10b981" }}>
                        Add First Repo
                    </Button>
                </Card>
            ) : (
                <Card sx={{ borderRadius: 2, border: "1px solid #e2e8f0" }}>
                    <CardContent sx={{ p: 0 }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr>
                                    {["Name", "Repository URL", "Branch", "Last Checked", "Actions"].map((h) => (
                                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {repos.map((repo) => (
                                    <tr key={repo.id} style={{ cursor: "pointer" }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                                        <td style={{ padding: "12px 16px" }}>
                                            <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{repo.name}</Typography>
                                        </td>
                                        <td style={{ padding: "12px 16px", fontSize: 11, fontFamily: "monospace", color: "#64748b", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {repo.repo_url}
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <Chip size="small" label={repo.branch || "main"} sx={{ fontSize: 9, height: 18 }} />
                                        </td>
                                        <td style={{ padding: "12px 16px", fontSize: 11, color: "#94a3b8" }}>
                                            {repo.last_checked ? new Date(repo.last_checked).toLocaleString() : "Never"}
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <div style={{ display: "flex", gap: 4 }}>
                                                <Button size="small" onClick={() => handleViewTree(repo)} startIcon={<AccountTreeRoundedIcon sx={{ fontSize: 14 }} />}
                                                    sx={{ textTransform: "none", fontSize: 11, color: "#6366f1", fontWeight: 600, minWidth: 0, px: 1 }}>Tree</Button>
                                                <Tooltip title="Scan for changes">
                                                    <IconButton size="small" onClick={() => handleCheck(repo.id)}>
                                                        <RefreshRoundedIcon sx={{ fontSize: 15, color: "#64748b" }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton size="small" onClick={() => handleDelete(repo.id)}>
                                                        <DeleteOutlineRoundedIcon sx={{ fontSize: 15, color: "#ef4444" }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            )}

            {/* Register Dialog */}
            <Dialog open={dlg} onClose={() => setDlg(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, fontSize: 16 }}>Add GitHub Repository</DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: "#64748b", fontSize: 12, mb: 2 }}>
                        NovaGrid clones the repo, scans all code for API endpoints, and builds the tree graph.
                    </Typography>
                    <TextField fullWidth label="Repository Name" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g., My API Project" size="small" sx={{ mb: 1.5 }} />
                    <TextField fullWidth label="GitHub Repository URL *" value={form.repo_url}
                        onChange={(e) => setForm({ ...form, repo_url: e.target.value })}
                        placeholder="e.g., https://github.com/user/repo"
                        size="small" helperText="Public GitHub repository URL" sx={{ mb: 1 }} />
                    <Box sx={{ mt: 1.5, p: 1.5, background: "#f1f5f9", borderRadius: 1.5 }}>
                        <Typography sx={{ fontSize: 10, fontWeight: 600, color: "#64748b", mb: 0.5, textTransform: "uppercase", letterSpacing: 0.3 }}>What gets scanned</Typography>
                        <Typography sx={{ fontSize: 11, color: "#64748b" }}>Python files with FastAPI routes (decorated with @app.get, @app.post, etc.)</Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDlg(false)} sx={{ textTransform: "none", color: "#64748b" }}>Cancel</Button>
                    <Button variant="contained" onClick={handleRegister} disabled={registering}
                        startIcon={registering ? <CircularProgress size={14} color="inherit" /> : <AddRoundedIcon />}
                        sx={{ textTransform: "none", fontWeight: 700, background: "#10b981", "&:hover": { background: "#059669" } }}>
                        {registering ? "Scanning..." : "Add Repository"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })} message={snack.msg} />
        </Box>
    );
}
