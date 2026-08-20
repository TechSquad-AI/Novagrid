import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, TextField, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../context/SidebarContext";
import Navbar from "../components/Navbar";
import { getDashboardMonitoring } from "../api/services";

function AllApis() {
    const { open: sidebarOpen } = useSidebar();
    const sidebarMargin = sidebarOpen ? "250px" : "0px";
    const navigate = useNavigate();
    const [monitoring, setMonitoring] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        getDashboardMonitoring()
            .then(r => setMonitoring(r.monitoring || []))
            .catch(() => {});
    }, []);

    const filtered = monitoring.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.url.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box sx={{ display: "flex", height: "100vh", overflowY: "auto", background: "#f8f9fb" }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, ml: sidebarMargin, p: 3, position: "relative", zIndex: 1 }}>
                <Navbar subtitle="All Registered APIs" title="All APIs" />

                <Button size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashboard")} sx={{ color: "#6b7280", mb: 2, textTransform: "none" }}>Back to Dashboard</Button>

                {/* Search */}
                <Box sx={{ display: "flex", gap: 1.5, mb: 3, background: "#fff", borderRadius: 2, p: 1.5, border: "1px solid #e5e7eb" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
                        <SearchIcon sx={{ color: "#9ca3af" }} />
                        <input
                            placeholder="Search APIs by name or URL..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#1a1f36", background: "transparent" }}
                        />
                    </Box>
                    <Button variant="contained" onClick={() => navigate("/analyze-api")} sx={{ px: 3, borderRadius: 2 }}>+ New API</Button>
                </Box>

                {/* Stats */}
                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                    <Box sx={{ background: "#fff", borderRadius: 2, p: 2, border: "1px solid #e5e7eb", flex: 1, textAlign: "center" }}>
                        <Typography sx={{ color: "#6b7280", fontSize: 12, fontWeight: 600 }}>Total APIs</Typography>
                        <Typography sx={{ color: "#1a1f36", fontSize: 24, fontWeight: 800 }}>{monitoring.length}</Typography>
                    </Box>
                    <Box sx={{ background: "#fff", borderRadius: 2, p: 2, border: "1px solid #e5e7eb", flex: 1, textAlign: "center" }}>
                        <Typography sx={{ color: "#6b7280", fontSize: 12, fontWeight: 600 }}>Healthy</Typography>
                        <Typography sx={{ color: "#0d9488", fontSize: 24, fontWeight: 800 }}>{monitoring.filter(m => m.status === "healthy").length}</Typography>
                    </Box>
                    <Box sx={{ background: "#fff", borderRadius: 2, p: 2, border: "1px solid #e5e7eb", flex: 1, textAlign: "center" }}>
                        <Typography sx={{ color: "#6b7280", fontSize: 12, fontWeight: 600 }}>Unhealthy</Typography>
                        <Typography sx={{ color: "#dc2626", fontSize: 24, fontWeight: 800 }}>{monitoring.filter(m => m.status === "unhealthy").length}</Typography>
                    </Box>
                    <Box sx={{ background: "#fff", borderRadius: 2, p: 2, border: "1px solid #e5e7eb", flex: 1, textAlign: "center" }}>
                        <Typography sx={{ color: "#6b7280", fontSize: 12, fontWeight: 600 }}>Not Scanned</Typography>
                        <Typography sx={{ color: "#f59e0b", fontSize: 24, fontWeight: 800 }}>{monitoring.filter(m => m.status === "unchecked").length}</Typography>
                    </Box>
                </Box>

                {/* Table */}
                <Box sx={{ background: "#fff", borderRadius: 2.5, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ background: "#f9fafb" }}>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 13, color: "#374151" }}>API Name</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 13, color: "#374151" }}>URL</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 13, color: "#374151" }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 13, color: "#374151" }}>Response Time</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 13, color: "#374151" }}>HTTP Status</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 13, color: "#374151" }}>Last Checked</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: 13, color: "#374151" }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filtered.map((m, i) => (
                                    <TableRow key={i} sx={{ "&:hover": { background: "#f9fafb" } }}>
                                        <TableCell>
                                            <Typography sx={{ fontWeight: 600, fontSize: 13, color: "#1a1f36" }}>{m.name}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontSize: 12, color: "#6b7280", fontFamily: "monospace" }}>{m.url}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                <FiberManualRecordIcon sx={{ fontSize: 8, color: m.status === "healthy" ? "#10b981" : m.status === "unchecked" ? "#f59e0b" : "#ef4444" }} />
                                                <Chip size="small" label={m.status === "healthy" ? "Healthy" : m.status === "unchecked" ? "Not Scanned" : "Unhealthy"}
                                                    sx={{ fontSize: 11, fontWeight: 600, background: m.status === "healthy" ? "rgba(13,148,136,0.1)" : m.status === "unchecked" ? "rgba(245,158,11,0.1)" : "rgba(220,38,38,0.1)", color: m.status === "healthy" ? "#0d9488" : m.status === "unchecked" ? "#f59e0b" : "#dc2626" }} />
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontSize: 13, color: "#1a1f36" }}>{m.response_time_ms > 0 ? `${m.response_time_ms}ms` : "—"}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontSize: 13, color: "#1a1f36" }}>{m.http_status > 0 ? m.http_status : "—"}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>{m.last_checked && m.last_checked !== "Never" ? new Date(m.last_checked).toLocaleString() : "Never"}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Button size="small" onClick={() => navigate("/analyze-api")} sx={{ color: "#1a73e8", textTransform: "none", fontSize: 12 }}>Analyze</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} sx={{ textAlign: "center", py: 6, color: "#9ca3af" }}>
                                            {monitoring.length === 0 ? "No APIs registered yet." : "No APIs match your search."}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Box>
        </Box>
    );
}
export default AllApis;
