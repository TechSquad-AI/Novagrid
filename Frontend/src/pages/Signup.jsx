import React, { useState } from "react";
import { Box, Typography, TextField, Button, Alert } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (password !== confirmPassword) { setError("Passwords don't match"); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
        setLoading(true);
        try { await signup(email, password); navigate("/dashboard"); }
        catch (err) { setError(err.message || "Signup failed"); }
        setLoading(false);
    };

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", justifyContent: "center", alignItems: "center" }}>
            <Box sx={{ width: 400, p: 4, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: "linear-gradient(135deg, #f5a623, #e8941a)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2, fontSize: 20, fontWeight: 900, color: "#0a0a0f" }}>N</Box>
                <Typography variant="h5" sx={{ fontWeight: 800, textAlign: "center", mb: 0.5 }}>Create account</Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.35)", textAlign: "center", fontSize: 14, mb: 3 }}>Get started with NovaGrid</Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <form onSubmit={handleSubmit}>
                    <TextField fullWidth label="Email" value={email} onChange={e => setEmail(e.target.value)} type="email" sx={{ mb: 2 }} />
                    <TextField fullWidth label="Password" value={password} onChange={e => setPassword(e.target.value)} type="password" sx={{ mb: 2 }} />
                    <TextField fullWidth label="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type="password" sx={{ mb: 3 }} />
                    <Button fullWidth variant="contained" type="submit" disabled={loading} sx={{ py: 1.4, fontSize: 15 }}>
                        {loading ? "Creating account…" : "Sign Up"}
                    </Button>
                </form>
                <Typography sx={{ color: "rgba(255,255,255,0.3)", textAlign: "center", mt: 2.5, fontSize: 13 }}>
                    Already have an account? <Link to="/login" style={{ color: "#f5a623", textDecoration: "none", fontWeight: 600 }}>Sign In</Link>
                </Typography>
            </Box>
        </Box>
    );
}
export default Signup;
