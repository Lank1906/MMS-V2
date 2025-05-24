import axios from 'axios';

const API_URL = 'https://ho-ng-b-i-1.paiza-user-free.cloud:5000/api/contracts';

const getToken = () => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Token không tồn tại hoặc đã hết hạn');
  return `Bearer ${token}`;
};

// Lấy danh sách hợp đồng theo roomId
export const getContracts = async (roomId) => {
  const res = await axios.get(API_URL, {
    headers: { Authorization: getToken() },
    params: { roomId }
  });
  return res.data;
};

// Lấy chi tiết hợp đồng
export const getContractById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: getToken() }
  });
  return res.data;
};

// Tạo hợp đồng mới
export const createContract = async (data) => {
  console.log(data)
  const res = await axios.post(API_URL, data, {
    headers: { Authorization: getToken() }
  });
  return res.data;
};

// Cập nhật hợp đồng
export const updateContract = async (id, data) => {
  const res = await axios.put(`${API_URL}/${id}`, data, {
    headers: { Authorization: getToken() }
  });
  return res.data;
};

// Xoá hợp đồng (cập nhật is_active = false hoặc xoá thật tuỳ backend)
export const deleteContract = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: getToken() }
  });
  return res.data;
};
