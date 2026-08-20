import { createTheme } from "@mui/material/styles";

const themeLight = createTheme({
    palette: {
        mode: "light",
        background: { default: "#f0f2f5", paper: "#ffffff" },
        primary: { main: "#1a73e8" },
        text: { primary: "#1a1f36", secondary: "#5f6368" },
    },
    shape: { borderRadius: 12 },
    typography: {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        h4: { fontWeight: 700, fontSize: 24 },
    },
    components: {
        MuiCssBaseline: { styleOverrides: { body: { background: "#f0f2f5" } } },
        MuiButton: { styleOverrides: { root: { borderRadius: 8, textTransform: "none", fontWeight: 600 } } },
        MuiChip: { styleOverrides: { root: { borderRadius: 6, fontWeight: 600, fontSize: 12 } } },
        MuiTableCell: {
            styleOverrides: {
                root: { fontSize: 13, borderBottom: "1px solid #f3f4f6" },
                head: { color: "#6b7280", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" },
            }
        },
    }
});

export default themeLight;
