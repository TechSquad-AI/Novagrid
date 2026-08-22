import React, { useState } from "react";
import {
    Box, Typography, Card, CardContent, Switch, Slider, TextField,
    Button, Divider, Chip, Snackbar, Alert,
} from "@mui/material";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

export default function Settings() {
    const [snack, setSnack] = useState({ open: false, msg: "" });
    const [settings, setSettings] = useState({
        autoScan: true,
        scanInterval: 60,
        autoFix: false,
        confidenceThreshold: 80,
        riskThreshold: 60,
        emailNotifications: true,
        sheetsLogging: true,
        viaSocketWebhook: true,
    });

    const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));
    const update = (key, val) => setSettings(s => ({ ...s, [key]: val }));

    const handleSave = () => {
        localStorage.setItem("novagrid_settings", JSON.stringify(settings));
        setSnack({ open: true, msg: "Settings saved" });
    };

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <SettingsRoundedIcon sx={{ fontSize: 24, color: "#6366f1" }} />
                    <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: 22, color: "#0f172a" }}>Settings</Typography>
                        <Typography sx={{ color: "#94a3b8", fontSize: 12, mt: 0.3 }}>Configure NovaGrid behavior</Typography>
                    </Box>
                </Box>
                <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={handleSave}
                    sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700, fontSize: 13, background: "#6366f1", "&:hover": { background: "#4f46e5" } }}>
                    Save
                </Button>
            </Box>

            {/* Scanner Settings */}
            <Card sx={{ borderRadius: 2, border: "1px solid #e2e8f0", mb: 2 }}>
                <CardContent>
                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#0f172a", mb: 2 }}>Scanner</Typography>
                    <SettingRow
                        label="Auto-scan enabled"
                        desc="Automatically scan endpoints on a schedule"
                        control={<Switch checked={settings.autoScan} onChange={() => toggle("autoScan")} size="small" />}
                    />
                    <Divider sx={{ my: 1.5 }} />
                    <Box>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#334155", mb: 1 }}>
                            Scan interval: {settings.scanInterval}s
                        </Typography>
                        <Slider value={settings.scanInterval} onChange={(_, v) => update("scanInterval", v)}
                            min={10} max={300} step={10} size="small"
                            sx={{ color: "#6366f1", "& .MuiSlider-thumb": { width: 14, height: 14 } }} />
                    </Box>
                </CardContent>
            </Card>

            {/* AI Settings */}
            <Card sx={{ borderRadius: 2, border: "1px solid #e2e8f0", mb: 2 }}>
                <CardContent>
                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#0f172a", mb: 2 }}>AI Fix</Typography>
                    <SettingRow
                        label="Auto-fix enabled"
                        desc="Automatically apply low-risk fixes without human approval"
                        control={<Switch checked={settings.autoFix} onChange={() => toggle("autoFix")} size="small" />}
                    />
                    <Divider sx={{ my: 1.5 }} />
                    <Box>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#334155", mb: 1 }}>
                            Confidence threshold: {settings.confidenceThreshold}%
                        </Typography>
                        <Slider value={settings.confidenceThreshold} onChange={(_, v) => update("confidenceThreshold", v)}
                            min={50} max={100} step={5} size="small"
                            sx={{ color: "#8b5cf6", "& .MuiSlider-thumb": { width: 14, height: 14 } }} />
                    </Box>
                    <Divider sx={{ my: 1.5 }} />
                    <Box>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#334155", mb: 1 }}>
                            Risk threshold: {settings.riskThreshold}%
                        </Typography>
                        <Slider value={settings.riskThreshold} onChange={(_, v) => update("riskThreshold", v)}
                            min={0} max={100} step={5} size="small"
                            sx={{ color: "#f59e0b", "& .MuiSlider-thumb": { width: 14, height: 14 } }} />
                    </Box>
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card sx={{ borderRadius: 2, border: "1px solid #e2e8f0", mb: 2 }}>
                <CardContent>
                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#0f172a", mb: 2 }}>Notifications</Typography>
                    <SettingRow
                        label="Email notifications"
                        desc="Send email alerts when breaking changes are detected"
                        control={<Switch checked={settings.emailNotifications} onChange={() => toggle("emailNotifications")} size="small" />}
                    />
                    <Divider sx={{ my: 1.5 }} />
                    <SettingRow
                        label="Google Sheets logging"
                        desc="Log all events to your connected Google Sheet"
                        control={<Switch checked={settings.sheetsLogging} onChange={() => toggle("sheetsLogging")} size="small" />}
                    />
                    <Divider sx={{ my: 1.5 }} />
                    <SettingRow
                        label="viaSocket webhook"
                        desc="Trigger viaSocket flows on API changes"
                        control={<Switch checked={settings.viaSocketWebhook} onChange={() => toggle("viaSocketWebhook")} size="small" />}
                    />
                </CardContent>
            </Card>

            {/* System Status */}
            <Card sx={{ borderRadius: 2, border: "1px solid #e2e8f0" }}>
                <CardContent>
                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#0f172a", mb: 2 }}>System</Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                        {[
                            { label: "Version", value: "1.0.0" },
                            { label: "Frontend", value: "React + Vite" },
                            { label: "Backend", value: "FastAPI + Supabase" },
                            { label: "Integration", value: "viaSocket + Google Sheets" },
                        ].map((item) => (
                            <Box key={item.label}>
                                <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>{item.label}</Typography>
                                <Typography sx={{ fontSize: 12, color: "#334155", mt: 0.2 }}>{item.value}</Typography>
                            </Box>
                        ))}
                    </Box>
                </CardContent>
            </Card>

            <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })} message={snack.msg} />
        </Box>
    );
}

function SettingRow({ label, desc, control }) {
    return (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{label}</Typography>
                <Typography sx={{ fontSize: 11, color: "#94a3b8", mt: 0.2 }}>{desc}</Typography>
            </Box>
            {control}
        </Box>
    );
}
