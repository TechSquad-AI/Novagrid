import api from "./axios";

// ============================================================
// AUTH
// ============================================================

export const signup = async (email, password) => {
    const response = await api.post("/auth/signup", { email, password });
    return response.data;
};

export const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
};

export const logout = async () => {
    const response = await api.post("/auth/logout");
    return response.data;
};

// ============================================================
// ENDPOINT TREE
// ============================================================

export const scanEndpoints = async () => {
    const response = await api.get("/tree/scan");
    return response.data;
};

export const scanAndStore = async () => {
    const response = await api.post("/tree/scan-and-store");
    return response.data;
};

export const getLatestManifest = async () => {
    const response = await api.get("/tree/manifest");
    return response.data;
};

export const listManifests = async () => {
    const response = await api.get("/tree/manifests");
    return response.data;
};

export const diffWithPrevious = async () => {
    const response = await api.post("/tree/diff");
    return response.data;
};

export const validateEndpoints = async () => {
    const response = await api.get("/tree/validate");
    return response.data;
};

export const getChangeReports = async () => {
    const response = await api.get("/tree/reports");
    return response.data;
};

export const getAllReports = async () => {
    const response = await api.get("/tree/reports/all");
    return response.data;
};

export const approveChange = async (reportId) => {
    const response = await api.post(`/tree/approve/${reportId}`);
    return response.data;
};

export const rejectChange = async (reportId) => {
    const response = await api.post(`/tree/reject/${reportId}`);
    return response.data;
};

export const getTreeData = async () => {
    const response = await api.get("/tree/tree-data");
    return response.data;
};

// ============================================================
// PUBLIC APIs
// ============================================================

export const registerPublicAPI = async (name, url, openapiUrl) => {
    const response = await api.post("/public-apis/register", { name, url, openapi_url: openapiUrl });
    return response.data;
};

export const listPublicAPIs = async () => {
    const response = await api.get("/public-apis");
    return response.data;
};

export const getPublicAPI = async (apiId) => {
    const response = await api.get(`/public-apis/${apiId}`);
    return response.data;
};

export const getPublicAPITree = async (apiId) => {
    const response = await api.get(`/public-apis/${apiId}/tree`);
    return response.data;
};

export const checkPublicAPI = async (apiId) => {
    const response = await api.post(`/public-apis/${apiId}/check`);
    return response.data;
};

export const checkAllPublicAPIs = async () => {
    const response = await api.post("/public-apis/check-all");
    return response.data;
};

export const getPublicAPIChanges = async (apiId) => {
    const response = await api.get(`/public-apis/${apiId}/changes`);
    return response.data;
};

export const deletePublicAPI = async (apiId) => {
    const response = await api.delete(`/public-apis/${apiId}`);
    return response.data;
};

// ============================================================
// ANALYZE / CHECK
// ============================================================

export const getPublicAPICheck = async (apiId) => {
    const response = await api.post(`/public-apis/${apiId}/check`);
    return response.data;
};

// ============================================================
// AI FIX
// ============================================================

export const runAiFix = async (apiName) => {
    const response = await api.post("/ai-fix/run", { api_name: apiName });
    return response.data;
};

export const applyFix = async (fixId) => {
    const response = await api.post(`/ai-fix/${fixId}/apply`);
    return response.data;
};

export const rejectFix = async (fixId) => {
    const response = await api.post(`/ai-fix/${fixId}/reject`);
    return response.data;
};

// ============================================================
// BUG EXPLAINER
// ============================================================

export const analyzeLogs = async (logs) => {
    const response = await api.post("/bug-explainer/analyze", { logs });
    return response.data;
};

// ============================================================
// GITHUB REPOS
// ============================================================

export const registerGitHubRepo = async (name, repoUrl) => {
    const response = await api.post("/github-repos/register", { name, repo_url: repoUrl });
    return response.data;
};

export const listGitHubRepos = async () => {
    const response = await api.get("/github-repos");
    return response.data;
};

export const getGitHubRepoTree = async (repoId) => {
    const response = await api.get(`/github-repos/${repoId}/tree`);
    return response.data;
};

export const checkGitHubRepo = async (repoId) => {
    const response = await api.post(`/github-repos/${repoId}/check`);
    return response.data;
};

export const deleteGitHubRepo = async (repoId) => {
    const response = await api.delete(`/github-repos/${repoId}`);
    return response.data;
};
