import React, { useState } from "react";
import {
    Box, Typography, Card, CardContent, TextField, Button, CircularProgress,
    Table, TableBody, TableCell, TableHead, TableRow, Chip, Alert, Snackbar,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
    listPublicAPIs, getPublicAPITree, getPublicAPICheck,
} from "../api/services";

const MC = { GET: "#10b981", POST: "#6366f1", PUT: "#f59e0b", PATCH: "#f59e0b", DELETE: "#ef4444" };

export default function AnalyzeApi() {
    const [apis, setApis] = useState([]);
    const [selected, setSelected] = useState(null);
    const [tree, setTree] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [snack, setSnack] = useState({ open: false, msg: "" });

    React.useEffect(() => {
        (async () => {
            try {
                const r = await listPublicAPIs();
                setApis(r.apis || []);
            } catch { setApis([]); }
            setLoading(false);
        })();
    }, []);

    const handleAnalyze = async (api) => {
        setSelected(api);
        setAnalyzing(true);
        try {
            const r = await getPublicAPICheck(api.id);
            setTree(r.tree || null);
            setSnack({ open: true, msg: `${api.name}: ${r.total_endpoints || 0} endpoints analyzed` });
        } catch {
            // Try getting the stored tree
            try {
                const r2 = await getPublicAPITree(api.id);
                setTree(r2.tree || null);
            } catch { setTree(null); }
        }
        setAnalyzing(false);
    };

    const endpoints = [];
    if (tree?.children) {
        const flatten = (node) => {
            if (node.method) endpoints.push(node);
            node.children?.forEach(flatten);
        };
        tree.children.forEach(flatten);
    }

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
            <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 22, color: "#0f172a" }}>Analyze API</Typography>
                <Typography sx={{ color: "#94a3b8", fontSize: 12, mt: 0.3 }}>
                    Select a registered API to analyze its endpoints, payloads, and responses
                </Typography>
            </Box>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
                    <CircularProgress size={28} sx={{ color: "#6366f1" }} />
                </Box>
            ) : apis.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                    No APIs registered yet. Go to <strong>Public APIs</strong> to register one first.
                </Alert>
            ) : (
                <>
                    {/* API List */}
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 1.5, mb: 3 }}>
                        {apis.map((api) => (
                            <Card key={api.id}
                                onClick={() => handleAnalyze(api)}
                                sx={{
                                    p: 2, borderRadius: 2, border: "1px solid #e2e8f0", cursor: "pointer",
                                    transition: "all 0.15s",
                                    "&:hover": { borderColor: "#6366f1", transform: "translateY(-1px)" },
                                }}
                            >
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{api.name}</Typography>
                                    <SearchRoundedIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                                </Box>
                                <Typography sx={{ fontSize: 11, color: "#94a3b8", mt: 0.5, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {api.base_url || "No URL"}
                                </Typography>
                                <Chip size="small" label={api.openapi_url ? "OpenAPI Connected" : "No Spec"}
                                    sx={{ mt: 1, fontSize: 9, height: 18, background: api.openapi_url ? "#ecfdf5" : "#f1f5f9", color: api.openapi_url ? "#059669" : "#64748b" }} />
                            </Card>
                        ))}
                    </Box>

                    {/* Analysis Results */}
                    {selected && (
                        <Card sx={{ borderRadius: 2, border: "1px solid #e2e8f0" }}>
                            <CardContent>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                    <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                                        {selected.name} — Analysis
                                    </Typography>
                                    {analyzing && <CircularProgress size={18} sx={{ color: "#6366f1" }} />}
                                </Box>

                                {endpoints.length > 0 ? (
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Method</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Path</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Function</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Validation</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {endpoints.map((ep, i) => (
                                                <TableRow key={i} sx={{ "&:hover": { background: "#f8fafc" } }}>
                                                    <TableCell>
                                                        <Chip size="small" label={ep.method}
                                                            sx={{ fontSize: 9, height: 18, background: MC[ep.method] || "#666", color: "#fff", fontWeight: 700 }} />
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: 11, fontFamily: "monospace" }}>{ep.path}</TableCell>
                                                    <TableCell sx={{ fontSize: 11, color: "#64748b" }}>{ep.function || "\u2014"}</TableCell>
                                                    <TableCell>
                                                        <Chip size="small" label={ep.has_validation ? "Validated" : "No Validation"}
                                                            sx={{ fontSize: 9, height: 18, background: ep.has_validation ? "#ecfdf5" : "#fef3c7", color: ep.has_validation ? "#059669" : "#d97706" }} />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <Typography sx={{ color: "#94a3b8", fontSize: 13, textAlign: "center", py: 4 }}>
                                        {analyzing ? "Analyzing..." : "Click an API above to analyze"}
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })} message={snack.msg} />
        </Box>
    );
}
