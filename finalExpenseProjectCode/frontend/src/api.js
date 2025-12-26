
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

/**
 * Helper: build axios auth headers object or empty object
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("userToken");
  if (!token) return {};
  return { headers: { Authorization: `Bearer ${token}` } };
};

/* -------------------- Auth -------------------- */

export const loginUser = async (username, password) => {
  const resp = await axios.post(`${API_BASE_URL}/login`, { username, password });
  return resp.data;
};

export const signupUser = async (username, email, password, role = "USER") => {
  const resp = await axios.post(`${API_BASE_URL}/signup`, { username, email, password, role });
  return resp.data;
};

export const getProfile = async () => {
  const resp = await axios.get(`${API_BASE_URL}/profile`, getAuthHeaders());
  return resp.data;
};

/* -------------------- Budgets / Goals -------------------- */
export const fetchBudgets = async () => {
  const resp = await axios.get(`${API_BASE_URL}/budgets`, getAuthHeaders());
  return resp.data;
};
export const saveBudget = async (budgetData) => {
  if (budgetData.id) return (await axios.put(`${API_BASE_URL}/budgets/${budgetData.id}`, budgetData, getAuthHeaders())).data;
  return (await axios.post(`${API_BASE_URL}/budgets`, budgetData, getAuthHeaders())).data;
};
export const deleteBudget = async (id) => (await axios.delete(`${API_BASE_URL}/budgets/${id}`, getAuthHeaders())).data;

export const fetchGoals = async () => {
  const resp = await axios.get(`${API_BASE_URL}/goals`, getAuthHeaders());
  return resp.data;
};
export const saveGoal = async (goalData) => {
  if (goalData.id) return (await axios.put(`${API_BASE_URL}/goals/${goalData.id}`, goalData, getAuthHeaders())).data;
  return (await axios.post(`${API_BASE_URL}/goals`, goalData, getAuthHeaders())).data;
};
export const deleteGoal = async (id) => (await axios.delete(`${API_BASE_URL}/goals/${id}`, getAuthHeaders())).data;

/* -------------------- Forum -------------------- */
const FORUM_BASE = `${API_BASE_URL}/forum`;
export const fetchPosts = async () => (await axios.get(`${FORUM_BASE}/posts`, getAuthHeaders())).data;
export const createPost = async (content) => (await axios.post(`${FORUM_BASE}/posts`, { content }, getAuthHeaders())).data;
export const likePost = async (postId) => (await axios.post(`${FORUM_BASE}/posts/${postId}/like`, null, getAuthHeaders())).data;
export const fetchComments = async (postId) => (await axios.get(`${FORUM_BASE}/posts/${postId}/comments`, getAuthHeaders())).data;
export const createComment = async (postId, content) => (await axios.post(`${FORUM_BASE}/posts/${postId}/comments`, { content }, getAuthHeaders())).data;

/* -------------------- Exports (CSV/PDF) -------------------- */
const EXPORT_BASE = `${API_BASE_URL}/export`;
export const exportToCsv = async () => {
  const headers = getAuthHeaders();
  if (!headers.headers) throw new Error("Authentication required");
  const resp = await axios.get(`${EXPORT_BASE}/csv`, { ...headers, responseType: "blob" });
  return resp.data;
};
export const exportToPdf = async () => {
  const headers = getAuthHeaders();
  if (!headers.headers) throw new Error("Authentication required");
  const resp = await axios.get(`${EXPORT_BASE}/pdf`, { ...headers, responseType: "blob" });
  return resp.data;
};

/* -------------------- ADMIN endpoints (explicit named exports) -------------------- */

/**
 * Fetch all users (admin only)
 * Accepts filter object: { search: string, role: "ALL"|"ADMIN"|"USER"|"BANNED" }
 */
export const fetchAllUsers = async ({ search = "", role = "ALL", page = 0, size = 200 } = {}) => {
  const headers = getAuthHeaders();
  const params = {};
  if (search) params.search = search;
  if (role && role !== "ALL") params.role = role;
  // optional pagination parameters (server may ignore)
  params.page = page;
  params.size = size;

  const resp = await axios.get(`${API_BASE_URL}/admin/users`, { ...headers, params });
  return resp.data;
};

/**
 * Fetch transactions for a single user (admin)
 */
export const fetchUserTransactions = async (userId) => {
  if (!userId) return [];
  const resp = await axios.get(`${API_BASE_URL}/admin/users/${userId}/transactions`, getAuthHeaders());
  return resp.data;
};

/**
 * Change user role (body: { role: "ADMIN" | "USER" })
 */
export const changeUserRole = async (userId, role) => {
  if (!userId) throw new Error("Missing userId");
  const resp = await axios.put(`${API_BASE_URL}/admin/users/${userId}/role`, { role }, getAuthHeaders());
  return resp.data;
};

/**
 * Ban/unban a user - server endpoint accepts { banned: true|false }
 */
export const setUserBanned = async (userId, banned = true) => {
  if (!userId) throw new Error("Missing userId");
  const resp = await axios.put(`${API_BASE_URL}/admin/users/${userId}/banned`, { banned }, getAuthHeaders());
  return resp.data;
};

/**
 * Export user's transactions (CSV blob)
 */
export const exportUserTransactionsCsv = async (userId) => {
  if (!userId) throw new Error("Missing userId");
  const headers = getAuthHeaders();
  if (!headers.headers) throw new Error("Authentication required");
  const resp = await axios.get(`${API_BASE_URL}/admin/users/${userId}/transactions/export/csv`, {
    ...headers,
    responseType: "blob"
  });
  return resp.data;
};

/* -------------------- default export (optional) -------------------- */
const api = {
  loginUser,
  signupUser,
  getProfile,
  fetchBudgets,
  saveBudget,
  deleteBudget,
  fetchGoals,
  saveGoal,
  deleteGoal,
  fetchPosts,
  createPost,
  likePost,
  fetchComments,
  createComment,
  exportToCsv,
  exportToPdf,
  fetchAllUsers,
  fetchUserTransactions,
  changeUserRole,
  setUserBanned,
  exportUserTransactionsCsv,
};

export default api;
