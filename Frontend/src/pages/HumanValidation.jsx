import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Button, Chip, LinearProgress, Alert } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { getPendingApprovals, approveRepair, rejectRepair } from "../api/services";

const card = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "visible", p: 3 };

function HumanValidation() {
    const [approvals, setApprovals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);

    const load = async () => {
        setLoading(true);
        try { const r = await getPendingApprovals(); setApprovals(r.approvals || []); } catch (e) { console.error(e); }
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const handleApprove = async (id) => {
        setResult(null);
        try { await approveRepair(id); setResult({ type: "success", msg: "Approved" }); load(); }
        catch (e) { setResult({ type: "error", msg: e.message }); }
    };
    const handleReject = async (id) => {
        setResult(null);
        try { await rejectRepair(id); setResult({ type: "success", msg: "Rejected" }); load(); }
        catch (e) { setResult({ type: "error", msg: e.message }); }
    };

    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, ml: "260px", p: 3 }}>
                <Navbar />
                <Box sx={{ mb: 3, mt: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>Human Validation</Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 14, mt: 0.5 }}>Review AI proposed changes.</Typography>
                </Box>
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                    <Grid item xs={6} md={3}><Box sx={{ ...card, textAlign: "center", py: 2 }}>
                        <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>Pending</Typography>
                        <Typography sx={{ color: "#f5a623", fontSize: 32, fontWeight: 800 }}>{approvals.length}</Typography>
                    </Box></Grid>
                    <Grid item xs={6} md={3}><Box sx={{ ...card, textAlign: "center", py: 2 }}>
                        <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>Reviewed</Typography>
                        <Typography sx={{ color: "#22c55e", fontSize: 32, fontWeight: 800 }}>{approvals.length}</Typography>
                    </Box></Grid>
                </Grid>
                {result && <Alert severity={result.type} sx={{ mb: 2 }}>{result.msg}</Alert>}
                {loading && <LinearProgress sx={{ mb: 2 }} />}
                {approvals.length === 0 ? (
                    <Box sx={{ ...card, textAlign: "center", py: 6 }}>
                        <Typography sx={{ color: "rgba(255,255,255,0.2)" }}>No pending approvals.</Typography>
                    </Box>
                ) : approvals.map(a => (
                    <Box key={a.id} sx={{ ...card, mb: 1.5 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                            <Box>
                                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{a.affected_file || "Unknown"}</Typography>
                                <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>Line {a.affected_line || "?"}</Typography>
                            </Box>
                            <Chip label={a.status} color="warning" size="small" />
                        </Box>
                        {a.reason && <Typography sx={{ color: "rgba(255,255,255,0.5)", mb: 2, fontSize: 13 }}>Reason: {a.reason}</Typography>}
                        {a.old_code && (
                            <Box sx={{ background: "rgba(0,0,0,0.3)", p: 2, borderRadius: 2, mb: 1.5 }}>
                                <Typography sx={{ color: "#ef4444", fontSize: 11, fontWeight: 600, mb: 0.5 }}>Original</Typography>
                                <pre style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: 0, whiteSpace: "pre-wrap" }}>{a.old_code}</pre>
                            </Box>
                        )}
                        {a.proposed_code && (
                            <Box sx={{ background: "rgba(0,0,0,0.3)", p: 2, borderRadius: 2, mb: 1.5 }}>
                                <Typography sx={{ color: "#22c55e", fontSize: 11, fontWeight: 600, mb: 0.5 }}>Proposed Fix</Typography>
                                <pre style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: 0, whiteSpace: "pre-wrap" }}>{a.proposed_code}</pre>
                            </Box>
                        )}
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Button variant="contained" color="success" size="small" onClick={() => handleApprove(a.id)}>Approve</Button>
                            <Button variant="contained" color="error" size="small" onClick={() => handleReject(a.id)}>Reject</Button>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
export default HumanValidation;
