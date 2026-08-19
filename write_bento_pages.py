import os

pages_dir = 'Frontend/src/pages'

card_style = 'background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "visible"'

# ── AnalyzeApi ──
api_analyze = f'''import React, {{ useState }} from "react";
import {{ Box, Typography, Grid, TextField, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress, Alert }} from "@mui/material";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {{ registerAPI, checkAPIHealth, getImpactAnalysis, getDependencies }} from "../api/services";

const card = {{ {card_style}, p: 3 }};

function AnalyzeApi() {{
    const [apiName, setApiName] = useState("");
    const [apiUrl, setApiUrl] = useState("");
    const [health, setHealth] = useState(null);
    const [impact, setImpact] = useState(null);
    const [deps, setDeps] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const analyze = async () => {{
        setLoading(true); setError(""); setHealth(null); setImpact(null); setDeps(null);
        try {{
            const created = await registerAPI(apiName, apiUrl);
            const id = created.api.id;
            const [h, imp, dep] = await Promise.allSettled([checkAPIHealth(id), getImpactAnalysis(id), getDependencies(id)]);
            if (h.status === "fulfilled") setHealth(h.value);
            if (imp.status === "fulfilled") setImpact(imp.value);
            if (dep.status === "fulfilled") setDeps(dep.value);
        }} catch (e) {{ setError(e.message); }}
        setLoading(false);
    }};

    return (
        <Box sx={{{{ display: "flex", minHeight: "100vh" }}}}>
            <Sidebar />
            <Box component="main" sx={{{{ flexGrow: 1, ml: "260px", p: 3 }}}}>
                <Navbar />
                <Box sx={{{{ mb: 3, mt: 1 }}}}>
                    <Typography variant="h4" sx={{{{ fontWeight: 800, letterSpacing: "-0.02em" }}}}>Analyze API</Typography>
                    <Typography sx={{{{ color: "rgba(255,255,255,0.35)", fontSize: 14, mt: 0.5 }}}}>Deep analysis: health, dependencies, impact.</Typography>
                </Box>

                <Box sx={{{{ ...card, display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}}}>
                    <TextField label="API Name" value={{apiName}} onChange={{e => setApiName(e.target.value)}} size="small" sx={{{{ flex: 1, minWidth: 150 }}}} />
                    <TextField label="API URL" value={{apiUrl}} onChange={{e => setApiUrl(e.target.value)}} size="small" sx={{{{ flex: 2, minWidth: 200 }}}} />
                    <Button variant="contained" onClick={{analyze}} disabled={{loading || !apiName || !apiUrl}} sx={{{{ px: 4 }}}>
                        {{loading ? "Analyzing…" : "Analyze"}}
                    </Button>
                </Box>

                {{error && <Alert severity="error" sx={{{{ mt: 2 }}}}}>{{error}}</Alert>}}
                {{loading && <LinearProgress sx={{{{ mt: 2 }}}} />}}

                {{health && (
                    <Grid container spacing={1.5} sx={{{{ mt: 1.5 }}}}>
                        {{[{{ l: "Status", v: health.health?.status || "unknown", c: health.health?.status === "healthy" ? "#22c55e" : "#ef4444" }}, {{ l: "Response", v: `${{health.health?.response_time_ms || 0}}ms`, c: "#3b82f6" }}, {{ l: "HTTP", v: String(health.health?.http_status || "-"), c: "#f5a623" }}, {{ l: "Risk", v: `${{impact?.risk_score || 0}}/100`, c: impact?.severity === "high" ? "#ef4444" : "#22c55e" }}].map((s, i) => (
                            <Grid item xs={6} md={3} key={{i}}>
                                <Box sx={{{{ ...card, textAlign: "center" }}}}>
                                    <Typography sx={{{{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", mb: 0.5 }}}>{{s.l}}</Typography>
                                    <Typography sx={{{{ color: s.c, fontSize: 24, fontWeight: 800 }}}>{{s.v}}</Typography>
                                </Box>
                            </Grid>
                        ))}}
                    </Grid>
                )}}

                {{impact && (
                    <Box sx={{{{ ...card, mt: 1.5 }}}}>
                        <Typography sx={{{{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", mb: 1.5 }}}}>Impact Analysis</Typography>
                        <Grid container spacing={2}>
                            {{[{{ l: "Affected Files", v: impact.affected_files?.length || 0 }}, {{ l: "Functions", v: impact.affected_functions?.length || 0 }}, {{ l: "Changes", v: impact.changes_count || 0 }}].map((s, i) => (
                                <Grid item xs={4} key={{i}}>
                                    <Typography sx={{{{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}}>{{s.l}}</Typography>
                                    <Typography sx={{{{ color: "#fff", fontSize: 22, fontWeight: 700 }}}>{{s.v}}</Typography>
                                </Grid>
                            ))}}
                        </Grid>
                        {{impact.affected_files?.length > 0 && (
                            <Box sx={{{{ mt: 2 }}}>
                                {{impact.affected_files.map((f, i) => <Chip key={{i}} label={{f}} sx={{{{ mr: 1, mb: 1, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}}} />)}}
                            </Box>
                        )}}
                    </Box>
                )}}

                {{deps && deps.nodes?.length > 0 && (
                    <Box sx={{{{ ...card, mt: 1.5 }}}}>
                        <Typography sx={{{{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", mb: 1.5 }}}}>Dependency Graph</Typography>
                        <TableContainer><Table size="small"><TableHead><TableRow>
                            <TableCell sx={{{{ color: "rgba(255,255,255,0.3)" }}}}>Node</TableCell>
                            <TableCell sx={{{{ color: "rgba(255,255,255,0.3)" }}}}>Type</TableCell>
                        </TableRow></TableHead><TableBody>
                            {{deps.nodes.map((n, i) => (
                                <TableRow key={{i}}>
                                    <TableCell sx={{{{ color: "#fff" }}}}}>{{n.label}}</TableCell>
                                    <TableCell><Chip size="small" label={{n.type}} /></TableCell>
                                </TableRow>
                            ))}}
                        </TableBody></Table></TableContainer>
                    </Box>
                )}}
            </Box>
        </Box>
    );
}}
export default AnalyzeApi;
'''

