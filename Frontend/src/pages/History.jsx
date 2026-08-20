import React, { useState, useEffect } from "react";
import { Box, Typography, Tabs, Tab, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress } from "@mui/material";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../context/SidebarContext";
import Navbar from "../components/Navbar";
import { getDetailedHistory } from "../api/services";

function fmtDate(d) {
    if (!d) return "—";
    try { const dt = new Date(d); return isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); } catch { return "—"; }
}

function History() {
    const { open: sidebarOpen } = useSidebar();
    const sidebarMargin = sidebarOpen ? "250px" : "0px";
    const [tab, setTab] = useState(0);
    const [data, setData] = useState({ timeline: [], versions: [], fixes: [], reviews: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDetailedHistory().then(r => setData(r)).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const tabLabels = ["Timeline", "Fixes", "Reviews", "Versions"];

    return (
        <Box sx={{ display: "flex", height: "100vh", overflowY: "auto", background: "#f0f2f5" }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, ml: sidebarMargin, p: 3, position: "relative", zIndex: 1 }}>
                <Navbar subtitle="Audit Trail" title="History" />

                {loading && <LinearProgress sx={{ mb: 2 }} />}

                {/* Stats */}
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mb: 3 }}>
                    {[{ l: "Timeline", v: data.timeline?.length || 0, c: "#1a73e8" },
                    { l: "Fixes", v: data.fixes?.length || 0, c: "#0d9488" },
                    { l: "Reviews", v: data.reviews?.length || 0, c: "#ea580c" },
                    { l: "Versions", v: data.versions?.length || 0, c: "#7c3aed" },
                    ].map((s, i) => (
                        <Box key={i} sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb" }}>
                            <Typography sx={{ color: "#6b7280", fontSize: 12, fontWeight: 600, mb: 0.5 }}>{s.l}</Typography>
                            <Typography sx={{ color: s.c, fontSize: 28, fontWeight: 800 }}>{s.v}</Typography>
                        </Box>
                    ))}
                </Box>

                {/* Tabs */}
                <Box sx={{ background: "#fff", borderRadius: 2.5, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                    <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: "#f3f4f6", px: 2 }}>
                        {tabLabels.map((l, i) => <Tab key={i} label={`${l} (${[data.timeline, data.fixes, data.reviews, data.versions][i]?.length || 0})`} />)}
                    </Tabs>

                    {/* Timeline */}
                    {tab === 0 && (
                        <Box sx={{ p: 2.5 }}>
                            {(data.timeline || []).length === 0 ? (
                                <Typography sx={{ color: "#9ca3af", textAlign: "center", py: 4 }}>No timeline data yet.</Typography>
                            ) : data.timeline.map((t, i) => (
                                <Box key={i} sx={{ display: "flex", gap: 2, py: 1.5, borderBottom: i < data.timeline.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                                    <Box sx={{ width: 32, height: 32, borderRadius: 2, background: t.type === "scan" ? "rgba(26,115,232,0.08)" : t.type === "fix" ? "rgba(13,148,136,0.08)" : "rgba(234,88,12,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>
                                        {t.type === "scan" ? "🔍" : t.type === "fix" ? "🔧" : "👁"}
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1a1f36" }}>{t.title}</Typography>
                                        <Typography sx={{ fontSize: 12, color: "#6b7280" }}>{t.detail || ""}</Typography>
                                    </Box>
                                    <Typography sx={{ fontSize: 12, color: "#9ca3af", whiteSpace: "nowrap" }}>{fmtDate(t.created_at)}</Typography>
                                </Box>
                            ))}
                        </Box>
                    )}

                    {/* Fixes / Reviews / Versions Tables */}
                    {[1, 2, 3].map(t => tab === t && (
                        <TableContainer key={t}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        {t === 1 && <><TableCell>File</TableCell><TableCell>Old Code</TableCell><TableCell>New Code</TableCell><TableCell>Tests</TableCell><TableCell>Date</TableCell></>}
                                        {t === 2 && <><TableCell>File</TableCell><TableCell>Reason</TableCell><TableCell>Status</TableCell><TableCell>Date</TableCell></>}
                                        {t === 3 && <><TableCell>API</TableCell><TableCell>Schema</TableCell><TableCell>Date</TableCell></>}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {[data.fixes, data.reviews, data.versions][t - 1]?.map((row, i) => (
                                        <TableRow key={i} sx={{ "&:hover": { background: "#f9fafb" } }}>
                                            {t === 1 && <>
                                                <TableCell sx={{ fontWeight: 500, fontFamily: "monospace", fontSize: 12 }}>{row.affected_file || "—"}</TableCell>
                                                <TableCell sx={{ fontSize: 11, fontFamily: "monospace", color: "#dc2626", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}>{row.old_code || "—"}</TableCell>
                                                <TableCell sx={{ fontSize: 11, fontFamily: "monospace", color: "#0d9488", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}>{row.new_code || "—"}</TableCell>
                                                <TableCell><Chip size="small" label={row.test_passed ? "Pass" : "Fail"} sx={{ fontSize: 11, background: row.test_passed ? "rgba(13,148,136,0.1)" : "rgba(220,38,38,0.1)", color: row.test_passed ? "#0d9488" : "#dc2626" }} /></TableCell>
                                                <TableCell sx={{ fontSize: 12, color: "#9ca3af" }}>{fmtDate(row.created_at)}</TableCell>
                                            </>}
                                            {t === 2 && <>
                                                <TableCell sx={{ fontWeight: 500, fontSize: 12 }}>{row.affected_file || "—"}</TableCell>
                                                <TableCell sx={{ fontSize: 12, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>{row.reason || "—"}</TableCell>
                                                <TableCell><Chip size="small" label={row.status} sx={{ fontSize: 11, background: row.status === "approved" ? "rgba(13,148,136,0.1)" : row.status === "rejected" ? "rgba(220,38,38,0.1)" : "rgba(234,88,12,0.1)", color: row.status === "approved" ? "#0d9488" : row.status === "rejected" ? "#dc2626" : "#ea580c" }} /></TableCell>
                                                <TableCell sx={{ fontSize: 12, color: "#9ca3af" }}>{fmtDate(row.created_at)}</TableCell>
                                            </>}
                                            {t === 3 && <>
                                                <TableCell sx={{ fontWeight: 500, fontSize: 12 }}>{row.api_id || "—"}</TableCell>
                                                <TableCell sx={{ fontSize: 12, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis" }}>{JSON.stringify(row.schema || "").slice(0, 100)}</TableCell>
                                                <TableCell sx={{ fontSize: 12, color: "#9ca3af" }}>{fmtDate(row.created_at)}</TableCell>
                                            </>}
                                        </TableRow>
                                    ))}
                                    {![data.fixes, data.reviews, data.versions][t - 1]?.length && (
                                        <TableRow><TableCell colSpan={5} sx={{ textAlign: "center", py: 4, color: "#9ca3af" }}>No data.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}
export default History;
