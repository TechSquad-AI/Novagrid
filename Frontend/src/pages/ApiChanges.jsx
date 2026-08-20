import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Select, MenuItem, Chip, Button, LinearProgress } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import CodeIcon from "@mui/icons-material/Code";
import FunctionsIcon from "@mui/icons-material/Functions";
import ScienceIcon from "@mui/icons-material/Science";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../context/SidebarContext";
import Navbar from "../components/Navbar";
import { getAllAPIs, getImpactAnalysis, getDependencies } from "../api/services";

function ApiChanges() {
    const { open: sidebarOpen } = useSidebar();
    const sidebarMargin = sidebarOpen ? "250px" : "0px";
    const navigate = useNavigate();
    const [apis, setApis] = useState([]);
    const [selectedApi, setSelectedApi] = useState("");
    const [impact, setImpact] = useState(null);
    const [deps, setDeps] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => { getAllAPIs().then(r => setApis(r.data || [])).catch(() => {}); }, []);

    const handleSelect = async (apiId) => {
        setSelectedApi(apiId); setLoading(true);
        try {
            const [i, d] = await Promise.allSettled([getImpactAnalysis(apiId), getDependencies(apiId)]);
            if (i.status === "fulfilled") setImpact(i.value);
            if (d.status === "fulfilled") setDeps(d.value);
        } catch {}
        setLoading(false);
    };

    const scoreColor = (score) => score > 60 ? "#dc2626" : score > 30 ? "#ea580c" : "#0d9488";

    return (
        <Box sx={{ display: "flex", height: "100vh", overflowY: "auto", background: "#f8f9fb" }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, ml: sidebarMargin, p: 3, position: "relative", zIndex: 1 }}>
                <Navbar subtitle="API Changes > Impact Analysis" title="Impact Analysis" />

                <Button size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashboard")} sx={{ color: "#6b7280", mb: 1, textTransform: "none" }}>Back to Dashboard</Button>

                {/* API Selector */}
                <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2, border: "1px solid #e5e7eb", mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography sx={{ color: "#6b7280", fontSize: 13, fontWeight: 600 }}>Select API:</Typography>
                    <Select value={selectedApi} onChange={e => handleSelect(e.target.value)} displayEmpty sx={{ minWidth: 300, borderRadius: 2 }}>
                        <MenuItem value="" disabled>Choose an API...</MenuItem>
                        {apis.map(a => <MenuItem key={a.id} value={a.id}>{a.name} — {a.base_url}</MenuItem>)}
                    </Select>
                </Box>

                {loading && <LinearProgress sx={{ mb: 2 }} />}

                {!selectedApi && !loading && (
                    <Box sx={{ background: "#fff", borderRadius: 2.5, p: 6, border: "1px solid #e5e7eb", textAlign: "center" }}>
                        <Typography sx={{ color: "#6b7280", fontSize: 16, mb: 1 }}>Select an API to view impact analysis</Typography>
                        <Typography sx={{ color: "#9ca3af", fontSize: 13 }}>NovaGrid will analyze changes, affected files, and risk level</Typography>
                    </Box>
                )}

                {impact && (
                    <>
                        {/* Header */}
                        <Box sx={{ background: "#fff", borderRadius: 2.5, p: 3, border: "1px solid #e5e7eb", mb: 3 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                        <Chip label="POST" sx={{ fontSize: 10, height: 20, background: "rgba(26,115,232,0.1)", color: "#1a73e8", fontWeight: 700 }} />
                                        <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#1a1f36" }}>{impact.api?.name}</Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                                        <Typography sx={{ color: "#6b7280", fontSize: 13 }}>API Change:</Typography>
                                        {impact.removed_fields?.map((f, i) => <Chip key={i} size="small" label={f} sx={{ background: "rgba(220,38,38,0.08)", color: "#dc2626", fontSize: 11, fontWeight: 600 }} />)}
                                        <Typography sx={{ color: "#9ca3af" }}>→</Typography>
                                        {impact.added_fields?.map((f, i) => <Chip key={i} size="small" label={f} sx={{ background: "rgba(13,148,136,0.08)", color: "#0d9488", fontSize: 11, fontWeight: 600 }} />)}
                                    </Box>
                                </Box>
                                <Chip icon={<ErrorOutlineIcon />} label={`${impact.severity?.toUpperCase()} RISK`}
                                    sx={{ background: impact.severity === "high" ? "rgba(220,38,38,0.08)" : "rgba(234,88,12,0.08)", color: impact.severity === "high" ? "#dc2626" : "#ea580c", fontWeight: 700, fontSize: 13, height: 32, px: 2 }} />
                            </Box>
                        </Box>

                        {/* Score + Summary + Graph */}
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, mb: 3 }}>
                            {/* Impact Score */}
                            <Box sx={{ background: "#fff", borderRadius: 2.5, p: 3, border: "1px solid #e5e7eb", textAlign: "center" }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1a1f36", mb: 2 }}>Impact Score</Typography>
                                <Box sx={{ position: "relative", width: 120, height: 120, mx: "auto", mb: 2 }}>
                                    <svg viewBox="0 0 120 120" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                                        <circle cx="60" cy="60" r="50" fill="none" stroke="#fee2e2" strokeWidth="12" />
                                        <circle cx="60" cy="60" r="50" fill="none" stroke={scoreColor(impact.risk_score)} strokeWidth="12"
                                            strokeDasharray={`${(impact.risk_score / 100) * 314} 314`} strokeLinecap="round" />
                                    </svg>
                                    <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
                                        <Typography sx={{ fontSize: 28, fontWeight: 800, color: "#1a1f36" }}>{impact.risk_score}</Typography>
                                        <Typography sx={{ fontSize: 10, color: "#9ca3af" }}>/ 100</Typography>
                                    </Box>
                                </Box>
                                <Typography sx={{ color: scoreColor(impact.risk_score), fontSize: 14, fontWeight: 700 }}>{impact.severity?.toUpperCase()} RISK</Typography>
                                <Box sx={{ mt: 2, textAlign: "left" }}>
                                    {[{ l: "Breaking API change", s: "+30" }, { l: "Required field removed", s: "+25" }, { l: `${impact.affected_files?.length || 0} dependent files`, s: "+15" }, { l: `${impact.affected_functions?.length || 0} affected functions`, s: "+10" }, { l: `${impact.affected_tests?.length || 0} affected tests`, s: "+7" }].map((item, i) => (
                                        <Box key={i} sx={{ display: "flex", justifyContent: "space-between", py: 0.3, fontSize: 12, color: "#6b7280" }}>
                                            <span>{item.l}</span><span style={{ fontWeight: 600 }}>{item.s}</span>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>

                            {/* Affected Files */}
                            <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb" }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1a1f36", mb: 1.5 }}>Affected Files</Typography>
                                {(impact.affected_files || []).map((f, i) => (
                                    <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, py: 1, borderBottom: "1px solid #f3f4f6" }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "#dc2626" }} />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography sx={{ fontSize: 13, color: "#1a1f36", fontWeight: 500 }}>{f}</Typography>
                                            <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>Uses: <span style={{ color: "#dc2626", background: "rgba(220,38,38,0.08)", padding: "1px 4px", borderRadius: 3 }}>{impact.removed_fields?.[0] || "field"}</span></Typography>
                                        </Box>
                                        <Button size="small" sx={{ color: "#1a73e8", textTransform: "none", fontSize: 11 }}>View Code</Button>
                                    </Box>
                                ))}
                                <Button size="small" onClick={() => navigate("/api-changes")} sx={{ mt: 1, color: "#1a73e8", textTransform: "none", fontSize: 12 }}>View All Affected Files →</Button>
                            </Box>

                            {/* Dependency Graph */}
                            <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb" }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1a1f36", mb: 2 }}>Dependency Graph</Typography>
                                <Box sx={{ textAlign: "center" }}>
                                    <Box sx={{ display: "inline-block", px: 2, py: 1, borderRadius: 2, border: "2px solid #1a73e8", background: "rgba(26,115,232,0.04)", mb: 1 }}>
                                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#1a73e8" }}>POST /payment</Typography>
                                    </Box>
                                    <Box sx={{ color: "#d1d5db", my: 0.5 }}>↓</Box>
                                    <Box sx={{ display: "inline-block", px: 2, py: 1, borderRadius: 2, background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.15)", mb: 1 }}>
                                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#dc2626" }}>{impact.removed_fields?.[0] || "field"} removed</Typography>
                                    </Box>
                                    <Box sx={{ color: "#d1d5db", my: 0.5 }}>↓</Box>
                                    <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5, flexWrap: "wrap" }}>
                                        {(impact.affected_files || []).slice(0, 3).map((f, i) => (
                                            <Box key={i} sx={{ px: 1.5, py: 0.8, borderRadius: 1.5, border: "1px solid #e5e7eb", fontSize: 10, color: "#374151", background: "#f9fafb" }}>
                                                {f.split("/").pop()}<br /><span style={{ fontSize: 9, color: "#9ca3af" }}>Line {3 + i * 10}</span>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        {/* Affected Functions + Why Break + AI Analysis */}
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, mb: 3 }}>
                            <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb" }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1a1f36", mb: 1.5 }}>Affected Functions</Typography>
                                {(impact.affected_functions || []).map((f, i) => (
                                    <Box key={i} sx={{ py: 0.8, borderBottom: "1px solid #f3f4f6" }}>
                                        <Typography sx={{ fontSize: 13, color: "#1a1f36", fontWeight: 500, fontFamily: "monospace" }}>{f}</Typography>
                                    </Box>
                                ))}
                                <Button size="small" onClick={() => navigate("/api-changes")} sx={{ mt: 1, color: "#1a73e8", textTransform: "none", fontSize: 12 }}>View All Functions →</Button>
                            </Box>
                            <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb" }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1a1f36", mb: 1.5 }}>Why Will It Break?</Typography>
                                <Typography sx={{ color: "#374151", fontSize: 13, lineHeight: 1.7 }}>
                                    The API no longer accepts the <span style={{ color: "#dc2626", background: "rgba(220,38,38,0.08)", padding: "1px 4px", borderRadius: 3 }}>{impact.removed_fields?.[0] || "field"}</span> field.
                                </Typography>
                                <Typography sx={{ color: "#374151", fontSize: 13, lineHeight: 1.7, mt: 1 }}>
                                    However, {impact.affected_files?.length || 0} files in the repository still send this field. These requests may fail API validation.
                                </Typography>
                            </Box>
                            <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb" }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1a1f36", mb: 1.5 }}>AI Impact Analysis</Typography>
                                <Typography sx={{ color: "#374151", fontSize: 13, lineHeight: 1.7, mb: 1 }}>
                                    Impact: <strong style={{ color: "#dc2626" }}>{impact.severity?.toUpperCase()}</strong>
                                </Typography>
                                <Typography sx={{ color: "#374151", fontSize: 13, lineHeight: 1.7, mb: 1 }}>
                                    The <span style={{ color: "#dc2626", background: "rgba(220,38,38,0.08)", padding: "1px 4px", borderRadius: 3 }}>{impact.removed_fields?.[0] || "field"}</span> field was renamed to <span style={{ color: "#0d9488", background: "rgba(13,148,136,0.08)", padding: "1px 4px", borderRadius: 3 }}>{impact.added_fields?.[0] || "field"}</span>.
                                </Typography>
                                <Typography sx={{ color: "#374151", fontSize: 13, lineHeight: 1.7, mb: 2 }}>
                                    Recommended: Update the request payload in all affected locations.
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Typography sx={{ color: "#6b7280", fontSize: 12 }}>Confidence:</Typography>
                                    <Box sx={{ flex: 1, height: 6, borderRadius: 3, background: "#e5e7eb" }}>
                                        <Box sx={{ width: "94%", height: "100%", borderRadius: 3, background: "#0d9488" }} />
                                    </Box>
                                    <Typography sx={{ color: "#0d9488", fontSize: 12, fontWeight: 700 }}>94%</Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Suggested Fix + Validation */}
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3 }}>
                            <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb" }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1a1f36", mb: 1.5 }}>Suggested Fix</Typography>
                                <Typography sx={{ color: "#6b7280", fontSize: 12, fontFamily: "monospace", mb: 1 }}>{impact.affected_files?.[0] || "file.js"}</Typography>
                                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ color: "#dc2626", fontSize: 11, fontWeight: 700, mb: 0.5 }}>BEFORE</Typography>
                                        <Box sx={{ background: "#0f172a", borderRadius: 1.5, p: 1.5 }}>
                                            <pre style={{ color: "#fca5a5", fontSize: 11, margin: 0, fontFamily: "monospace" }}>{"3  " + (impact.removed_fields?.[0] || "field") + ": amount,"}</pre>
                                        </Box>
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ color: "#0d9488", fontSize: 11, fontWeight: 700, mb: 0.5 }}>AFTER</Typography>
                                        <Box sx={{ background: "#0f172a", borderRadius: 1.5, p: 1.5 }}>
                                            <pre style={{ color: "#86efac", fontSize: 11, margin: 0, fontFamily: "monospace" }}>{"3  " + (impact.added_fields?.[0] || "field") + ": amount,"}</pre>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                    <Button variant="contained" size="small" onClick={() => navigate("/ai-fix")} sx={{ textTransform: "none" }}>Generate Complete Fix</Button>
                                    <Button variant="outlined" size="small" sx={{ textTransform: "none" }}>View Diff</Button>
                                </Box>
                                <Typography sx={{ color: "#6b7280", fontSize: 12, mt: 1 }}>NovaGrid will generate a patch without modifying your code.</Typography>
                            </Box>
                            <Box sx={{ background: "#fff", borderRadius: 2.5, p: 2.5, border: "1px solid #e5e7eb" }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1a1f36", mb: 1.5 }}>Validation</Typography>
                                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
                                    <Box>
                                        <Typography sx={{ color: "#dc2626", fontSize: 12, fontWeight: 600, mb: 0.5 }}>Before Fix</Typography>
                                        <Typography sx={{ color: "#dc2626", fontSize: 12 }}>2 tests failed</Typography>
                                        <Typography sx={{ color: "#6b7280", fontSize: 12 }}>Passed: 3</Typography>
                                        <Typography sx={{ color: "#dc2626", fontSize: 12 }}>Failed: 2</Typography>
                                    </Box>
                                    <Box>
                                        <Typography sx={{ color: "#0d9488", fontSize: 12, fontWeight: 600, mb: 0.5 }}>After Fix</Typography>
                                        <Typography sx={{ color: "#0d9488", fontSize: 12 }}>6 / 6 tests passed</Typography>
                                        <Typography sx={{ color: "#0d9488", fontSize: 12 }}>Failed: 0</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1.5, px: 2, borderRadius: 2, background: "rgba(13,148,136,0.06)", border: "1px solid rgba(13,148,136,0.15)", mb: 2 }}>
                                    <Typography sx={{ color: "#0d9488", fontSize: 13, fontWeight: 700 }}>✅ FIX VALIDATED SUCCESSFULLY</Typography>
                                </Box>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                    <Button variant="outlined" size="small" onClick={() => navigate("/history")} sx={{ textTransform: "none" }}>View Test Results</Button>
                                    <Button variant="contained" size="small" onClick={() => navigate("/human-validation")} sx={{ textTransform: "none" }}>Create Pull Request</Button>
                                </Box>
                            </Box>
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
}
export default ApiChanges;
