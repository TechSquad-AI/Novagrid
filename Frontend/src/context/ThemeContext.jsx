import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import darkTheme from "../theme";
import lightTheme from "../themeLight";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [mode, setMode] = useState(() => {
        return localStorage.getItem("novagrid_theme") || "dark";
    });

    // Toggle body class for CSS aurora effects
    useEffect(() => {
        document.body.classList.remove("dark-mode", "light-mode");
        document.body.classList.add(mode === "dark" ? "dark-mode" : "light-mode");
        document.body.style.background = mode === "dark" ? "#080c0a" : "#f0ebe3";
    }, [mode]);

    const toggleTheme = () => {
        const next = mode === "dark" ? "light" : "dark";
        setMode(next);
        localStorage.setItem("novagrid_theme", next);
    };

    const theme = useMemo(() => mode === "dark" ? darkTheme : lightTheme, [mode]);

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme }}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
}

export const useThemeMode = () => useContext(ThemeContext);
