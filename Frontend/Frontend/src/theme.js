import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "light",
        background: { default: "#f0f2f5", paper: "#ffffff" },
        primary: { main: "#1a73e8" },
        secondary: { main: "#5f6368" },
        success: { main: "#0d9488" },
        error: { main: "#dc2626" },
        warning: { main: "#ea580c" },
        info: { main: "#1a73e8" },
        text: { primary: "#1a1f36", secondary: "#5f6368" },
    },
    shape: { borderRadius: 12 },
    typography: {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        h4: { fontWeight: 700, letterSpacing: "-0.01em", fontSize: 24 },
        h5: { fontWeight: 700, fontSize: 20 },
        h6: { fontWeight: 600, fontSize: 17 },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: { background: "#f0f2f5", color: "#1a1f36", minHeight: "100vh" },
                "*::-webkit-scrollbar": { width: 6 },
                "*::-webkit-scrollbar-track": { background: "transparent" },
                "*::-webkit-scrollbar-thumb": { background: "#d1d5db", borderRadius: 3 },
            }
        },
        MuiButton: {
            styleOverrides: {
                root: { borderRadius: 8, textTransform: "none", fontWeight: 600, fontSize: 14, boxShadow: "none", padding: "8px 20px" },
                contained: { background: "#1a73e8", color: "#fff", "&:hover": { background: "#1557b0" } },
                outlined: { borderColor: "#d1d5db", color: "#5f6368", "&:hover": { borderColor: "#1a73e8", background: "rgba(26,115,232,0.04)" } },
            }
        },
        MuiChip: {
            styleOverrides: {
                root: { borderRadius: 6, fontWeight: 600, fontSize: 12, height: 24 },
                colorSuccess: { background: "rgba(13,148,136,0.08)", color: "#0d9488" },
                colorError: { background: "rgba(220,38,38,0.08)", color: "#dc2626" },
                colorWarning: { background: "rgba(234,88,12,0.08)", color: "#ea580c" },
                colorInfo: { background: "rgba(26,115,232,0.08)", color: "#1a73e8" },
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 8,
                        background: "#fff",
                        "& fieldset": { borderColor: "#e5e7eb" },
                        "&:hover fieldset": { borderColor: "#d1d5db" },
                        "&.Mui-focused fieldset": { borderColor: "#1a73e8" },
                    },
                    "& .MuiInputLabel-root": { color: "#6b7280" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#1a73e8" },
                    "& .MuiInputBase-input": { color: "#1a1f36" },
                }
            }
        },
        MuiSelect: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    "& .MuiSelect-select": { background: "#fff", color: "#1a1f36", padding: "10px 14px" },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#d1d5db" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1a73e8" },
                }
            }
        },
        MuiMenu: {
            styleOverrides: {
                paper: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", marginTop: 4 },
            }
        },
        MuiMenuItem: {
            styleOverrides: {
                root: { color: "#374151", fontSize: 14, padding: "8px 16px", "&:hover": { background: "rgba(26,115,232,0.04)" }, "&.Mui-selected": { background: "rgba(26,115,232,0.08)" } },
            }
        },
        MuiTableCell: {
            styleOverrides: {
                root: { color: "#374151", fontSize: 13, borderBottom: "1px solid #f3f4f6", padding: "10px 12px" },
                head: { color: "#6b7280", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", background: "#fafbfc" },
            }
        },
        MuiDivider: { styleOverrides: { root: { borderColor: "#e5e7eb" } } },
        MuiLinearProgress: {
            styleOverrides: { root: { borderRadius: 4, background: "#e5e7eb" }, bar: { background: "#1a73e8" } }
        },
        MuiTab: {
            styleOverrides: { root: { textTransform: "none", fontWeight: 600, color: "#6b7280", "&.Mui-selected": { color: "#1a73e8" } } }
        },
    }
});

export default theme;
