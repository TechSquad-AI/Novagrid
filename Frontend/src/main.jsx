import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";
import { SidebarProvider } from "./context/SidebarContext";

ReactDOM.createRoot(document.getElementById("root")).render(
    <ThemeProvider>
        <SidebarProvider>
            <App />
        </SidebarProvider>
    </ThemeProvider>
);
