import React, { useState } from "react";
import {
    Box, Typography, Card, CardContent, Button, Chip, Alert, CircularProgress,
    TextField, Divider, Snackbar,
} from "@mui/material";
import AutoFixHighRoundedIcon from "@mui/icons-material/AutoFixHighRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { runAiFix, applyFix, rejectFix } from "../api/services";

export default function AiFix() {
    const [apiName, setApiName] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [applying, setApplying] = useState(false);
    const [snack, setSnack] = useState({ open: false, msg: "" });

    const handleFix = async () => {
        if (!apiName.trim()) { setSnack({ open: true, msg: "Enter an API name" }); return; }
        setLoading(true);
        try {
            const r = await runAiFix(apiName);
            setResult(r);
        } catch (e) {
            setSnack({ open: true, msg: e.response?.data?.detail || "AI Fix failed" });
        }
        setLoading(false);
    };

    const handleApply = async () => {
        if (!result?.fix_id) return;
        setApplying(true);
        try {
            await applyFix(result.fix_id);
            setSnack({ open: true, msg: "Fix applied" });
        } catch { setSnack({ open: true, msg: "Failed to apply" }); }
        setApplying(false);
    };

    const handleReject = async () => {
        if (!result?.fix_id) return;
        try {
            await rejectFix(result.fix_id);
            setSnack({ open: true, msg: "Fix rejected" });
            setResult(null);
        } catch { setSnack({ open: true, msg: "Failed" }); }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                <AutoFixHighRoundedIcon sx={{ fontSize: 24, color: "#8b5cf6" }} />
                <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: 22, color: "#0f172a" }}>AI Fix</Typography>
                    <Typography sx={{ color: "#94a3b8", fontSize: 12, mt: 0.3 }}>
                        Generate proposed fixes for API issues
                    </Typography>
                </Box>
            </Box>

            {/* Input */}
            <Card sx={{ p: 2.5, borderRadius: 2, border: "1px solid #e2e8f0", mb: 3 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#0f172a", mb: 1.5 }}>
                    Analyze an API for issues
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField size="small" fullWidth label="API Name or Endpoint"
                        value={apiName} onChange={(e) => setApiName(e.target.value)}
                        placeholder="e.g., Petstore, /api/users"
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }} />
                    <Button variant="contained" startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <SendRoundedIcon />}
                        onClick={handleFix} disabled={loading}
                        sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700, fontSize: 13, px: 3,
                            background: "#8b5cf6", "&:hover": { background: "#7c3aed" } }}>
                        Fix
                    </Button>
                </Box>
            </Card>

            {/* Result */}
            {result && (
                <Card sx={{ borderRadius: 2, border: "1px solid #e2e8f0" }}>
                    <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>Proposed Fix</Typography>
                            <Box sx={{ display: "flex", gap: 1 }}>
                                <Button variant="outlined" onClick={handleReject}
                                    sx={{ textTransform: "none", fontWeight: 600, fontSize: 12, color: "#ef4444", borderColor: "#fecaca" }}>
                                    Reject
                                </Button>
                                <Button variant="contained" startIcon={applying ? <CircularProgress size={12} color="inherit" /> : <CheckCircleRoundedIcon />}
                                    onClick={handleApply} disabled={applying}
                                    sx={{ textTransform: "none", fontWeight: 700, fontSize: 12, background: "#10b981", "&:hover": { background: "#059669" } }}>
                                    {applying ? "Applying..." : "Apply Fix"}
                                </Button>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {/* Diagnosis */}
                        {result.diagnosis && (
                            <Box sx={{ mb: 2 }}>
                                <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", mb: 0.5 }}>Diagnosis</Typography>
                                <Typography sx={{ fontSize: 13, color: "#334155" }}>{result.diagnosis}</Typography>
                            </Box>
                        )}

                        {/* Safety Check */}
                        {result.safety_check && (
                            <Box sx={{ mb: 2, p: 1.5, background: "#f8fafc", borderRadius: 1.5 }}>
                                <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", mb: 0.5 }}>Safety Check</Typography>
                                <Chip size="small" label={result.safety_check}
                                    sx={{ fontSize: 10, height: 20, background: result.safety_check === "safe" ? "#ecfdf5" : "#fef3c7", color: result.safety_check === "safe" ? "#059669" : "#d97706" }} />
                            </Box>
                        )}

                        {/* Confidence */}
                        {result.confidence !== undefined && (
                            <Box sx={{ mb: 2 }}>
                                <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", mb: 0.5 }}>Confidence</Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Box sx={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                                        <Box sx={{ width: `${(result.confidence || 0) * 100}%`, height: "100%", background: "#6366f1", borderRadius: 3 }} />
                                    </Box>
                                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#6366f1" }}>
                                        {Math.round((result.confidence || 0) * 100)}%
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {/* Proposed Changes */}
                        {result.changes?.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                                <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", mb: 0.5 }}>Proposed Changes</Typography>
                                {result.changes.map((c, i) => (
                                    <Alert key={i} severity="info" sx={{ mb: 0.5, borderRadius: 1, fontSize: 11 }}>
                                        {typeof c === "string" ? c : c.detail || JSON.stringify(c)}
                                    </Alert>
                                ))}
                            </Box>
                        )}

                        {/* Summary */}
                        {result.summary && (
                            <Box sx={{ p: 1.5, background: "#f8fafc", borderRadius: 1.5 }}>
                                <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", mb: 0.5 }}>Summary</Typography>
                                <Typography sx={{ fontSize: 12, color: "#334155" }}>{result.summary}</Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            )}

            {!result && !loading && (
                <Card sx={{ p: 6, textAlign: "center", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                    <AutoFixHighRoundedIcon sx={{ fontSize: 40, color: "#e2e8f0", mb: 1 }} />
                    <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: 14, mb: 0.5 }}>No analysis yet</Typography>
                    <Typography sx={{ color: "#94a3b8", fontSize: 12 }}>Enter an API name and click Fix to generate proposed changes</Typography>
                </Card>
            )}

            <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })} message={snack.msg} />
        </Box>
    );
}
