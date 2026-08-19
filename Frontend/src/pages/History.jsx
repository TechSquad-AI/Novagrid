import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, LinearProgress, Tab, Tabs } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { getDetailedHistory } from "../api/services";

const card = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "visible" };

function History() {
    const [tab, setTab] = useState(0);
    const [data, setData] = useState({ timeline: [], versions: [], fixes: [], reviews: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => { getDetailedHistory().then(r => setData(r)).catch(() => {}).finally(() => setLoading(false)); }, []);
    const typeColor = (t) => ({ scan: "info", fix: "success", review: "warning" }[t] || "default");

    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, ml: "260px", p: 3 }}>
                <Navbar />
                <Box sx={{ mb: 3, mt: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>History</Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 14, mt: 0.5 }}>Activity Timeline, Versions, AI Fixes, Reviews.</Typography>
                </Box>
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                    {[{ l: "Timeline", v: data.timeline?.length || 0, c: "#3b82f6" }, { l: "Fixes", v: data.fixes?.length || 0, c: "#22c55e" }, { l: "Reviews", v: data.reviews?.length || 0, c: "#f5a623" }, { l: "Versions", v: data.versions?.length || 0, c: "#a855f7" }].map((s, i) => (
                        <Grid item xs={6} md={3} key={i}>
                            <Box sx={{ ...card, p: 2.5, textAlign: "center" }}>
                                <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>{s.l}</Typography>
                                <Typography sx={{ color: s.c, fontSize: 28, fontWeight: 800 }}>{s.v}</Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
                {loading && <LinearProgress sx={{ mb: 2 }} />}
                <Box sx={{ ...card, p: 0 }}>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, pt: 1, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <Tab label="Timeline" /><Tab label="AI Fixes" /><Tab label="Reviews" /><Tab label="Versions" />
                    </Tabs>
                    <Box>
                        {tab === 0 && (
                            <TableContainer><Table size="small"><TableHead><TableRow>
                                <TableCell sx={{ color: "rgba(255,255,255,0.3)" }}>Type</TableCell>
                                <TableCell sx={{ color: "rgba(255,255,255,0.3)" }}>Title</TableCell>
                                <TableCell sx={{ color: "rgba(255,255,255,0.3)" }}>Detail</TableCell>
                                <TableCell sx={{ color: "rgba(255,255,255,0.3)" }}>Date</TableCell>
                            </TableRow></TableHead><TableBody>
                                {(data.timeline || []).length === 0 ? <TableRow><TableCell colSpan={4} sx={{ color: "rgba(255,255,255,0.2)" }}>No activity yet.</TableCell></TableRow>
                                : data.timeline.map((item, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Chip size="small" label={item.type} color={typeColor(item.type)} /></TableCell>
                                        <TableCell sx={{ color: "#fff" }}>{item.title}</TableCell>
                                        <TableCell sx={{ color: "rgba(255,255,255,0.5)" }}>{item.detail}</TableCell>
                                        <TableCell sx={{ color: "rgba(255,255,255,0.25)" }}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody></Table></TableContainer>
                        )}
                        {tab === 1 && (
                            <TableContainer><Table size="small"><TableHead><TableRow>
                                <TableCell sx={{ color: "rgba(255,255,255,0.3)" }}>File</TableCell>
                                <TableCell sx={{ color: "rgba(255,255,255,0.3)" }}>Change</TableCell>
                                <TableCell sx={{ color: "rgba(255,255,255,0.3)" }}>Tests</TableCell>
                                <TableCell sx={{ color: "rgba(255,255,255,0.3)" }}>Date</TableCell>
                            </TableRow></TableHead><TableBody>
                                {(data.fixes || []).length === 0 ? <TableRow><TableCell colSpan={4} sx={{ color: "rgba(255,255,255,0.2)" }}>No fixes yet.</TableCell></TableRow>
                                : data.fixes.map((f, i) => (
                                    <TableRow key={i}>
                                        <TableCell sx={{ color: "#fff" }}>{f.affected_file || "-"}</TableCell>
                                        <TableCell sx={{ color: "rgba(255,255,255,0.5)" }}>{f.api_change || "-"}</TableCell>
                                        <TableCell><Chip size="small" label={f.test_passed ? "Pass" : "Fail"} color={f.test_passed ? "success" : "error"} /></TableCell>
                                        <TableCell sx={{ color: "rgba(255,255,255,0.25)" }}>{f.created_at ? new Date(f.created_at).toLocaleDateString() : ""}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody></Table></TableContainer>
                        )}
                        {tab === 2 && (
                            <TableContainer><Table size="small"><TableHead><TableRow>
                                <TableCell sx={{ color: "rgba(255,255,255,0.3)" }}>File</TableCell>
                                <TableCell sx={{ color: "rgba(255,255,255,0.3)" }}>Status</TableCell>
                                <TableCell sx={{ color: "rgba(255,255,255,0.3)" }}>Date</TableCell>
                            </TableRow></TableHead><TableBody>
                                {(data.reviews || []).length === 0 ? <TableRow><TableCell colSpan={3} sx={{ color: "rgba(255,255,255,0.2)" }}>No reviews yet.</TableCell></TableRow>
                                : data.reviews.map((r, i) => (
                                    <TableRow key={i}>
                                        <TableCell sx={{ color: "#fff" }}>{r.affected_file || "-"}</TableCell>
                                        <TableCell><Chip size="small" label={r.status} color={r.status === "approved_and_repaired" ? "success" : r.status === "rejected" ? "error" : "warning"} /></TableCell>
                                        <TableCell sx={{ color: "rgba(255,255,255,0.25)" }}>{r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody></Table></TableContainer>
                        )}
                        {tab === 3 && (
                            <TableContainer><Table size="small"><TableHead><TableRow>
                                <TableCell sx={{ color: "rgba(255,255,255,0.3)" }}>API</TableCell>
                                <TableCell sx={{ color: "rgba(255,255,255,0.3)" }}>Changes</TableCell>
                                <TableCell sx={{ color: "rgba(255,255,255,0.3)" }}>Date</TableCell>
                            </TableRow></TableHead><TableBody>
                                {(data.versions || []).length === 0 ? <TableRow><TableCell colSpan={3} sx={{ color: "rgba(255,255,255,0.2)" }}>No versions yet.</TableCell></TableRow>
                                : data.versions.map((v, i) => (
                                    <TableRow key={i}>
                                        <TableCell sx={{ color: "#fff" }}>{v.api_id || "-"}</TableCell>
                                        <TableCell sx={{ color: "rgba(255,255,255,0.5)" }}>{v.changes || "-"}</TableCell>
                                        <TableCell sx={{ color: "rgba(255,255,255,0.25)" }}>{v.created_at ? new Date(v.created_at).toLocaleDateString() : ""}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody></Table></TableContainer>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
export default History;
