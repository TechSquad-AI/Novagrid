import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Switch, FormControlLabel, Button, Slider, Select, MenuItem, Alert, Divider } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../context/SidebarContext";
import Navbar from "../components/Navbar";
import { getSettings, updateSettings } from "../api/services";

function Settings() {
    const { open: sidebarOpen } = useSidebar();
    const sidebarMargin = sidebarOpen ? "250px" : "0px";
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        getSettings().then(r => { setSettings(r); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const handleChange = (key, value) => setSettings(s => ({ ...s, [key]: value }));

    const handleSave = async () => {
        try { await updateSettings(settings); setSaved(true); setTimeout(() => setSaved(false), 3000); } catch {}
    };

    const card = { background: "#fff", borderRadius: 2.5, p: 3, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" };
    const lbl = { color: "#6b7280", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 };

    return (
        <Box sx={{ display: "flex", height: "100vh", overflowY: "auto", background: "#f0f2f5" }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, ml: sidebarMargin, p: 3, position: "relative", zIndex: 1 }}>
                <Navbar subtitle="Project Configuration" title="Settings" />

                {saved && <Alert severity="success" sx={{ mb: 2 }}>Settings saved successfully!</Alert>}

                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3 }}>
                    {/* Project Config */}
                    <Box sx={card}>
                        <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#1a1f36", mb: 2 }}>Project Configuration</Typography>
                        <Box sx={{ mb: 2 }}>
                            <Typography sx={lbl}>Project Name</Typography>
                            <TextField fullWidth size="small" value={settings.project_name || ""} onChange={e => handleChange("project_name", e.target.value)}
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography sx={lbl}>Repository URL</Typography>
                            <TextField fullWidth size="small" value={settings.repo_url || ""} onChange={e => handleChange("repo_url", e.target.value)} placeholder="https://github.com/..."
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography sx={lbl}>Branch</Typography>
                            <TextField fullWidth size="small" value={settings.branch || ""} onChange={e => handleChange("branch", e.target.value)}
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                        </Box>
                        <Box>
                            <Typography sx={lbl}>Scan Path</Typography>
                            <TextField fullWidth size="small" value={settings.scan_path || ""} onChange={e => handleChange("scan_path", e.target.value)}
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                        </Box>
                    </Box>

                    {/* Scanner Settings */}
                    <Box sx={card}>
                        <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#1a1f36", mb: 2 }}>Scanner Settings</Typography>
                        <Box sx={{ mb: 2 }}>
                            <Typography sx={lbl}>Detection Toggles</Typography>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 0.5 }}>
                                <FormControlLabel control={<Switch checked={settings.detect_removed !== false} onChange={e => handleChange("detect_removed", e.target.checked)} />} label="Detect Removed Fields" />
                                <FormControlLabel control={<Switch checked={settings.detect_added !== false} onChange={e => handleChange("detect_added", e.target.checked)} />} label="Detect Added Fields" />
                                <FormControlLabel control={<Switch checked={settings.detect_type_changed !== false} onChange={e => handleChange("detect_type_changed", e.target.checked)} />} label="Detect Type Changes" />
                            </Box>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography sx={lbl}>Scan Frequency</Typography>
                            <Select fullWidth size="small" value={settings.scan_frequency || "daily"} onChange={e => handleChange("scan_frequency", e.target.value)}
                                sx={{ borderRadius: 2 }}>
                                <MenuItem value="hourly">Hourly</MenuItem>
                                <MenuItem value="daily">Daily</MenuItem>
                                <MenuItem value="weekly">Weekly</MenuItem>
                            </Select>
                        </Box>
                        <Box>
                            <Typography sx={lbl}>Health Check Interval (seconds)</Typography>
                            <TextField fullWidth size="small" type="number" value={settings.health_check_interval || 300} onChange={e => handleChange("health_check_interval", parseInt(e.target.value) || 300)}
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                        </Box>
                    </Box>

                    {/* AI Settings */}
                    <Box sx={card}>
                        <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#1a1f36", mb: 2 }}>AI Settings</Typography>
                        <Box sx={{ mb: 2 }}>
                            <Typography sx={lbl}>Fix Mode</Typography>
                            <Select fullWidth size="small" value={settings.ai_fix_mode || "suggest"} onChange={e => handleChange("ai_fix_mode", e.target.value)}
                                sx={{ borderRadius: 2 }}>
                                <MenuItem value="suggest">Suggest Only</MenuItem>
                                <MenuItem value="patch">Auto Patch</MenuItem>
                                <MenuItem value="auto">Full Auto</MenuItem>
                            </Select>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography sx={lbl}>Risk Threshold: {settings.risk_threshold || 70}%</Typography>
                            <Slider value={settings.risk_threshold || 70} onChange={(e, v) => handleChange("risk_threshold", v)}
                                min={0} max={100} sx={{ color: "#1a73e8" }} />
                        </Box>
                        <Box>
                            <Typography sx={lbl}>Require Approval Above: {settings.require_approval_above || 80}%</Typography>
                            <Slider value={settings.require_approval_above || 80} onChange={(e, v) => handleChange("require_approval_above", v)}
                                min={0} max={100} sx={{ color: "#ea580c" }} />
                        </Box>
                    </Box>

                    {/* Alerts */}
                    <Box sx={card}>
                        <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#1a1f36", mb: 2 }}>Alerts & Notifications</Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <FormControlLabel control={<Switch checked={settings.alert_on_change !== false} onChange={e => handleChange("alert_on_change", e.target.checked)} />} label="Alert on API Change" />
                            <FormControlLabel control={<Switch checked={settings.alert_on_failure !== false} onChange={e => handleChange("alert_on_failure", e.target.checked)} />} label="Alert on Health Failure" />
                            <Box sx={{ mt: 1 }}>
                                <Typography sx={lbl}>Alert Email</Typography>
                                <TextField fullWidth size="small" type="email" value={settings.alert_email || ""} onChange={e => handleChange("alert_email", e.target.value)} placeholder="team@example.com"
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Save Button */}
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} sx={{ px: 4, py: 1.2 }}>Save Changes</Button>
                </Box>
            </Box>
        </Box>
    );
}
export default Settings;
