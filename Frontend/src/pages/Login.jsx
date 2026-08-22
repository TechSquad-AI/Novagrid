import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box, Typography, TextField, Button, Alert, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { login } from "../api/services";

export default function Login() {
    const navigate = useNavigate();
    const { saveUser } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const r = await login(email, password);
            if (r.status === "success") {
                saveUser(r.user);
                if (r.session?.access_token) localStorage.setItem("novagrid_token", r.session.access_token);
                navigate("/dashboard");
            } else {
                setError(r.detail || "Login failed");
            }
        } catch (err) {
            setError(err.response?.data?.detail || "Invalid credentials");
        }
        setLoading(false);
    };

    return (
        <Box sx={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, #0B1437 0%, #1a1145 100%)", p: 2,
        }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Box sx={{
                    width: 380, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.06)", borderRadius: 3, p: 4,
                }}>
                    <Box sx={{ textAlign: "center", mb: 3 }}>
                        <Box sx={{
                            width: 40, height: 40, borderRadius: 2, mx: "auto", mb: 1.5,
                            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <Typography sx={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>N</Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>NovaGrid</Typography>
                        <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 12, mt: 0.3 }}>API Guardian</Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5, fontSize: 12 }}>{error}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <TextField fullWidth label="Email" type="email" value={email}
                            onChange={(e) => setEmail(e.target.value)} required size="small"
                            sx={{ mb: 1.5, "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }} />
                        <TextField fullWidth label="Password" type="password" value={password}
                            onChange={(e) => setPassword(e.target.value)} required size="small"
                            sx={{ mb: 2.5, "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }} />
                        <Button fullWidth type="submit" variant="contained" disabled={loading}
                            sx={{
                                py: 1.2, borderRadius: 1.5, fontWeight: 700, fontSize: 13,
                                background: "#6366f1", "&:hover": { background: "#4f46e5" },
                            }}>
                            {loading ? <CircularProgress size={18} color="inherit" /> : "Sign In"}
                        </Button>
                    </form>

                    <Typography sx={{ textAlign: "center", mt: 2.5, color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
                        No account?{" "}
                        <Link to="/signup" style={{ color: "#8b5cf6", textDecoration: "none", fontWeight: 600 }}>Sign Up</Link>
                    </Typography>
                </Box>
            </motion.div>
        </Box>
    );
}
