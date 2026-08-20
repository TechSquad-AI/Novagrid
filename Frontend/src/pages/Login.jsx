import React, { useState } from "react";
import { Box, Typography, TextField, Button, Alert } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Login() {
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true); setError("");
        try { await signIn(email, password); navigate("/dashboard"); }
        catch (e) { setError(e.message || "Invalid credentials"); }
        setLoading(false);
    };

    return (
        <Box sx={{ minHeight: "100vh", background: "#f0f2f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Box sx={{ background: "#fff", borderRadius: 3, p: 4, width: 420, border: "1px solid #e5e7eb", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                    <Box sx={{ textAlign: "center", mb: 3 }}>
                        <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: "linear-gradient(135deg, #1a73e8, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.5 }}>
                            <Box sx={{ width: 24, height: 24, borderRadius: 1, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
                            </Box>
                        </Box>
                        <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#1a1f36" }}>Welcome Back</Typography>
                        <Typography sx={{ color: "#6b7280", fontSize: 14 }}>Sign in to NovaGrid API Guardian</Typography>
                    </Box>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <TextField fullWidth label="Email" value={email} onChange={e => setEmail(e.target.value)} size="small" sx={{ mb: 2 }} />
                    <TextField fullWidth label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} size="small" sx={{ mb: 2.5 }} />
                    <Button fullWidth variant="contained" onClick={handleLogin} disabled={loading} sx={{ py: 1.2, fontSize: 14, fontWeight: 700 }}>
                        {loading ? "Signing in..." : "Sign In"}
                    </Button>
                    <Typography sx={{ textAlign: "center", mt: 2, color: "#6b7280", fontSize: 13 }}>
                        Don't have an account? <Button size="small" onClick={() => navigate("/signup")} sx={{ textTransform: "none", color: "#1a73e8", fontWeight: 600 }}>Sign Up</Button>
                    </Typography>
                </Box>
            </motion.div>
        </Box>
    );
}
export default Login;
