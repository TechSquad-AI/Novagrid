import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "light",
        background: { default: "#F4F7FE", paper: "#ffffff" },
        primary: { main: "#4318FF" },
        secondary: { main: "#7551FF" },
        success: { main: "#05CD99" },
        error: { main: "#EE5D50" },
        warning: { main: "#FFB547" },
        info: { main: "#4318FF" },
    },
    shape: { borderRadius: 20 },
    typography: {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        h4: { fontWeight: 800, letterSpacing: "-0.02em", color: "#1B2559" },
        h5: { fontWeight: 700, color: "#1B2559" },
        h6: { fontWeight: 700, color: "#1B2559" },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: { background: "#F4F7FE", color: "#2B3674", minHeight: "100vh" },
                "::-webkit-scrollbar": { width: 6 },
                "::-webkit-scrollbar-track": { background: "transparent" },
                "::-webkit-scrollbar-thumb": { background: "rgba(0,0,0,0.1)", borderRadius: 3 },
            }
        },
        MuiButton: {
            styleOverrides: {
                root: { borderRadius: 16, textTransform: "none", fontWeight: 700, padding: "12px 28px", fontSize: 14, boxShadow: "none" },
                contained: {
                    background: "linear-gradient(135deg, #4318FF, #7551FF)", color: "#fff",
                    "&:hover": { background: "linear-gradient(135deg, #3512D6, #6243E6)", boxShadow: "0 8px 24px rgba(67,24,255,0.2)" }
                },
                outlined: { borderColor: "rgba(43,54,116,0.2)", color: "#2B3674", "&:hover": { borderColor: "#4318FF", background: "rgba(67,24,255,0.06)" } },
                text: { color: "#4318FF", "&:hover": { background: "rgba(67,24,255,0.06)" } }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: { borderRadius: 8, fontWeight: 600, fontSize: 12, background: "rgba(43,54,116,0.06)", color: "#2B3674", border: "1px solid rgba(43,54,116,0.08)" },
                "&.MuiChip-colorSuccess": { background: "rgba(5,205,153,0.1)", color: "#05CD99", border: "1px solid rgba(5,205,153,0.15)" },
                "&.MuiChip-colorError": { background: "rgba(238,93,80,0.1)", color: "#EE5D50", border: "1px solid rgba(238,93,80,0.15)" },
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 16, background: "#fff",
                        "& fieldset": { borderColor: "rgba(43,54,116,0.12)" },
                        "&:hover fieldset": { borderColor: "rgba(43,54,116,0.25)" },
                        "&.Mui-focused fieldset": { borderColor: "#4318FF" }
                    },
                    "& .MuiInputLabel-root": { color: "#A3AED0" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#4318FF" },
                    "& .MuiInputBase-input": { color: "#1B2559" }
                }
            }
        },
        MuiSelect: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    "& .MuiSelect-select": { background: "#fff", color: "#1B2559", padding: "12px 14px", borderRadius: 16 },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(43,54,116,0.12)" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(43,54,116,0.25)" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#4318FF" },
                    "& .MuiSvgIcon-root": { color: "rgba(43,54,116,0.4)" }
                }
            }
        },
        MuiMenu: { styleOverrides: { paper: { background: "#fff !important", border: "1px solid rgba(43,54,116,0.08)", borderRadius: 16, boxShadow: "0 12px 40px rgba(0,0,0,0.08)", maxHeight: 300 } } },
        MuiMenuItem: { styleOverrides: { root: { color: "#2B3674", fontSize: 14, padding: "10px 16px", "&:hover": { background: "rgba(67,24,255,0.06) !important" }, "&.Mui-selected": { background: "rgba(67,24,255,0.1) !important", color: "#4318FF" } } } },
        MuiTab: { styleOverrides: { root: { textTransform: "none", fontWeight: 600, color: "rgba(43,54,116,0.4)", "&.Mui-selected": { color: "#4318FF" } } } },
        MuiLinearProgress: { styleOverrides: { root: { borderRadius: 4, background: "rgba(43,54,116,0.06)" }, bar: { background: "linear-gradient(90deg, #4318FF, #7551FF)" } } },
        MuiTableCell: { styleOverrides: { root: { color: "#2B3674", fontSize: 13, borderBottom: "1px solid rgba(43,54,116,0.06)", padding: "12px 14px" }, head: { color: "#A3AED0", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" } } },
        MuiAlert: { styleOverrides: { root: { borderRadius: 16 } } },
        MuiDivider: { styleOverrides: { root: { borderColor: "rgba(43,54,116,0.06)" } } },
        MuiSwitch: { styleOverrides: { root: { "& .MuiSwitch-switchBase.Mui-checked": { color: "#4318FF" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "rgba(67,24,255,0.3)" } } } },
        MuiSlider: { styleOverrides: { root: { "& .MuiSlider-thumb": { color: "#4318FF" }, "& .MuiSlider-track": { color: "#4318FF" }, "& .MuiSlider-rail": { color: "rgba(43,54,116,0.1)" } } } },
    }
});

export default theme;
