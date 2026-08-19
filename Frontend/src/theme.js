import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "dark",
        background: { default: "#0a0a0f", paper: "rgba(255,255,255,0.04)" },
        primary: { main: "#f5a623" },
        secondary: { main: "#ef4444" },
        success: { main: "#22c55e" },
        error: { main: "#ef4444" },
        warning: { main: "#f5a623" },
        info: { main: "#3b82f6" },
    },
    shape: { borderRadius: 12 },
    typography: {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        h4: { fontWeight: 800, letterSpacing: "-0.02em", color: "#fff" },
        h5: { fontWeight: 800, color: "#fff" },
        h6: { fontWeight: 700, color: "#fff" },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    background: "#0a0a0f",
                    color: "#e0e0e0",
                    minHeight: "100vh",
                },
                "::-webkit-scrollbar": { width: 6 },
                "::-webkit-scrollbar-track": { background: "transparent" },
                "::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.1)", borderRadius: 3 },
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 12,
                    boxShadow: "none",
                    overflow: "visible",
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    textTransform: "none",
                    fontWeight: 700,
                    padding: "11px 24px",
                    fontSize: 14,
                    boxShadow: "none",
                    transition: "all 0.15s",
                },
                contained: {
                    background: "linear-gradient(135deg, #f5a623, #e8941a)",
                    color: "#0a0a0f",
                    "&:hover": { background: "linear-gradient(135deg, #e8941a, #d4860f)", boxShadow: "0 2px 12px rgba(245,166,35,0.2)" }
                },
                outlined: {
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.5)",
                    "&:hover": { borderColor: "rgba(245,166,35,0.4)", background: "rgba(245,166,35,0.06)", color: "#fff" }
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: 12,
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    "&.MuiChip-colorSuccess": { background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.15)" },
                    "&.MuiChip-colorError": { background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.15)" },
                    "&.MuiChip-colorWarning": { background: "rgba(245,166,35,0.1)", color: "#f5a623", border: "1px solid rgba(245,166,35,0.15)" },
                    "&.MuiChip-colorInfo": { background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.15)" },
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.04)",
                        "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
                        "&:hover fieldset": { borderColor: "rgba(245,166,35,0.3)" },
                        "&.Mui-focused fieldset": { borderColor: "#f5a623" }
                    },
                    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.35)" },
                    "& .MuiInputBase-input": { color: "#fff" }
                }
            }
        },
        MuiSelect: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    "& .MuiSelect-select": {
                        background: "rgba(255,255,255,0.04)",
                        color: "#fff",
                        padding: "11px 14px",
                        borderRadius: 10,
                    },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.08)" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(245,166,35,0.3)" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#f5a623" },
                    "& .MuiSvgIcon-root": { color: "rgba(255,255,255,0.3)" }
                }
            }
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    background: "rgba(15,15,25,0.98) !important",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                    marginTop: 4,
                    maxHeight: 300,
                }
            }
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 14,
                    padding: "10px 16px",
                    "&:hover": { background: "rgba(245,166,35,0.08) !important" },
                    "&.Mui-selected": { background: "rgba(245,166,35,0.12) !important", color: "#f5a623" },
                }
            }
        },
        MuiTab: {
            styleOverrides: {
                root: { textTransform: "none", fontWeight: 600, color: "rgba(255,255,255,0.3)", "&.Mui-selected": { color: "#f5a623" } }
            }
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: { borderRadius: 2, background: "rgba(255,255,255,0.04)" },
                bar: { background: "linear-gradient(90deg, #f5a623, #e8941a)" }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                root: { color: "rgba(255,255,255,0.5)", fontSize: 13, borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "10px 14px" },
                head: { color: "rgba(255,255,255,0.3)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }
            }
        },
        MuiAlert: {
            styleOverrides: { root: { borderRadius: 10 } }
        },
        MuiDivider: {
            styleOverrides: { root: { borderColor: "rgba(255,255,255,0.04)" } }
        },
        MuiSwitch: {
            styleOverrides: {
                root: { "& .MuiSwitch-switchBase.Mui-checked": { color: "#f5a623" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "rgba(245,166,35,0.3)" } }
            }
        },
        MuiSlider: {
            styleOverrides: {
                root: { "& .MuiSlider-thumb": { color: "#f5a623" }, "& .MuiSlider-track": { color: "#f5a623" }, "& .MuiSlider-rail": { color: "rgba(255,255,255,0.08)" } }
            }
        },
    }
});

export default theme;
