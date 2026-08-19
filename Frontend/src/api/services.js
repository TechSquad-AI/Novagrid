import api from "./axios";

// ============================================================
// API REGISTRATION
// ============================================================

export const registerAPI = async (name, url) => {
    const response = await api.post("/apis", { name, url });
    return response.data;
};

export const getAllAPIs = async () => {
    const response = await api.get("/apis");
    return response.data;
};

// ============================================================
// HEALTH CHECK
// ============================================================

export const checkAPIHealth = async (apiId) => {
    const response = await api.get(`/health/${apiId}`);
    return response.data;
};

// ============================================================
// SCAN
// ============================================================

export const scanAPI = async () => {
    const response = await api.post("/scan");
    return response.data;
};

// ============================================================
// HISTORY
// ============================================================

export const getScanHistory = async () => {
    const response = await api.get("/history");
    return response.data;
};

// ============================================================
// REPAIRS
// ============================================================

export const getRepairs = async () => {
    const response = await api.get("/repairs");
    return response.data;
};

export const getRepair = async (repairId) => {
    const response = await api.get(`/repairs/${repairId}`);
    return response.data;
};

export const repairAPI = async (apiId) => {
    const response = await api.post(`/repair/${apiId}`);
    return response.data;
};

// ============================================================
// APPROVALS
// ============================================================

export const getPendingApprovals = async () => {
    const response = await api.get("/approvals");
    return response.data;
};

export const approveRepair = async (approvalId) => {
    const response = await api.post(`/approvals/${approvalId}/approve`);
    return response.data;
};

export const rejectRepair = async (approvalId) => {
    const response = await api.post(`/approvals/${approvalId}/reject`);
    return response.data;
};

// ============================================================
// VERSION TRACKING
// ============================================================

export const createAPIVersion = async (apiId) => {
    const response = await api.post(`/apis/${apiId}/version`);
    return response.data;
};

// ============================================================
// MONITORING
// ============================================================

export const monitorAPI = async (apiId) => {
    const response = await api.post(`/apis/${apiId}/monitor`);
    return response.data;
};

// ============================================================
// STATUS
// ============================================================

export const getAPIStatus = async () => {
    const response = await api.get("/status");
    return response.data;
};

// ============================================================
// DASHBOARD
// ============================================================

export const getDashboardStats = async () => {
    const response = await api.get("/dashboard/stats");
    return response.data;
};

export const getDashboardChanges = async () => {
    const response = await api.get("/dashboard/changes");
    return response.data;
};

export const getDashboardMonitoring = async () => {
    const response = await api.get("/dashboard/monitoring");
    return response.data;
};

export const getDashboardInsights = async () => {
    const response = await api.get("/dashboard/insights");
    return response.data;
};

// ============================================================
// SETTINGS
// ============================================================

export const getSettings = async () => {
    const response = await api.get("/settings");
    return response.data;
};

export const updateSettings = async (data) => {
    const response = await api.put("/settings", data);
    return response.data;
};

// ============================================================
// DETAILED HISTORY
// ============================================================

export const getDetailedHistory = async () => {
    const response = await api.get("/history");
    return response.data;
};

export const getHistoryVersions = async () => {
    const response = await api.get("/history/versions");
    return response.data;
};

export const getHistoryFixes = async () => {
    const response = await api.get("/history/fixes");
    return response.data;
};

export const getHistoryReviews = async () => {
    const response = await api.get("/history/reviews");
    return response.data;
};

// ============================================================
// IMPACT ANALYSIS
// ============================================================

export const getImpactAnalysis = async (apiId) => {
    const response = await api.get(`/impact/${apiId}`);
    return response.data;
};

export const getDependencies = async (apiId) => {
    const response = await api.get(`/impact/${apiId}/dependencies`);
    return response.data;
};
