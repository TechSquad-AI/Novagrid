import React, { useState } from "react";
import {
    Box, Typography, Card, CardContent, Button, TextField, Alert,
    CircularProgress, Divider, Chip, Snackbar,
} from "@mui/material";
import BugReportRoundedIcon from "@mui/icons-material/BugReportRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { analyzeLogs } from "../api/services";

export default function BugExplainer() {
    const [logs, setLogs] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [snack, setSnack] = useState({ open: false, msg: "" });

    const handleAnalyze = async () => {
        if (!logs.trim()) { setSnack({ open: true, msg: "Paste some error logs first" }); return; }
        setLoading(true);
        try {
            const r = await analyzeLogs(logs);
            setResult(r);
        } catch (e) {
            setSnack({ open: true, msg: e.response?.data?.detail || "Analysis failed" });
        }
        setLoading(false);
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                <BugReportRoundedIcon sx={{ fontSize: 24, color: "#ef4444" }} />
                <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: 22, color: "#0f172a" }}>Bug Explainer</Typography>
                    <Typography sx={{ color: "#94a3b8", fontSize: 12, mt: 0.3 }}>
                        Paste error logs and get AI-powered explanations linking errors to API changes
                    </Typography>
                </Box>
            </Box>

            {/* Input */}
            <Card sx={{ p: 2.5, borderRadius: 2, border: "1px solid #e2e8f0", mb: 3 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#0f172a", mb: 1.5 }}>
                    Paste error logs
                </Typography>
                <TextField fullWidth multiline rows={6} size="small"
                    value={logs} onChange={(e) => setLogs(e.target.value)}
                    placeholder={"Paste your error logs here...\n\nExample:\nKeyError: 'name'\n  File \"app/routes/users.py\", line 42\n  GET /api/users/123 returned 500"}
                    sx={{
                        mb: 1.5,
                        "& .MuiOutlinedInput-root": {
                            fontFamily: "monospace", fontSize: 12, borderRadius: 1.5,
                            background: "#0f172a",
                            color: "#e2e8f0",
                            "& fieldset": { borderColor: "#334155" },
                            "&:hover fieldset": { borderColor: "#475569" },
                            "&.Mui-focused fieldset": { borderColor: "#6366f1" },
                        },
                        "& .MuiInputBase-input::placeholder": { color: "#475569", opacity: 1 },
                    }} />
                <Button variant="contained" startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <SendRoundedIcon />}
                    onClick={handleAnalyze} disabled={loading}
                    sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700, fontSize: 13, px: 3,
                        background: "#ef4444", "&:hover": { background: "#dc2626" } }}>
                    {loading ? "Analyzing..." : "Explain Bug"}
                </Button>
            </Card>

            {/* Result */}
            {result && (
                <Card sx={{ borderRadius: 2, border: "1px solid #e2e8f0" }}>
                    <CardContent>
                        <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#0f172a", mb: 2 }}>Analysis Result</Typography>
                        <Divider sx={{ mb: 2 }} />

                        {/* Error Summary */}
                        {result.error_type && (
                            <Box sx={{ mb: 2 }}>
                                <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", mb: 0.5 }}>Error Type</Typography>
                                <Chip size="small" label={result.error_type}
                                    sx={{ fontSize: 10, height: 20, background: "#fef2f2", color: "#dc2626", fontWeight: 700 }} />
                            </Box>
                        )}

                        {/* Endpoint */}
                        {result.endpoint && (
                            <Box sx={{ mb: 2 }}>
                                <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", mb: 0.5 }}>Affected Endpoint</Typography>
                                <Typography sx={{ fontSize: 13, fontFamily: "monospace", color: "#334155" }}>{result.endpoint}</Typography>
                            </Box>
                        )}

                        {/* Likely Cause */}
                        {result.likely_cause && (
                            <Box sx={{ mb: 2, p: 2, background: "#fef3c7", borderRadius: 1.5 }}>
                                <Typography sx={{ fontSize: 10, color: "#92400e", fontWeight: 600, textTransform: "uppercase", mb: 0.5 }}>Likely Cause</Typography>
                                <Typography sx={{ fontSize: 13, color: "#92400e" }}>{result.likely_cause}</Typography>
                            </Box>
                        )}

                        {/* Related API Change */}
                        {result.related_change && (
                            <Box sx={{ mb: 2, p: 2, background: "#eef2ff", borderRadius: 1.5 }}>
                                <Typography sx={{ fontSize: 10, color: "#4338ca", fontWeight: 600, textTransform: "uppercase", mb: 0.5 }}>Related API Change</Typography>
                                <Typography sx={{ fontSize: 13, color: "#4338ca" }}>{result.related_change}</Typography>
                            </Box>
                        )}

                        {/* Suggested Fix */}
                        {result.suggested_fix && (
                            <Box sx={{ mb: 2, p: 2, background: "#ecfdf5", borderRadius: 1.5 }}>
                                <Typography sx={{ fontSize: 10, color: "#065f46", fontWeight: 600, textTransform: "uppercase", mb: 0.5 }}>Suggested Fix</Typography>
                                <Typography sx={{ fontSize: 13, color: "#065f46" }}>{result.suggested_fix}</Typography>
                            </Box>
                        )}

                        {/* Raw result if structured fields missing */}
                        {result.explanation && (
                            <Box sx={{ mt: 1 }}>
                                <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", mb: 0.5 }}>Explanation</Typography>
                                <Typography sx={{ fontSize: 13, color: "#334155", whiteSpace: "pre-wrap" }}>{result.explanation}</Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            )}

            {!result && !loading && (
                <Card sx={{ p: 6, textAlign: "center", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                    <BugReportRoundedIcon sx={{ fontSize: 40, color: "#e2e8f0", mb: 1 }} />
                    <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: 14, mb: 0.5 }}>No analysis yet</Typography>
                    <Typography sx={{ color: "#94a3b8", fontSize: 12 }}>Paste error logs and click "Explain Bug" to get AI-powered diagnosis</Typography>
                </Card>
            )}

            <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })} message={snack.msg} />
        </Box>
    );
}