# ── ApiChanges ──
api_changes = f'''import React, {{ useState, useEffect }} from "react";
import {{ Box, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, LinearProgress, Select, MenuItem }} from "@mui/material";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {{ getAllAPIs, getImpactAnalysis, getDependencies }} from "../api/services";

const card = {{ {card_style}, p: 3 }};

function ApiChanges() {{
    const [apis, setApis] = useState([]);
    const [selectedApi, setSelectedApi] = useState("");
    const [impact, setImpact] = useState(null);
    const [deps, setDeps] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {{ getAllAPIs().then(r => {{ const d = r.data || []; setApis(d); if (d.length > 0) setSelectedApi(d[0].id); }}).catch(() => {{}}); }}, []);

    useEffect(() => {{
        if (!selectedApi) return;
        setLoading(true);
        Promise.allSettled([getImpactAnalysis(selectedApi), getDependencies(selectedApi)])
            .then(([i, d]) => {{ if (i.status === "fulfilled") setImpact(i.value); if (d.status === "fulfilled") setDeps(d.value); }})
            .finally(() => setLoading(false));
    }}, [selectedApi]);

    return (
        <Box sx={{{{ display: "flex", minHeight: "100vh" }}}}>
            <Sidebar />
            <Box component="main" sx={{{{ flexGrow: 1, ml: "260px", p: 3 }}}}>
                <Navbar />
                <Box sx={{{{ mb: 3, mt: 1 }}}}>
                    <Typography variant="h4" sx={{{{ fontWeight: 800, letterSpacing: "-0.02em" }}}}>API Changes</Typography>
                    <Typography sx={{{{ color: "rgba(255,255,255,0.35)", fontSize: 14, mt: 0.5 }}}}>Impact Score, Dependency Graph, Affected Files.</Typography>
                </Box>

                <Box sx={{{{ ...card, display: "flex", gap: 1.5, alignItems: "center" }}}}>
                    <Select value={{selectedApi}} onChange={{e => setSelectedApi(e.target.value)}} sx={{{{ minWidth: 280 }}}} MenuProps={{{{ PaperProps: {{ style: {{ maxHeight: 300, background: "rgba(15,15,25,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 }} } }}} }}>
                        {{apis.map(a => <MenuItem key={{a.id}} value={{a.id}}>{{a.name || a.base_url}}</MenuItem>)}}
                    </Select>
                </Box>

                {{apis.length === 0 && !loading && (
                    <Box sx={{{{ ...card, mt: 2, textAlign: "center", py: 6 }}}}>
                        <Typography sx={{{{ color: "rgba(255,255,255,0.25)", fontSize: 14 }}}}>No APIs registered yet. Scan an API on the Dashboard first.</Typography>
                    </Box>
                )}}

                {{loading && <LinearProgress sx={{{{ mt: 2 }}}} />}}

                {{impact && (
                    <Grid container spacing={1.5} sx={{{{ mt: 1.5 }}}}>
                        <Grid item xs={12} md={4}>
                            <Box sx={{{{ ...card, textAlign: "center", py: 4 }}}}>
                                <Typography sx={{{{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}}}>Impact Score</Typography>
                                <Typography variant="h1" sx={{{{ color: impact.severity === "high" ? "#ef4444" : impact.severity === "medium" ? "#f5a623" : "#22c55e", fontWeight: 900, mt: 1 }}}>{{impact.risk_score}}</Typography>
                                <Chip label={{impact.severity?.toUpperCase()}} color={{impact.severity === "high" ? "error" : impact.severity === "medium" ? "warning" : "success"}} sx={{{{ mt: 1.5 }}}} />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Box sx={{{{ ...card }}}}>
                                <Typography sx={{{{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", mb: 1.5 }}}}>Summary</Typography>
                                <Grid container spacing={2}>
                                    {{[{{ l: "Changes", v: impact.changes_count || 0 }}, {{ l: "Files", v: impact.affected_files?.length || 0 }}, {{ l: "Functions", v: impact.affected_functions?.length || 0 }}, {{ l: "Tests", v: impact.affected_tests?.length || 0 }}].map((s, i) => (
                                        <Grid item xs={3} key={{i}}>
                                            <Typography sx={{{{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}}>{{s.l}}</Typography>
                                            <Typography sx={{{{ color: "#fff", fontSize: 22, fontWeight: 700 }}}>{{s.v}}</Typography>
                                        </Grid>
                                    ))}}
                                </Grid>
                            </Box>
                        </Grid>

                        {{impact.affected_files?.length > 0 && (
                            <Grid item xs={12} md={6}>
                                <Box sx={{{{ ...card }}}}>
                                    <Typography sx={{{{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", mb: 1.5 }}}}>Affected Files</Typography>
                                    {{impact.affected_files.map((f, i) => <Chip key={{i}} label={{f}} sx={{{{ mr: 1, mb: 1, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}}} />)}}
                                </Box>
                            </Grid>
                        )}}

                        {{impact.affected_functions?.length > 0 && (
                            <Grid item xs={12} md={6}>
                                <Box sx={{{{ ...card }}}}>
                                    <Typography sx={{{{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", mb: 1.5 }}}}>Affected Functions</Typography>
                                    {{impact.affected_functions.map((f, i) => <Chip key={{i}} label={{f}} sx={{{{ mr: 1, mb: 1, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}}} />)}}
                                </Box>
                            </Grid>
                        )}}
                    </Grid>
                )}}
            </Box>
        </Box>
    );
}}
export default ApiChanges;
'''

