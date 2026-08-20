import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "light",
        background: { default: "#f8f9fb", paper: "#ffffff" },
        primary: { main: "#1a73e8" },
        secondary: { main: "#7551FF" },
        success: { main: "#0d9488" },
        error: { main: "#dc2626" },
        warning: { main: "#f59e0b" },
        info: { main: "#1a73e8" },
        text: { primary: "#1a1f36", secondary: "#6b7280" },
    },
    shape: { borderRadius: 12 },
    typography: {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    background: "#f8f9fb",
                    color: "#1a1f36",
                    minHeight: "100vh",
                },
                "::-webkit-scrollbar": { width: 6 },
                "::-webkit-scrollbar-track": { background: "transparent" },
                "::-webkit-scrollbar-thumb": { background: "rgba(0,0,0,0.15)", borderRadius: 3 },
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: 13,
                    boxShadow: "none",
                },
                contained: {
                    background: "#1a73e8",
                    color: "#fff",
                    "&:hover": { background: "#1557b0", boxShadow: "0 2px 8px rgba(26,115,232,0.3)" }
                },
                outlined: {
                    borderColor: "#d1d5db",
                    color: "#374151",
                    "&:hover": { borderColor: "#1a73e8", background: "rgba(26,115,232,0.04)", color: "#1a73e8" }
                },
                text: {
                    color: "#1a73e8",
                    "&:hover": { background: "rgba(26,115,232,0.04)" }
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: 11,
                    background: "#f3f4f6",
                    color: "#6b7280",
                    border: "1px solid #e5e7eb",
                }
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
                        "&.Mui-focused fieldset": { borderColor: "#1a73e8" }
                    },
                    "& .MuiInputLabel-root": { color: "#6b7280" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#1a73e8" },
                    "& .MuiInputBase-input": { color: "#1a1f36" }
                }
            }
        },
        MuiSelect: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    "& .MuiSelect-select": {
                        background: "#fff",
                        color: "#1a1f36",
                        padding: "10px 14px",
                        borderRadius: 8,
                    },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#d1d5db" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1a73e8" },
                    "& .MuiSvgIcon-root": { color: "#9ca3af" }
                }
            }
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    background: "#ffffff !important",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                    marginTop: 4,
                    maxHeight: 300,
                }
            }
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    color: "#374151",
                    fontSize: 13,
                    padding: "8px 16px",
                    "&:hover": { background: "#f3f4f6 !important" },
                    "&.Mui-selected": { background: "rgba(26,115,232,0.08) !important", color: "#1a73e8" },
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                root: { color: "#374151", fontSize: 13, borderBottom: "1px solid #f3f4f6", padding: "10px 14px" },
                head: { color: "#6b7280", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }
            }
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: { borderRadius: 4, background: "#e5e7eb" },
                bar: { background: "#1a73e8" }
            }
        },
        MuiAlert: {
            styleOverrides: { root: { borderRadius: 8 } }
        },
        MuiDivider: {
            styleOverrides: { root: { borderColor: "#e5e7eb" } }
        },
    }
});

export default theme;
