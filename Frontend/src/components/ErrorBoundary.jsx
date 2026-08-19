import React from "react";
import { Box, Typography, Button } from "@mui/material";


class ErrorBoundary extends React.Component {


    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }


    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }


    componentDidCatch(error, errorInfo) {
        console.error("Component Error:", error, errorInfo);
    }


    render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        minHeight: "100vh",
                        background: "#0B1220",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        p: 3
                    }}
                >
                    <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
                        Something went wrong
                    </Typography>
                    <Typography sx={{ color: "#94A3B8", mb: 3 }}>
                        {this.state.error?.message || "An unexpected error occurred"}
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => {
                            this.setState({ hasError: false, error: null });
                            window.location.reload();
                        }}
                        sx={{ background: "#2563EB" }}
                    >
                        Reload Page
                    </Button>
                </Box>
            );
        }


        return this.props.children;
    }
}


export default ErrorBoundary;
