import React, { useState, useEffect } from "react";
import { Box, Typography, Chip, Button, Alert, TextField, Divider } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../context/SidebarContext";
import Navbar from "../components/Navbar";
import { getPendingApprovals, approveRepair, rejectRepair } from "../api/services";

function HumanValidation() {
    const { open: sidebarOpen } = useSidebar();
    const sidebarMargin = sidebarOpen ? "250px" : "0px";
    const [approvals, setApprovals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alertMsg, setAlertMsg] = useState(null);
    const [comment, setComment] = useState("");

    useEffect(() => {
        getPendingApprovals().then(r => setApprovals(r.approvals || [])).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const handleApprove = async (id) => {
        try { await approveRepair(id); setAlertMsg("Fix approved successfully!"); setApprovals(a => a.filter(x => x.id !== id)); } catch { setAlertMsg("Failed to approve"); }
    };

    const handleReject = async (id) => {
        try { await rejectRepair(id); setAlertMsg("Fix rejected"); setApprovals(a => a.filter(x => x.id !== id)); } catch { setAlertMsg("Failed to reject"); }
    };

    return (
        <Box sx={{ display: "flex", height: "100vh", overflowY: "auto", background: "#f8f9fb" }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, ml: sidebarMargin, p: 3, position: "relative", zIndex: 1 }}>
                <Navbar subtitle="AI Fix > Human Validation" title="Human Validation" />

                {alertMsg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setAlertMsg(null)}>{alertMsg}</Alert>}

                {approvals.length > 0 && (
                    <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 3, background: "rgba(234,88,12,0.06)", border: "1px solid rgba(234,88,12,0.15)", color: "#92400e" }}>
                        <Typography sx={{ fontWeight: 700 }}>Human Review Required</Typography>
                        {approvals.length} fix(es) require your approval before being applied.
                    </Alert>
                )}

                {approvals.map((a, i) => (
                    <Box key={a.id} sx={{ background: "#fff", borderRadius: 2.5, p: 3, border: "1px solid #e5e7eb", mb: 2 }}>
                        {/* Header */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Chip label="POST" sx={{ fontSize: 10, height: 20, background: "rgba(26,115,232,0.1)", color: "#1a73e8", fontWeight: 700 }} />
                                <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#1a1f36" }}>{a.affected_file || "Unknown file"}</Typography>
                            </Box>
                            <Chip icon={<WarningAmberIcon />} label="HUMAN REVIEW REQUIRED"
                                sx={{ background: "rgba(234,88,12,0.1)", color: "#ea580c", fontWeight: 700, height: 28 }} />
                        </Box>

                        <Typography sx={{ color: "#6b7280", fontSize: 13, mb: 2 }}>{a.reason || "AI generated fix requires human review."}</Typography>

                        {/* Stats Row */}
                        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mb: 3 }}>
                            <Box sx={{ py: 1.5, px: 2, borderRadius: 2, background: "#f9fafb" }}>
                                <Typography sx={{ color: "#6b7280", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>Validation Status</Typography>
                                <Typography sx={{ color: "#ea580c", fontSize: 14, fontWeight: 700, mt: 0.5 }}>⏳ Waiting for Review</Typography>
                            </Box>
                            <Box sx={{ py: 1.5, px: 2, borderRadius: 2, background: "#f9fafb" }}>
                                <Typography sx={{ color: "#6b7280", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>Change Summary</Typography>
                                <Typography sx={{ color: "#1a1f36", fontSize: 13, mt: 0.5 }}>Breaking change detected</Typography>
                                <Typography sx={{ color: "#6b7280", fontSize: 12 }}>1 line changed</Typography>
                            </Box>
                            <Box sx={{ py: 1.5, px: 2, borderRadius: 2, background: "#f9fafb" }}>
                                <Typography sx={{ color: "#6b7280", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>AI Recommendation</Typography>
                                <Typography sx={{ color: "#0d9488", fontSize: 13, fontWeight: 700, mt: 0.5 }}>Apply the generated patch</Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                                    <Typography sx={{ color: "#6b7280", fontSize: 11 }}>Confidence: 94%</Typography>
                                    <Box sx={{ flex: 1, height: 4, borderRadius: 2, background: "#e5e7eb" }}><Box sx={{ width: "94%", height: "100%", borderRadius: 2, background: "#0d9488" }} /></Box>
                                </Box>
                            </Box>
                            <Box sx={{ py: 1.5, px: 2, borderRadius: 2, background: "#f9fafb" }}>
                                <Typography sx={{ color: "#6b7280", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>Test Results</Typography>
                                <Box sx={{ display: "flex", gap: 2, mt: 0.5 }}>
                                    <Box><Typography sx={{ color: "#1a1f36", fontSize: 16, fontWeight: 800 }}>12</Typography><Typography sx={{ color: "#9ca3af", fontSize: 10 }}>Total</Typography></Box>
                                    <Box><Typography sx={{ color: "#0d9488", fontSize: 16, fontWeight: 800 }}>12</Typography><Typography sx={{ color: "#9ca3af", fontSize: 10 }}>Passed</Typography></Box>
                                    <Box><Typography sx={{ color: "#dc2626", fontSize: 16, fontWeight: 800 }}>0</Typography><Typography sx={{ color: "#9ca3af", fontSize: 10 }}>Failed</Typography></Box>
                                </Box>
                            </Box>
                        </Box>

                        {/* Code Review */}
                        <Box sx={{ mb: 3 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1a1f36", mb: 1.5 }}>Code Review</Typography>
                            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                                <Box>
                                    <Typography sx={{ color: "#dc2626", fontSize: 12, fontWeight: 700, mb: 0.5 }}>BEFORE</Typography>
                                    <Box sx={{ background: "#0f172a", borderRadius: 2, p: 2 }}>
                                        <pre style={{ color: "#94a3b8", fontSize: 12, margin: 0, fontFamily: "monospace", lineHeight: 1.8 }}>
                                            {"1  const payment = {\n2    "}<span style={{ color: "#fca5a5", background: "rgba(239,68,68,0.2)", padding: "0 4px", borderRadius: 3 }}>{a.old_code || "amount: amount"}</span>{"\n3  };"}
                                        </pre>
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography sx={{ color: "#0d9488", fontSize: 12, fontWeight: 700, mb: 0.5 }}>AFTER</Typography>
                                    <Box sx={{ background: "#0f172a", borderRadius: 2, p: 2 }}>
                                        <pre style={{ color: "#94a3b8", fontSize: 12, margin: 0, fontFamily: "monospace", lineHeight: 1.8 }}>
                                            {"1  const payment = {\n2    "}<span style={{ color: "#86efac", background: "rgba(34,197,94,0.2)", padding: "0 4px", borderRadius: 3 }}>{a.proposed_code || "total_amount: amount"}</span>{"\n3  };"}
                                        </pre>
                                    </Box>
                                </Box>
                            </Box>
                            <Typography sx={{ color: "#9ca3af", fontSize: 12, mt: 1 }}>Changes in this file: 1 line | Total files: 1 | Total changes: 1 line</Typography>
                        </Box>

                        {/* Why + Decision + Progress */}
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, mb: 3 }}>
                            <Box sx={{ py: 2, px: 2.5, borderRadius: 2, background: "#fff", border: "1px solid #e5e7eb" }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#1a1f36", mb: 1 }}>Why Human Review?</Typography>
                                <Typography sx={{ color: "#6b7280", fontSize: 12, mb: 1 }}>NovaGrid requests human approval because:</Typography>
                                {["This is a breaking API change", "1 file and 1 function are affected", "Request payload format is modified", "AI confidence is below threshold"].map((item, i) => (
                                    <Typography key={i} sx={{ color: "#374151", fontSize: 12, py: 0.3 }}>• {item}</Typography>
                                ))}
                                <Box sx={{ mt: 1.5, py: 1, px: 1.5, borderRadius: 1.5, background: "rgba(234,88,12,0.06)", border: "1px solid rgba(234,88,12,0.15)" }}>
                                    <Typography sx={{ color: "#92400e", fontSize: 11, fontWeight: 600 }}>Human decision is required to ensure safety.</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ py: 2, px: 2.5, borderRadius: 2, background: "#fff", border: "1px solid #e5e7eb" }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#1a1f36", mb: 1 }}>Human Decision</Typography>
                                <Typography sx={{ color: "#6b7280", fontSize: 12, mb: 1.5 }}>Is this fix correct and safe to apply?</Typography>
                                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                                    <Button variant="contained" startIcon={<CheckCircleIcon />} onClick={() => handleApprove(a.id)}
                                        sx={{ background: "#0d9488", "&:hover": { background: "#0f766e" }, textTransform: "none", fontSize: 12 }}>Approve Fix</Button>
                                    <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => handleReject(a.id)}
                                        sx={{ borderColor: "#dc2626", color: "#dc2626", textTransform: "none", fontSize: 12 }}>Reject</Button>
                                    <Button variant="outlined" startIcon={<EditIcon />}
                                        sx={{ textTransform: "none", fontSize: 12, color: "#6b7280" }}>Request Changes</Button>
                                </Box>
                                <Typography sx={{ color: "#6b7280", fontSize: 11, fontWeight: 600, mb: 0.5 }}>REVIEW COMMENT (optional)</Typography>
                                <TextField fullWidth size="small" placeholder="Add your comments, notes or feedback..." value={comment} onChange={e => setComment(e.target.value)}
                                    multiline rows={2} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 }, mb: 1 }} />
                                <Button variant="contained" size="small" sx={{ textTransform: "none" }}>Submit Review</Button>
                            </Box>
                            <Box sx={{ py: 2, px: 2.5, borderRadius: 2, background: "#fff", border: "1px solid #e5e7eb" }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#1a1f36", mb: 1 }}>Review Progress</Typography>
                                {[{ l: "AI Analysis", s: "Completed" }, { l: "Impact Analysis", s: "Completed" }, { l: "AI Fix Generated", s: "Completed" }, { l: "Tests Executed", s: "12/12 Passed" }, { l: "Human Review", s: "Pending" }, { l: "Final Decision", s: "Pending" }].map((item, i) => (
                                    <Box key={i} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 0.5 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            {item.s === "Completed" || item.s.includes("Passed") ? (
                                                <CheckCircleIcon sx={{ fontSize: 14, color: "#0d9488" }} />
                                            ) : (
                                                <Box sx={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #d1d5db" }} />
                                            )}
                                            <Typography sx={{ fontSize: 12, color: "#374151" }}>{item.l}</Typography>
                                        </Box>
                                        <Typography sx={{ fontSize: 11, color: item.s === "Pending" ? "#ea580c" : "#0d9488", fontWeight: 600 }}>{item.s}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>
                ))}

                {!loading && approvals.length === 0 && (
                    <Box sx={{ background: "#fff", borderRadius: 2.5, p: 6, border: "1px solid #e5e7eb", textAlign: "center" }}>
                        <CheckCircleIcon sx={{ fontSize: 48, color: "#0d9488", mb: 2 }} />
                        <Typography sx={{ color: "#1a1f36", fontSize: 18, fontWeight: 700, mb: 1 }}>All caught up!</Typography>
                        <Typography sx={{ color: "#9ca3af", fontSize: 14 }}>No pending approvals. All fixes have been reviewed.</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
export default HumanValidation;
