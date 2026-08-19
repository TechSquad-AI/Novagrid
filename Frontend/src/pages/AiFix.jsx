import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Select, MenuItem, Button, Chip, Alert, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { getAllAPIs, repairAPI, getPendingApprovals, approveRepair, rejectRepair } from "../api/services";

const card = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "visible", p: 3 };

function AiFix() {
    const [apis, setApis] = useState([]);
    const [selectedApi, setSelectedApi] = useState("");
    const [fixResult, setFixResult] = useState(null);
    const [approvals, setApprovals] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getAllAPIs().then(r => { const d = r.data || []; setApis(d); if (d.length > 0) setSelectedApi(d[0].id); }).catch(() => {});
        getPendingApprovals().then(r => setApprovals(r.approvals || [])).catch(() => {});
    }, []);

    const runRepair = async () => {
        if (!selectedApi) return;
        setLoading(true); setFixResult(null);
        try { const r = await repairAPI(selectedApi); setFixResult(r); getPendingApprovals().then(r => setApprovals(r.approvals || [])); }
        catch (e) { setFixResult({ status: "error", error: e.message }); }
        setLoading(false);
    };

    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, ml: "260px", p: 3 }}>
                <Navbar />
                <Box sx={{ mb: 3, mt: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>AI Fix</Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 14, mt: 0.5 }}>AI Diagnosis, Safety Check, Proposed Code Changes.</Typography>
                </Box>
                <Box sx={{ ...card, display: "flex", gap: 1.5, alignItems: "center" }}>
                    <Select value={selectedApi} onChange={e => setSelectedApi(e.target.value)} sx={{ minWidth: 280 }}
                        MenuProps={{ PaperProps: { style: { maxHeight: 300, background: "rgba(15,15,25,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 } } }}>
                        {apis.map(a => <MenuItem key={a.id} value={a.id}>{a.name || a.base_url}</MenuItem>)}
                    </Select>
                    <Button variant="contained" onClick={runRepair} disabled={loading || !selectedApi} sx={{ px: 4 }}>
                        {loading ? "Running…" : "Run AI Fix"}
                    </Button>
                </Box>
                {apis.length === 0 && !loading && (
                    <Box sx={{ ...card, mt: 2, textAlign: "center", py: 6 }}>
                        <Typography sx={{ color: "rgba(255,255,255,0.25)", fontSize: 14 }}>No APIs registered yet. Scan an API on the Dashboard first.</Typography>
                    </Box>
                )}
                {loading && <LinearProgress sx={{ mt: 2 }} />}
                {fixResult && (
                    <Alert severity={fixResult.status === "repair_verified" ? "success" : fixResult.status === "no_changes" ? "info" : "warning"} sx={{ mt: 2 }}>
                        Status: {fixResult.status} {fixResult.error ? `- ${fixResult.error}` : ""}
                    </Alert>
                )}
                {fixResult?.ai_fix && (
                    <Box sx={{ ...card, mt: 1.5 }}>
                        <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", mb: 1.5 }}>Proposed Fix</Typography>
                        <Box sx={{ background: "rgba(0,0,0,0.3)", p: 2, borderRadius: 2, fontFamily: "monospace", color: "#22c55e", fontSize: 13, overflow: "auto", maxHeight: 300 }}>
                            <pre>{fixResult.ai_fix}</pre>
                        </Box>
                    </Box>
                )}
                {approvals.length > 0 && (
                    <Box sx={{ ...card, mt: 1.5 }}>
                        <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", mb: 1.5 }}>Pending Approvals</Typography>
                        <TableContainer><Table size="small"><TableHead><TableRow>
                            <TableCell sx={{ color: "rgba(255,255,255,0.3)" }}>File</TableCell>
                            <TableCell sx={{ color: "rgba(255,255,255,0.3)" }}>Reason</TableCell>
                            <TableCell sx={{ color: "rgba(255,255,255,0.3)" }}>Actions</TableCell>
                        </TableRow></TableHead><TableBody>
                            {approvals.map(a => (
                                <TableRow key={a.id}>
                                    <TableCell sx={{ color: "#fff" }}>{a.affected_file || "-"}</TableCell>
                                    <TableCell sx={{ color: "rgba(255,255,255,0.5)" }}>{a.reason || "-"}</TableCell>
                                    <TableCell>
                                        <Button size="small" color="success" onClick={() => approveRepair(a.id).then(() => getPendingApprovals().then(r => setApprovals(r.approvals || [])))}>Approve</Button>
                                        <Button size="small" color="error" onClick={() => rejectRepair(a.id).then(() => getPendingApprovals().then(r => setApprovals(r.approvals || [])))}>Reject</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody></Table></TableContainer>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
export default AiFix;
