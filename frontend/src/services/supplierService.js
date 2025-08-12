// src/api/supplierService.js
import axiosInstance from './index';

// 取得所有供應商
export const fetchSuppliers = async () => {
  const res = await axiosInstance.get('/suppliers');
  return res.data;
};

// 新增供應商
export const addSupplier = async (supplierData) => {
  const res = await axiosInstance.post('/suppliers', supplierData);
  return res.data;
};
// 修改供應商
export const updateSupplier = async (id, supplierData) => {
  const res = await axiosInstance.put(`/suppliers/${id}`, supplierData);
  return res.data;
};
// 刪除供應商
export const deleteSupplier = async (id) => {
  const res = await axiosInstance.delete(`/suppliers/${id}`);
  return res.data;
};

// 其他 API 也都這樣寫
// export const fetchById = async (id) => apiCall('get', `/suppliers/${id}`);
