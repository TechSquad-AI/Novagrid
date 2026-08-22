import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NAV = [
    { label: "Dashboard", path: "/dashboard", icon: "\u25A3" },
    { label: "Public APIs", path: "/public-apis", icon: "\u25C7" },
    { label: "Impact Analysis", path: "/impact", icon: "\u2261" },
    { label: "Human Validation", path: "/human-validation", icon: "\u2714" },
    { label: "History", path: "/history", icon: "\u29D6" },
    { label: "Settings", path: "/settings", icon: "\u2699" },
];

export default function Sidebar() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const logout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div style={{
            width: collapsed ? 60 : 230,
            minWidth: collapsed ? 60 : 230,
            height: "100vh",
            background: "#0f1629",
            display: "flex",
            flexDirection: "column",
            transition: "all 0.2s ease",
            overflow: "hidden",
            flexShrink: 0,
            borderRight: "1px solid rgba(255,255,255,0.08)",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}>
            <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: collapsed ? "16px 0" : "16px 20px",
                justifyContent: collapsed ? "center" : "flex-start",
            }}>
                <div onClick={() => setCollapsed(!collapsed)} style={{
                    width: 36, height: 36, borderRadius: 8, cursor: "pointer",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                    <span style={{ fontSize: 16, fontWeight: 900, color: "#fff", lineHeight: 1 }}>N</span>
                </div>
                {!collapsed && <span style={{ fontWeight: 800, fontSize: 16, color: "#ffffff", whiteSpace: "nowrap" }}>NovaGrid</span>}
            </div>
            <div style={{ margin: "0 16px", height: 1, background: "rgba(255,255,255,0.1)" }} />
            <div style={{ flex: 1, padding: "12px 0", overflow: "auto" }}>
                {NAV.map(({ label, path, icon }) => {
                    const active = pathname === path;
                    return (
                        <div key={path} onClick={() => navigate(path)} title={collapsed ? label : ""}
                            style={{
                                display: "flex", alignItems: "center", gap: 12,
                                padding: collapsed ? "10px 0" : "10px 20px",
                                margin: collapsed ? "2px 8px" : "2px 8px",
                                borderRadius: 8, cursor: "pointer",
                                background: active ? "rgba(99,102,241,0.2)" : "transparent",
                                justifyContent: collapsed ? "center" : "flex-start",
                            }}
                            onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                            onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                            <span style={{ fontSize: 18, width: 24, textAlign: "center", color: active ? "#a5b4fc" : "rgba(255,255,255,0.55)", flexShrink: 0 }}>{icon}</span>
                            {!collapsed && <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? "#e0e7ff" : "rgba(255,255,255,0.65)", whiteSpace: "nowrap" }}>{label}</span>}
                        </div>
                    );
                })}
            </div>
            <div style={{ margin: "0 16px", height: 1, background: "rgba(255,255,255,0.1)" }} />
            <div onClick={logout} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: collapsed ? "14px 0" : "14px 20px", margin: "8px",
                borderRadius: 8, cursor: "pointer",
                justifyContent: collapsed ? "center" : "flex-start",
            }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                <span style={{ fontSize: 18, color: "rgba(255,255,255,0.45)" }}>\u2190</span>
                {!collapsed && <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.55)" }}>Sign out</span>}
            </div>
        </div>
    );
}