# ── AiFix ──
ai_fix = f'''import React, {{ useState, useEffect }} from "react";
import {{ Box, Typography, Grid, Select, MenuItem, Button, Chip, Alert, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow }} from "@mui/material";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {{ getAllAPIs, repairAPI, getPendingApprovals, approveRepair, rejectRepair }} from "../api/services";

const card = {{ {card_style}, p: 3 }};

function AiFix() {{
    const [apis, setApis] = useState([]);
    const [selectedApi, setSelectedApi] = useState("");
    const [fixResult, setFixResult] = useState(null);
    const [approvals, setApprovals] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {{
        getAllAPIs().then(r => {{ const d = r.data || []; setApis(d); if (d.length > 0) setSelectedApi(d[0].id); }}).catch(() => {{}});
        getPendingApprovals().then(r => setApprovals(r.approvals || [])).catch(() => {{}});
    }}, []);

    const runRepair = async () => {{
        if (!selectedApi) return;
        setLoading(true); setFixResult(null);
        try {{ const r = await repairAPI(selectedApi); setFixResult(r); getPendingApprovals().then(r => setApprovals(r.approvals || [])); }}
        catch (e) {{ setFixResult({{ status: "error", error: e.message }}); }}
        setLoading(false);
    }};

    return (
        <Box sx={{{{ display: "flex", minHeight: "100vh" }}}}>
            <Sidebar />
            <Box component="main" sx={{{{ flexGrow: 1, ml: "260px", p: 3 }}}}>
                <Navbar />
                <Box sx={{{{ mb: 3, mt: 1 }}}}>
                    <Typography variant="h4" sx={{{{ fontWeight: 800, letterSpacing: "-0.02em" }}}}>AI Fix</Typography>
                    <Typography sx={{{{ color: "rgba(255,255,255,0.35)", fontSize: 14, mt: 0.5 }}}}>AI Diagnosis, Safety Check, Proposed Code Changes.</Typography>
                </Box>

                <Box sx={{{{ ...card, display: "flex", gap: 1.5, alignItems: "center" }}}}>
                    <Select value={{selectedApi}} onChange={{e => setSelectedApi(e.target.value)}} sx={{{{ minWidth: 280 }}}} MenuProps={{{{ PaperProps: {{ style: {{ maxHeight: 300, background: "rgba(15,15,25,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 }} } }}} }}>
                        {{apis.map(a => <MenuItem key={{a.id}} value={{a.id}}>{{a.name || a.base_url}}</MenuItem>)}}
                    </Select>
                    <Button variant="contained" onClick={{runRepair}} disabled={{loading || !selectedApi}} sx={{{{ px: 4 }}}}>
                        {{loading ? "Running…" : "Run AI Fix"}}
                    </Button>
                </Box>

                {{apis.length === 0 && !loading && (
                    <Box sx={{{{ ...card, mt: 2, textAlign: "center", py: 6 }}}}>
                        <Typography sx={{{{ color: "rgba(255,255,255,0.25)", fontSize: 14 }}}}>No APIs registered yet. Scan an API on the Dashboard first.</Typography>
                    </Box>
                )}}

                {{loading && <LinearProgress sx={{{{ mt: 2 }}}} />}}

                {{fixResult && (
                    <Alert severity={{fixResult.status === "repair_verified" ? "success" : fixResult.status === "no_changes" ? "info" : "warning"}} sx={{{{ mt: 2 }}}>
                        Status: {{fixResult.status}} {{fixResult.error ? `- ${{fixResult.error}}` : ""}}
                    </Alert>
                )}}

                {{fixResult?.ai_fix && (
                    <Box sx={{{{ ...card, mt: 1.5 }}}}>
                        <Typography sx={{{{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", mb: 1.5 }}}}>Proposed Fix</Typography>
                        <Box sx={{{{ background: "rgba(0,0,0,0.3)", p: 2, borderRadius: 2, fontFamily: "monospace", color: "#22c55e", fontSize: 13, overflow: "auto", maxHeight: 300 }}}>
                            <pre>{{fixResult.ai_fix}}</pre>
                        </Box>
                    </Box>
                )}}

                {{approvals.length > 0 && (
                    <Box sx={{{{ ...card, mt: 1.5 }}}}>
                        <Typography sx={{{{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", mb: 1.5 }}}}>Pending Approvals</Typography>
                        <TableContainer><Table size="small"><TableHead><TableRow>
                            <TableCell sx={{{{ color: "rgba(255,255,255,0.3)" }}}}>File</TableCell>
                            <TableCell sx={{{{ color: "rgba(255,255,255,0.3)" }}}}>Reason</TableCell>
                            <TableCell sx={{{{ color: "rgba(255,255,255,0.3)" }}}}>Actions</TableCell>
                        </TableRow></TableHead><TableBody>
                            {{approvals.map(a => (
                                <TableRow key={{a.id}}>
                                    <TableCell sx={{{{ color: "#fff" }}}}}>{{a.affected_file || "-"}}</TableCell>
                                    <TableCell sx={{{{ color: "rgba(255,255,255,0.5)" }}}}}>{{a.reason || "-"}}</TableCell>
                                    <TableCell>
                                        <Button size="small" color="success" onClick={{() => approveRepair(a.id).then(() => getPendingApprovals().then(r => setApprovals(r.approvals || [])))}}>Approve</Button>
                                        <Button size="small" color="error" onClick={{() => rejectRepair(a.id).then(() => getPendingApprovals().then(r => setApprovals(r.approvals || [])))}}>Reject</Button>
                                    </TableCell>
                                </TableRow>
                            ))}}
                        </TableBody></Table></TableContainer>
                    </Box>
                )}}
            </Box>
        </Box>
    );
}}
export default AiFix;
'''

