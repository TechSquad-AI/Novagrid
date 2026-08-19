import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, TextField, Button, Switch, FormControlLabel, Select, MenuItem, Alert, Slider, Divider } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { getSettings, updateSettings } from "../api/services";

const card = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "visible", p: 3 };

function Settings() {
    const [settings, setSettings] = useState({});
    const [saved, setSaved] = useState(false);

    useEffect(() => { getSettings().then(r => setSettings(r)).catch(() => {}); }, []);
    const handleChange = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));
    const handleSave = async () => {
        setSaved(false);
        try { await updateSettings(settings); setSaved(true); } catch (e) { console.error(e); }
    };

    const section = (title) => (
        <Box sx={{ mb: 2.5, mt: 0.5 }}>
            <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</Typography>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.04)", mt: 1 }} />
        </Box>
    );

    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, ml: "260px", p: 3 }}>
                <Navbar />
                <Box sx={{ mb: 3, mt: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>Settings</Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 14, mt: 0.5 }}>Project, Scanner, Monitoring, AI, Validation, Alerts.</Typography>
                </Box>
                {saved && <Alert severity="success" sx={{ mb: 2 }}>Settings saved!</Alert>}
                <Box sx={{ ...card }}>
                    {section("Project Configuration")}
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Project Name" value={settings.project_name || ""} onChange={e => handleChange("project_name", e.target.value)} size="small" /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Repository URL" value={settings.repo_url || ""} onChange={e => handleChange("repo_url", e.target.value)} size="small" /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Branch" value={settings.branch || "main"} onChange={e => handleChange("branch", e.target.value)} size="small" /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Scan Path" value={settings.scan_path || "/"} onChange={e => handleChange("scan_path", e.target.value)} size="small" /></Grid>
                    </Grid>
                    {section("Scanner Settings")}
                    <Grid container spacing={2}>
                        <Grid item xs={4}><FormControlLabel control={<Switch checked={settings.detect_removed !== false} onChange={e => handleChange("detect_removed", e.target.checked)} />} label="Detect Removed" /></Grid>
                        <Grid item xs={4}><FormControlLabel control={<Switch checked={settings.detect_added !== false} onChange={e => handleChange("detect_added", e.target.checked)} />} label="Detect Added" /></Grid>
                        <Grid item xs={4}><FormControlLabel control={<Switch checked={settings.detect_type_changed !== false} onChange={e => handleChange("detect_type_changed", e.target.checked)} />} label="Detect Type" /></Grid>
                        <Grid item xs={12} sm={6}><Select value={settings.scan_frequency || "daily"} onChange={e => handleChange("scan_frequency", e.target.value)} fullWidth size="small"><MenuItem value="hourly">Hourly</MenuItem><MenuItem value="daily">Daily</MenuItem><MenuItem value="weekly">Weekly</MenuItem></Select></Grid>
                    </Grid>
                    {section("Monitoring")}
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}><TextField fullWidth type="number" label="Health Check Interval (s)" value={settings.health_check_interval || 300} onChange={e => handleChange("health_check_interval", parseInt(e.target.value))} size="small" /></Grid>
                    </Grid>
                    {section("AI Settings")}
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}><Select value={settings.ai_fix_mode || "suggest"} onChange={e => handleChange("ai_fix_mode", e.target.value)} fullWidth size="small"><MenuItem value="suggest">Suggest Only</MenuItem><MenuItem value="patch">Auto Patch</MenuItem><MenuItem value="auto">Full Auto</MenuItem></Select></Grid>
                    </Grid>
                    {section("Validation Rules")}
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Risk Threshold: {settings.risk_threshold || 70}</Typography>
                            <Slider value={settings.risk_threshold || 70} onChange={(_, v) => handleChange("risk_threshold", v)} min={0} max={100} sx={{ mt: 1 }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Require Approval Above: {settings.require_approval_above || 80}</Typography>
                            <Slider value={settings.require_approval_above || 80} onChange={(_, v) => handleChange("require_approval_above", v)} min={0} max={100} sx={{ mt: 1 }} />
                        </Grid>
                    </Grid>
                    {section("Alerts")}
                    <Grid container spacing={2}>
                        <Grid item xs={6}><FormControlLabel control={<Switch checked={settings.alert_on_change !== false} onChange={e => handleChange("alert_on_change", e.target.checked)} />} label="Alert on Change" /></Grid>
                        <Grid item xs={6}><FormControlLabel control={<Switch checked={settings.alert_on_failure !== false} onChange={e => handleChange("alert_on_failure", e.target.checked)} />} label="Alert on Failure" /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Alert Email" value={settings.alert_email || ""} onChange={e => handleChange("alert_email", e.target.value)} size="small" /></Grid>
                    </Grid>
                    <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                        <Button variant="contained" onClick={handleSave} sx={{ px: 5 }}>Save Changes</Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
export default Settings;
