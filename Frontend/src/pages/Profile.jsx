import React, { useState, useEffect } from "react";
import { Box, Typography, Avatar, Chip, Divider } from "@mui/material";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../context/SidebarContext";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { getProfile, getProfileActivity } from "../api/services";

function Profile() {
    const { open: sidebarOpen } = useSidebar();
    const sidebarMargin = sidebarOpen ? "250px" : "0px";
    const { user } = useAuth();
    const [profile, setProfile] = useState({});
    const [activity, setActivity] = useState([]);

    useEffect(() => {
        Promise.allSettled([getProfile(), getProfileActivity()]).then(([p, a]) => {
            if (p.status === "fulfilled") setProfile(p.value);
            if (a.status === "fulfilled") setActivity(a.value.activity || []);
        });
    }, []);

    const card = { background: "#fff", borderRadius: 2.5, p: 3, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" };

    return (
        <Box sx={{ display: "flex", height: "100vh", overflowY: "auto", background: "#f0f2f5" }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, ml: sidebarMargin, p: 3, position: "relative", zIndex: 1 }}>
                <Navbar subtitle="Account Settings" title="Profile" />

                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                    <Box sx={{ ...card, textAlign: "center" }}>
                        <Avatar sx={{ width: 80, height: 80, mx: "auto", mb: 2, background: "linear-gradient(135deg, #1a73e8, #7c3aed)", fontSize: 28, fontWeight: 800 }}>
                            {(profile.name || user?.email || "U").charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#1a1f36" }}>{profile.name || "User"}</Typography>
                        <Typography sx={{ color: "#6b7280", fontSize: 13, mb: 1 }}>{user?.email || "—"}</Typography>
                        <Chip label={profile.role || "Admin"} sx={{ background: "rgba(26,115,232,0.1)", color: "#1a73e8", fontWeight: 600 }} />
                        <Divider sx={{ my: 2 }} />
                        {[{ l: "Company", v: profile.company || "—" }, { l: "Joined", v: profile.joined || "—" }].map((item, i) => (
                            <Box key={i} sx={{ display: "flex", justifyContent: "space-between", py: 1, borderBottom: "1px solid #f3f4f6" }}>
                                <Typography sx={{ color: "#6b7280", fontSize: 13 }}>{item.l}</Typography>
                                <Typography sx={{ color: "#1a1f36", fontSize: 13, fontWeight: 500 }}>{item.v}</Typography>
                            </Box>
                        ))}
                    </Box>

                    <Box sx={card}>
                        <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#1a1f36", mb: 2 }}>Recent Activity</Typography>
                        {activity.length === 0 ? (
                            <Typography sx={{ color: "#9ca3af", textAlign: "center", py: 4 }}>No activity yet.</Typography>
                        ) : activity.slice(0, 8).map((a, i) => (
                            <Box key={i} sx={{ display: "flex", gap: 1.5, py: 1.2, borderBottom: "1px solid #f3f4f6" }}>
                                <Box sx={{ width: 28, height: 28, borderRadius: 1.5, background: a.type === "scan" ? "rgba(26,115,232,0.08)" : "rgba(13,148,136,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12 }}>
                                    {a.type === "scan" ? "🔍" : "🔧"}
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1a1f36" }}>{a.title}</Typography>
                                    <Typography sx={{ fontSize: 11, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.detail}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
export default Profile;