# ── HumanValidation ──
human_val = f'''import React, {{ useState, useEffect }} from "react";
import {{ Box, Typography, Grid, Button, Chip, LinearProgress, Alert }} from "@mui/material";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {{ getPendingApprovals, approveRepair, rejectRepair }} from "../api/services";

const card = {{ {card_style}, p: 3 }};

function HumanValidation() {{
    const [approvals, setApprovals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);

    const load = async () => {{
        setLoading(true);
        try {{ const r = await getPendingApprovals(); setApprovals(r.approvals || []); }} catch (e) {{ console.error(e); }}
        setLoading(false);
    }};
    useEffect(() => {{ load(); }}, []);

    const handleApprove = async (id) => {{
        setResult(null);
        try {{ await approveRepair(id); setResult({{ type: "success", msg: "Approved" }}); load(); }}
        catch (e) {{ setResult({{ type: "error", msg: e.message }}); }}
    }};

    const handleReject = async (id) => {{
        setResult(null);
        try {{ await rejectRepair(id); setResult({{ type: "success", msg: "Rejected" }}); load(); }}
        catch (e) {{ setResult({{ type: "error", msg: e.message }}); }}
    }};

    return (
        <Box sx={{{{ display: "flex", minHeight: "100vh" }}}}>
            <Sidebar />
            <Box component="main" sx={{{{ flexGrow: 1, ml: "260px", p: 3 }}}}>
                <Navbar />
                <Box sx={{{{ mb: 3, mt: 1 }}}}>
                    <Typography variant="h4" sx={{{{ fontWeight: 800, letterSpacing: "-0.02em" }}}}>Human Validation</Typography>
                    <Typography sx={{{{ color: "rgba(255,255,255,0.35)", fontSize: 14, mt: 0.5 }}}}>Review AI proposed changes. Approve, Reject, or Request Changes.</Typography>
                </Box>

                <Grid container spacing={1.5} sx={{{{ mb: 2 }}}}>
                    <Grid item xs={6} md={3}><Box sx={{{{ ...card, textAlign: "center", py: 2 }}}}>
                        <Typography sx={{{{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}}}>Pending</Typography>
                        <Typography sx={{{{ color: "#f5a623", fontSize: 32, fontWeight: 800 }}}}>{{approvals.length}}</Typography>
                    </Box></Grid>
                    <Grid item xs={6} md={3}><Box sx={{{{ ...card, textAlign: "center", py: 2 }}}}>
                        <Typography sx={{{{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}}}>Reviewed</Typography>
                        <Typography sx={{{{ color: "#22c55e", fontSize: 32, fontWeight: 800 }}}}>{{approvals.length}}</Typography>
                    </Box></Grid>
                </Grid>

                {{result && <Alert severity={{result.type}} sx={{{{ mb: 2 }}}}>{{result.msg}}</Alert>}}
                {{loading && <LinearProgress sx={{{{ mb: 2 }}}} />}}

                {{approvals.length === 0 ? (
                    <Box sx={{{{ ...card, textAlign: "center", py: 6 }}}}>
                        <Typography sx={{{{ color: "rgba(255,255,255,0.2)" }}}}>No pending approvals. All fixes are resolved.</Typography>
                    </Box>
                ) : approvals.map(a => (
                    <Box key={{a.id}} sx={{{{ ...card, mb: 1.5 }}}}>
                        <Box sx={{{{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}}}>
                            <Box>
                                <Typography sx={{{{ fontWeight: 700, fontSize: 15 }}}}}>{{a.affected_file || "Unknown File"}}</Typography>
                                <Typography sx={{{{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}}>Line {{a.affected_line || "?"}}</Typography>
                            </Box>
                            <Chip label={{a.status}} color="warning" size="small" />
                        </Box>
                        {{a.reason && <Typography sx={{{{ color: "rgba(255,255,255,0.5)", mb: 2, fontSize: 13 }}}>Reason: {{a.reason}}</Typography>}}
                        {{a.old_code && (
                            <Box sx={{{{ background: "rgba(0,0,0,0.3)", p: 2, borderRadius: 2, mb: 1.5 }}}>
                                <Typography sx={{{{ color: "#ef4444", fontSize: 11, fontWeight: 600, mb: 0.5 }}}}>Original</Typography>
                                <pre style={{{{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: 0, whiteSpace: "pre-wrap" }}}}>{{a.old_code}}</pre>
                            </Box>
                        )}}
                        {{a.proposed_code && (
                            <Box sx={{{{ background: "rgba(0,0,0,0.3)", p: 2, borderRadius: 2, mb: 1.5 }}}>
                                <Typography sx={{{{ color: "#22c55e", fontSize: 11, fontWeight: 600, mb: 0.5 }}}}>Proposed Fix</Typography>
                                <pre style={{{{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: 0, whiteSpace: "pre-wrap" }}}}>{{a.proposed_code}}</pre>
                            </Box>
                        )}}
                        <Box sx={{{{ display: "flex", gap: 1 }}}>
                            <Button variant="contained" color="success" size="small" onClick={{() => handleApprove(a.id)}}>Approve</Button>
                            <Button variant="contained" color="error" size="small" onClick={{() => handleReject(a.id)}}>Reject</Button>
                        </Box>
                    </Box>
                ))}}
            </Box>
        </Box>
    );
}}
export default HumanValidation;
'''

