// frontend/src/services/supplierService.js
import axios from 'axios';

// 允許用環境變數切換 API 網域/埠號
// - CRA: process.env.REACT_APP_API_BASE
// - Vite: import.meta.env.VITE_API_BASE
const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) ||
  process.env.REACT_APP_API_BASE ||
  'http://localhost:8000'; // ← 你的預設 8000，若後端是 8080 就在 .env 改

// 共用 axios instance
const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// REST 的根路徑
const ROOT = '/api/suppliers';

// ===== CRUD =====
export const listSuppliers = (params) =>
  api.get(ROOT, { params }).then((r) => r.data);

export const getSupplier = (id) =>
  api.get(`${ROOT}/${id}`).then((r) => r.data);

export const createSupplier = (dto) =>
  api.post(ROOT, sanitize(dto)).then((r) => r.data);

export const updateSupplier = (id, dto) =>
  api.put(`${ROOT}/${id}`, sanitize(dto)).then((r) => r.data);

export const deleteSupplier = (id) =>
  api.delete(`${ROOT}/${id}`).then(() => null);

// ===== 小工具：把空字串轉成 null，避免後端驗證踩雷 =====
function sanitize(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === '') out[k] = null;
    else out[k] = v;
  }
  return out;
}
