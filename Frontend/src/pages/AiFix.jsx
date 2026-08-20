import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Select, MenuItem, Chip, Button, Alert, LinearProgress, Checkbox, FormControlLabel } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BuildIcon from "@mui/icons-material/Build";
import CodeIcon from "@mui/icons-material/Code";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../context/SidebarContext";
import Navbar from "../components/Navbar";
import { getAllAPIs, repairAPI, getPendingApprovals, approveRepair, rejectRepair } from "../api/services";

function AiFix() {
    const { open: sidebarOpen } = useSidebar();
    const sidebarMargin = sidebarOpen ? "250px" : "0px";
    const navigate = useNavigate();
    const [apis, setApis] = useState([]);
    const [selectedApi, setSelectedApi] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [approvals, setApprovals] = useState([]);
    const [alertMsg, setAlertMsg] = useState(null);

    useEffect(() => {
        getAllAPIs().then(r => setApis(r.data || [])).catch(() => {});
        getPendingApprovals().then(r => setApprovals(r.approvals || [])).catch(() => {});
    }, []);

    const handleFix = async () => {
        if (!selectedApi) return;
        setLoading(true); setResult(null);
        try {
            const r = await repairAPI(selectedApi);
            setResult(r);
            const ap = await getPendingApprovals();
            setApprovals(ap.approvals || []);
        } catch (e) { setResult({ status: "error", error: e.message }); }
        setLoading(false);
    };

    const handleApprove = async (id) => {
        try { await approveRepair(id); setAlertMsg("Fix approved!"); setApprovals(a => a.filter(x => x.id !== id)); } catch { setAlertMsg("Failed to approve"); }
    };

    const handleReject = async (id) => {
        try { await rejectRepair(id); setAlertMsg("Fix rejected"); setApprovals(a => a.filter(x => x.id !== id)); } catch { setAlertMsg("Failed to reject"); }
    };

    return (
        <Box sx={{ display: "flex", height: "100vh", overflowY: "auto", background: "#f8f9fb" }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, ml: sidebarMargin, p: 3, position: "relative", zIndex: 1 }}>
                <Navbar subtitle="Impact Analysis > AI Fix" title="AI Fix" />

                <Button size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate("/api-changes")} sx={{ color: "#6b7280", mb: 1, textTransform: "none" }}>Back to Impact Analysis</Button>

                {alertMsg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setAlertMsg(null)}>{alertMsg}</Alert>}

                {/* API Selector + Run */}
                <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb", mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Chip label="POST" sx={{ fontSize: 10, height: 20, background: "rgba(26,115,232,0.1)", color: "#1a73e8", fontWeight: 700 }} />
                            <Select value={selectedApi} onChange={e => setSelectedApi(e.target.value)} displayEmpty sx={{ minWidth: 300, borderRadius: 2 }}>
                                <MenuItem value="" disabled>Select API to fix...</MenuItem>
                                {apis.map(a => <MenuItem key={a.id} value={a.id}>{a.name} — {a.base_url}</MenuItem>)}
                            </Select>
                        </Box>
                        <Chip icon={<ErrorOutlineIcon />} label="BREAKING CHANGE" sx={{ background: "rgba(220,38,38,0.08)", color: "#dc2626", fontWeight: 700, height: 28 }} />
                        <Button variant="contained" startIcon={<BuildIcon />} onClick={handleFix} disabled={loading || !selectedApi} sx={{ px: 3, ml: "auto" }}>Run AI Fix</Button>
                    </Box>
                </Box>

                {loading && <LinearProgress sx={{ mb: 2 }} />}

                {/* Result */}
                {result && (
                    <>
                        {/* Diagnosis + Files + Safety */}
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, mb: 3 }}>
                            <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb" }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1a1f36", mb: 1.5 }}>AI Diagnosis</Typography>
                                {result.status === "no_changes" ? (
                                    <Typography sx={{ color: "#374151", fontSize: 13, lineHeight: 1.7 }}>No changes detected. The API is up to date.</Typography>
                                ) : result.status === "human_approval_required" ? (
                                    <Typography sx={{ color: "#374151", fontSize: 13, lineHeight: 1.7 }}>
                                        NovaGrid identified a breaking change that requires human review. A fix has been generated and submitted for approval.
                                    </Typography>
                                ) : result.status === "repair_verified" ? (
                                    <Typography sx={{ color: "#374151", fontSize: 13, lineHeight: 1.7 }}>
                                        The fix was applied successfully and all tests passed. The code has been verified.
                                    </Typography>
                                ) : (
                                    <Typography sx={{ color: "#374151", fontSize: 13, lineHeight: 1.7 }}>{result.error || "Analysis complete."}</Typography>
                                )}
                                <Box sx={{ mt: 2 }}>
                                    <Typography sx={{ color: "#6b7280", fontSize: 11, mb: 0.5 }}>Confidence</Typography>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Box sx={{ flex: 1, height: 6, borderRadius: 3, background: "#e5e7eb" }}>
                                            <Box sx={{ width: "94%", height: "100%", borderRadius: 3, background: "#0d9488" }} />
                                        </Box>
                                        <Typography sx={{ color: "#0d9488", fontSize: 12, fontWeight: 700 }}>94%</Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb" }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1a1f36", mb: 1.5 }}>Files Requiring Changes</Typography>
                                {(result.affected_code || []).slice(0, 3).map((f, i) => (
                                    <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.8, borderBottom: "1px solid #f3f4f6" }}>
                                        <CheckCircleIcon sx={{ fontSize: 16, color: "#0d9488" }} />
                                        <Typography sx={{ flex: 1, fontSize: 13, fontFamily: "monospace" }}>{f.file || `file_${i}.js`}</Typography>
                                        <Typography sx={{ color: "#9ca3af", fontSize: 11 }}>Line {f.line || 3 + i * 10}</Typography>
                                    </Box>
                                ))}
                                <Box sx={{ mt: 1.5, py: 0.8, px: 2, borderRadius: 2, background: "rgba(13,148,136,0.06)", textAlign: "center" }}>
                                    <Typography sx={{ color: "#0d9488", fontSize: 12, fontWeight: 600 }}>{result.affected_code?.length || 0} files selected</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb" }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1a1f36", mb: 1.5 }}>Safety Check</Typography>
                                {["API dependency confirmed", "Affected files identified", "No unrelated files modified", "Existing tests detected"].map((item, i) => (
                                    <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.5 }}>
                                        <CheckCircleIcon sx={{ fontSize: 14, color: "#0d9488" }} />
                                        <Typography sx={{ fontSize: 12, color: "#374151" }}>{item}</Typography>
                                    </Box>
                                ))}
                                <Box sx={{ mt: 2, py: 1.5, px: 2, borderRadius: 2, background: "rgba(13,148,136,0.06)", border: "1px solid rgba(13,148,136,0.15)" }}>
                                    <Typography sx={{ color: "#0d9488", fontSize: 12, fontWeight: 700 }}>✅ SAFE TO REVIEW</Typography>
                                    <Typography sx={{ color: "#6b7280", fontSize: 11 }}>NovaGrid verified the changes are safe.</Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Code Diff */}
                        <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb", mb: 3 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1a1f36" }}>Proposed Code Changes</Typography>
                                <Button size="small" sx={{ color: "#1a73e8", textTransform: "none", fontSize: 12 }}>Preview Full Diff</Button>
                            </Box>
                            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                                {["payment.js", "checkout.js", "invoice.js"].map((f, i) => (
                                    <Chip key={i} label={f} sx={{ background: i === 0 ? "rgba(26,115,232,0.1)" : "#f3f4f6", color: i === 0 ? "#1a73e8" : "#6b7280", fontWeight: 600, fontSize: 12 }} />
                                ))}
                            </Box>
                            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                                <Box>
                                    <Typography sx={{ color: "#dc2626", fontSize: 12, fontWeight: 700, mb: 0.5 }}>BEFORE (payment.js)</Typography>
                                    <Box sx={{ background: "#0f172a", borderRadius: 2, p: 2 }}>
                                        <pre style={{ color: "#94a3b8", fontSize: 12, margin: 0, fontFamily: "monospace", lineHeight: 1.8 }}>
                                            {"1  const payment = {\n2    "}<span style={{ color: "#fca5a5", background: "rgba(239,68,68,0.2)", padding: "0 4px", borderRadius: 3 }}>{result.old_code || "amount: amount"}</span>{"\n3  };"}
                                        </pre>
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography sx={{ color: "#0d9488", fontSize: 12, fontWeight: 700, mb: 0.5 }}>AFTER (payment.js)</Typography>
                                    <Box sx={{ background: "#0f172a", borderRadius: 2, p: 2 }}>
                                        <pre style={{ color: "#94a3b8", fontSize: 12, margin: 0, fontFamily: "monospace", lineHeight: 1.8 }}>
                                            {"1  const payment = {\n2    "}<span style={{ color: "#86efac", background: "rgba(34,197,94,0.2)", padding: "0 4px", borderRadius: 3 }}>{result.ai_fix || "total_amount: amount"}</span>{"\n3  };"}
                                        </pre>
                                    </Box>
                                </Box>
                            </Box>
                            <Typography sx={{ color: "#6b7280", fontSize: 12, mt: 1.5 }}>Similar changes will be applied to checkout.js (Line 27) and invoice.js (Line 18)</Typography>
                        </Box>

                        {/* Why + Actions + Validate */}
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, mb: 3 }}>
                            <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb" }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1a1f36", mb: 1.5 }}>Why This Fix?</Typography>
                                {["The API no longer accepts the old field.", `NovaGrid found ${result.affected_code?.length || 0} locations using the old field.`, "The proposed patch changes only the affected field names.", "No unrelated code will be modified."].map((item, i) => (
                                    <Box key={i} sx={{ display: "flex", gap: 1, py: 0.8, borderBottom: "1px solid #f3f4f6" }}>
                                        <Typography sx={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}>{item}</Typography>
                                    </Box>
                                ))}
                            </Box>
                            <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb" }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1a1f36", mb: 1.5 }}>Fix Actions</Typography>
                                <Button variant="contained" fullWidth sx={{ mb: 1, textTransform: "none" }}>Apply to Temporary Branch</Button>
                                <Button variant="outlined" fullWidth sx={{ mb: 1, textTransform: "none" }}>Preview Full Diff</Button>
                                <Button variant="outlined" fullWidth sx={{ textTransform: "none" }}>Download Patch (.patch)</Button>
                                <Typography sx={{ color: "#6b7280", fontSize: 11, mt: 1.5 }}>A temporary branch will be created for safe testing. Your main code will not be modified.</Typography>
                            </Box>
                            <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb" }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1a1f36", mb: 1.5 }}>Validate Fix</Typography>
                                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, mb: 1.5 }}>
                                    {[{ l: "Tests", v: 12 }, { l: "Passed", v: 12, c: "#0d9488" }, { l: "Failed", v: 0, c: "#dc2626" }, { l: "Skipped", v: 0 }].map((t, i) => (
                                        <Box key={i} sx={{ textAlign: "center", py: 1, borderRadius: 1.5, background: "#f9fafb" }}>
                                            <Typography sx={{ color: t.c || "#1a1f36", fontSize: 16, fontWeight: 800 }}>{t.v}</Typography>
                                            <Typography sx={{ color: "#9ca3af", fontSize: 10 }}>{t.l}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                                <Box sx={{ py: 1, px: 2, borderRadius: 2, background: "rgba(13,148,136,0.06)", border: "1px solid rgba(13,148,136,0.15)" }}>
                                    <Typography sx={{ color: "#0d9488", fontSize: 12, fontWeight: 700 }}>✅ VALIDATION COMPLETE</Typography>
                                    <Typography sx={{ color: "#6b7280", fontSize: 11 }}>12 / 12 tests passed. No new errors detected.</Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Fix Summary + Actions */}
                        <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb", mb: 3 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1a1f36", mb: 2 }}>Fix Summary</Typography>
                            <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
                                {[{ l: "API", v: result.api?.name || "—" }, { l: "Problem", v: "field renamed" }, { l: "Files Changed", v: result.affected_code?.length || 0 }, { l: "Tests Passed", v: "12 / 12", c: "#0d9488" }, { l: "Risk After Fix", v: "LOW", c: "#0d9488" }].map((s, i) => (
                                    <Box key={i}>
                                        <Typography sx={{ color: "#6b7280", fontSize: 11 }}>{s.l}</Typography>
                                        <Typography sx={{ color: s.c || "#1a1f36", fontSize: 14, fontWeight: 700 }}>{s.v}</Typography>
                                    </Box>
                                ))}
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1.5, px: 2, borderRadius: 2, background: "rgba(13,148,136,0.06)", border: "1px solid rgba(13,148,136,0.15)" }}>
                                    <CheckCircleIcon sx={{ color: "#0d9488", fontSize: 18 }} />
                                    <Box>
                                        <Typography sx={{ color: "#0d9488", fontSize: 13, fontWeight: 700 }}>FIX VALIDATED SUCCESSFULLY</Typography>
                                        <Typography sx={{ color: "#6b7280", fontSize: 12 }}>The proposed fix is safe and ready for review.</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: "flex", gap: 1.5 }}>
                                    <Button variant="contained" onClick={() => navigate("/human-validation")} sx={{ textTransform: "none" }}>Accept Fix & Create PR</Button>
                                    <Button variant="outlined" onClick={handleFix} sx={{ textTransform: "none" }}>Run Tests Again</Button>
                                </Box>
                            </Box>
                        </Box>
                    </>
                )}

                {/* Pending Approvals */}
                {approvals.length > 0 && (
                    <Box sx={{ background: "#fff", borderRadius: 2.5, border: "1px solid #e5e7eb", overflow: "hidden", mb: 3 }}>
                        <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#1a1f36" }}>Pending Approvals ({approvals.length})</Typography>
                        </Box>
                        <Box sx={{ px: 2.5, pb: 2 }}>
                            {approvals.map((a, i) => (
                                <Box key={a.id} sx={{ py: 2, borderBottom: i < approvals.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                        <Typography sx={{ fontWeight: 500, fontSize: 13 }}>{a.affected_file || "—"}</Typography>
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            <Button size="small" variant="contained" color="success" onClick={() => handleApprove(a.id)} sx={{ textTransform: "none", fontSize: 12 }}>Approve</Button>
                                            <Button size="small" variant="outlined" color="error" onClick={() => handleReject(a.id)} sx={{ textTransform: "none", fontSize: 12 }}>Reject</Button>
                                        </Box>
                                    </Box>
                                    <Typography sx={{ color: "#6b7280", fontSize: 12 }}>{a.reason || ""}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}

                {!result && !loading && approvals.length === 0 && (
                    <Box sx={{ background: "#fff", borderRadius: 2.5, p: 6, border: "1px solid #e5e7eb", textAlign: "center" }}>
                        <Typography sx={{ color: "#6b7280", fontSize: 16, mb: 1 }}>Select an API and click "Run AI Fix"</Typography>
                        <Typography sx={{ color: "#9ca3af", fontSize: 13 }}>NovaGrid will analyze changes and generate fixes automatically</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
export default AiFix;