# ── History ──
history = f'''import React, {{ useState, useEffect }} from "react";
import {{ Box, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, LinearProgress, Tab, Tabs }} from "@mui/material";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {{ getDetailedHistory }} from "../api/services";

const card = {{ {card_style} }};

function History() {{
    const [tab, setTab] = useState(0);
    const [data, setData] = useState({{ timeline: [], versions: [], fixes: [], reviews: [] }});
    const [loading, setLoading] = useState(true);

    useEffect(() => {{ getDetailedHistory().then(r => setData(r)).catch(() => {{}}).finally(() => setLoading(false)); }}, []);

    const typeColor = (t) => ({{ scan: "info", fix: "success", review: "warning" }}[t] || "default");

    return (
        <Box sx={{{{ display: "flex", minHeight: "100vh" }}}}>
            <Sidebar />
            <Box component="main" sx={{{{ flexGrow: 1, ml: "260px", p: 3 }}}}>
                <Navbar />
                <Box sx={{{{ mb: 3, mt: 1 }}}}>
                    <Typography variant="h4" sx={{{{ fontWeight: 800, letterSpacing: "-0.02em" }}}}>History</Typography>
                    <Typography sx={{{{ color: "rgba(255,255,255,0.35)", fontSize: 14, mt: 0.5 }}}}>Activity Timeline, Versions, AI Fixes, Reviews.</Typography>
                </Box>

                <Grid container spacing={1.5} sx={{{{ mb: 2 }}}}>
                    {{{{ l: "Timeline", v: data.timeline?.length || 0, c: "#3b82f6" }}, {{{ l: "Fixes", v: data.fixes?.length || 0, c: "#22c55e" }}, {{{ l: "Reviews", v: data.reviews?.length || 0, c: "#f5a623" }}, {{{ l: "Versions", v: data.versions?.length || 0, c: "#a855f7" }}}].map((s, i) => (
                        <Grid item xs={6} md={3} key={{i}}>
                            <Box sx={{{{ ...card, p: 2.5, textAlign: "center" }}}}>
                                <Typography sx={{{{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}}>{{s.l}}</Typography>
                                <Typography sx={{{{ color: s.c, fontSize: 28, fontWeight: 800 }}}}>{{s.v}}</Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                {{loading && <LinearProgress sx={{{{ mb: 2 }}}} />}}

                <Box sx={{{{ ...card, p: 0, overflow: "visible" }}}}>
                    <Tabs value={{tab}} onChange={{(_, v) => setTab(v)}} sx={{{{ px: 2, pt: 1, borderBottom: "1px solid rgba(255,255,255,0.04)" }}}}>
                        <Tab label="Timeline" /><Tab label="AI Fixes" /><Tab label="Reviews" /><Tab label="Versions" />
                    </Tabs>
                    <Box sx={{{{ p: 0 }}}>
                        {{tab === 0 && (
                            <TableContainer><Table size="small"><TableHead><TableRow>
                                <TableCell sx={{{{ color: "rgba(255,255,255,0.3)" }}}}>Type</TableCell>
                                <TableCell sx={{{{ color: "rgba(255,255,255,0.3)" }}}}>Title</TableCell>
                                <TableCell sx={{{{ color: "rgba(255,255,255,0.3)" }}}}>Detail</TableCell>
                                <TableCell sx={{{{ color: "rgba(255,255,255,0.3)" }}}}>Date</TableCell>
                            </TableRow></TableHead><TableBody>
                                {{(data.timeline || []).length === 0 ? <TableRow><TableCell colSpan={{4}} sx={{{{ color: "rgba(255,255,255,0.2)" }}}>No activity yet.</TableCell></TableRow>
                                : data.timeline.map((item, i) => (
                                    <TableRow key={{i}}>
                                        <TableCell><Chip size="small" label={{item.type}} color={{typeColor(item.type)}} /></TableCell>
                                        <TableCell sx={{{{ color: "#fff" }}}}>{{item.title}}</TableCell>
                                        <TableCell sx={{{{ color: "rgba(255,255,255,0.5)" }}}}}>{{item.detail}}</TableCell>
                                        <TableCell sx={{{{ color: "rgba(255,255,255,0.25)" }}}}}>{{item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}}</TableCell>
                                    </TableRow>
                                ))}}
                            </TableBody></Table></TableContainer>
                        )}}
                        {{tab === 1 && (
                            <TableContainer><Table size="small"><TableHead><TableRow>
                                <TableCell sx={{{{ color: "rgba(255,255,255,0.3)" }}}}>File</TableCell>
                                <TableCell sx={{{{ color: "rgba(255,255,255,0.3)" }}}}>Change</TableCell>
                                <TableCell sx={{{{ color: "rgba(255,255,255,0.3)" }}}}>Tests</TableCell>
                                <TableCell sx={{{{ color: "rgba(255,255,255,0.3)" }}}}>Date</TableCell>
                            </TableRow></TableHead><TableBody>
                                {{(data.fixes || []).length === 0 ? <TableRow><TableCell colSpan={{4}} sx={{{{ color: "rgba(255,255,255,0.2)" }}}>No fixes yet.</TableCell></TableRow>
                                : data.fixes.map((f, i) => (
                                    <TableRow key={{i}}>
                                        <TableCell sx={{{{ color: "#fff" }}}}>{{f.affected_file || "-"}}</TableCell>
                                        <TableCell sx={{{{ color: "rgba(255,255,255,0.5)" }}}}}>{{f.api_change || "-"}}</TableCell>
                                        <TableCell><Chip size="small" label={{f.test_passed ? "Pass" : "Fail"}} color={{f.test_passed ? "success" : "error"}} /></TableCell>
                                        <TableCell sx={{{{ color: "rgba(255,255,255,0.25)" }}}}}>{{f.created_at ? new Date(f.created_at).toLocaleDateString() : ""}}</TableCell>
                                    </TableRow>
                                ))}}
                            </TableBody></Table></TableContainer>
                        )}}
                        {{tab === 2 && (
                            <TableContainer><Table size="small"><TableHead><TableRow>
                                <TableCell sx={{{{ color: "rgba(255,255,255,0.3)" }}}}>File</TableCell>
                                <TableCell sx={{{{ color: "rgba(255,255,255,0.3)" }}}}>Status</TableCell>
                                <TableCell sx={{{{ color: "rgba(255,255,255,0.3)" }}}}>Date</TableCell>
                            </TableRow></TableHead><TableBody>
                                {{(data.reviews || []).length === 0 ? <TableRow><TableCell colSpan={{3}} sx={{{{ color: "rgba(255,255,255,0.2)" }}}>No reviews yet.</TableCell></TableRow>
                                : data.reviews.map((r, i) => (
                                    <TableRow key={{i}}>
                                        <TableCell sx={{{{ color: "#fff" }}}}>{{r.affected_file || "-"}}</TableCell>
                                        <TableCell><Chip size="small" label={{r.status}} color={{r.status === "approved_and_repaired" ? "success" : r.status === "rejected" ? "error" : "warning"}} /></TableCell>
                                        <TableCell sx={{{{ color: "rgba(255,255,255,0.25)" }}}}}>{{r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}}</TableCell>
                                    </TableRow>
                                ))}}
                            </TableBody></Table></TableContainer>
                        )}}
                        {{tab === 3 && (
                            <TableContainer><Table size="small"><TableHead><TableRow>
                                <TableCell sx={{{{ color: "rgba(255,255,255,0.3)" }}}}>API</TableCell>
                                <TableCell sx={{{{ color: "rgba(255,255,255,0.3)" }}}}>Changes</TableCell>
                                <TableCell sx={{{{ color: "rgba(255,255,255,0.3)" }}}}>Date</TableCell>
                            </TableRow></TableHead><TableBody>
                                {{(data.versions || []).length === 0 ? <TableRow><TableCell colSpan={{3}} sx={{{{ color: "rgba(255,255,255,0.2)" }}}>No versions yet.</TableCell></TableRow>
                                : data.versions.map((v, i) => (
                                    <TableRow key={{i}}>
                                        <TableCell sx={{{{ color: "#fff" }}}}>{{v.api_id || "-"}}</TableCell>
                                        <TableCell sx={{{{ color: "rgba(255,255,255,0.5)" }}}}}>{{v.changes || "-"}}</TableCell>
                                        <TableCell sx={{{{ color: "rgba(255,255,255,0.25)" }}}}}>{{v.created_at ? new Date(v.created_at).toLocaleDateString() : ""}}</TableCell>
                                    </TableRow>
                                ))}}
                            </TableBody></Table></TableContainer>
                        )}}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}}
export default History;
'''

# ── Settings ──
settings = f'''import React, {{ useState, useEffect }} from "react";
import {{ Box, Typography, Grid, TextField, Button, Switch, FormControlLabel, Select, MenuItem, Alert, Slider, Divider }} from "@mui/material";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {{ getSettings, updateSettings }} from "../api/services";

const card = {{ {card_style}, p: 3 }};

function Settings() {{
    const [settings, setSettings] = useState({{}});
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);

    useEffect(() => {{ getSettings().then(r => setSettings(r)).catch(() => {{}}).finally(() => setLoading(false)); }}, []);

    const handleChange = (key, value) => setSettings(prev => ({{ ...prev, [key]: value }}));
    const handleSave = async () => {{
        setSaved(false);
        try {{ await updateSettings(settings); setSaved(true); }} catch (e) {{ console.error(e); }}
    }};

    const section = (title) => (
        <Box sx={{{{ mb: 2.5, mt: 0.5 }}}}>
            <Typography sx={{{{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}}>{{title}}</Typography>
            <Divider sx={{{{ borderColor: "rgba(255,255,255,0.04)", mt: 1 }}}} />
        </Box>
    );

    return (
        <Box sx={{{{ display: "flex", minHeight: "100vh" }}}}>
            <Sidebar />
            <Box component="main" sx={{{{ flexGrow: 1, ml: "260px", p: 3 }}}}>
                <Navbar />
                <Box sx={{{{ mb: 3, mt: 1 }}}}>
                    <Typography variant="h4" sx={{{{ fontWeight: 800, letterSpacing: "-0.02em" }}}}>Settings</Typography>
                    <Typography sx={{{{ color: "rgba(255,255,255,0.35)", fontSize: 14, mt: 0.5 }}}}>Project, Scanner, Monitoring, AI, Validation, Alerts.</Typography>
                </Box>

                {{saved && <Alert severity="success" sx={{{{ mb: 2 }}}>Settings saved!</Alert>}}

                <Box sx={{{{ ...card }}}}>
                    {{section("Project Configuration")}}
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Project Name" value={{settings.project_name || ""}} onChange={{e => handleChange("project_name", e.target.value)}} size="small" /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Repository URL" value={{settings.repo_url || ""}} onChange={{e => handleChange("repo_url", e.target.value)}} size="small" /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Branch" value={{settings.branch || "main"}} onChange={{e => handleChange("branch", e.target.value)}} size="small" /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Scan Path" value={{settings.scan_path || "/"}} onChange={{e => handleChange("scan_path", e.target.value)}} size="small" /></Grid>
                    </Grid>

                    {{section("Scanner Settings")}}
                    <Grid container spacing={2}>
                        <Grid item xs={4}><FormControlLabel control={<Switch checked={{settings.detect_removed !== false}} onChange={{e => handleChange("detect_removed", e.target.checked)}} />} label="Detect Removed" /></Grid>
                        <Grid item xs={4}><FormControlLabel control={<Switch checked={{settings.detect_added !== false}} onChange={{e => handleChange("detect_added", e.target.checked)}} />} label="Detect Added" /></Grid>
                        <Grid item xs={4}><FormControlLabel control={<Switch checked={{settings.detect_type_changed !== false}} onChange={{e => handleChange("detect_type_changed", e.target.checked)}} />} label="Detect Type" /></Grid>
                        <Grid item xs={12} sm={6}><Select value={{settings.scan_frequency || "daily"}} onChange={{e => handleChange("scan_frequency", e.target.value)}} fullWidth size="small"><MenuItem value="hourly">Hourly</MenuItem><MenuItem value="daily">Daily</MenuItem><MenuItem value="weekly">Weekly</MenuItem></Select></Grid>
                    </Grid>

                    {{section("Monitoring")}}
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}><TextField fullWidth type="number" label="Health Check Interval (s)" value={{settings.health_check_interval || 300}} onChange={{e => handleChange("health_check_interval", parseInt(e.target.value))}} size="small" /></Grid>
                    </Grid>

                    {{section("AI Settings")}}
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}><Select value={{settings.ai_fix_mode || "suggest"}} onChange={{e => handleChange("ai_fix_mode", e.target.value)}} fullWidth size="small"><MenuItem value="suggest">Suggest Only</MenuItem><MenuItem value="patch">Auto Patch</MenuItem><MenuItem value="auto">Full Auto</MenuItem></Select></Grid>
                    </Grid>

                    {{section("Validation Rules")}}
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}}>
                            <Typography sx={{{{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}}}>Risk Threshold: {{settings.risk_threshold || 70}}</Typography>
                            <Slider value={{settings.risk_threshold || 70}} onChange={{(_, v) => handleChange("risk_threshold", v)}} min={{0}} max={{100}} sx={{{{ mt: 1 }}}} />
                        </Grid>
                        <Grid item xs={12} sm={6}}>
                            <Typography sx={{{{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}}}>Require Approval Above: {{settings.require_approval_above || 80}}</Typography>
                            <Slider value={{settings.require_approval_above || 80}} onChange={{(_, v) => handleChange("require_approval_above", v)}} min={{0}} max={{100}} sx={{{{ mt: 1 }}}} />
                        </Grid>
                    </Grid>

                    {{section("Alerts")}}
                    <Grid container spacing={2}>
                        <Grid item xs={6}><FormControlLabel control={<Switch checked={{settings.alert_on_change !== false}} onChange={{e => handleChange("alert_on_change", e.target.checked)}} />} label="Alert on Change" /></Grid>
                        <Grid item xs={6}><FormControlLabel control={<Switch checked={{settings.alert_on_failure !== false}} onChange={{e => handleChange("alert_on_failure", e.target.checked)}} />} label="Alert on Failure" /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Alert Email" value={{settings.alert_email || ""}} onChange={{e => handleChange("alert_email", e.target.value)}} size="small" /></Grid>
                    </Grid>

                    <Box sx={{{{ mt: 3, display: "flex", justifyContent: "flex-end" }}}}>
                        <Button variant="contained" onClick={{handleSave}} sx={{{{ px: 5 }}}>Save Changes</Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}}
export default Settings;
'''

# Write all files
for name, content in [('AnalyzeApi.jsx', api_analyze), ('ApiChanges.jsx', api_changes), ('AiFix.jsx', ai_fix), ('HumanValidation.jsx', human_val), ('History.jsx', history), ('Settings.jsx', settings)]:
    path = os.path.join(pages_dir, name)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Written {name} ({len(content)} chars)")
