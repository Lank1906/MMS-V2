import axios from 'axios';

const API_URL = 'https://ho-ng-b-i-1.paiza-user-free.cloud:5000/api/properties';

// Lấy token trực tiếp từ localStorage, thêm Bearer
const getToken = () => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Token không tồn tại hoặc đã hết hạn');
  return `Bearer ${token}`;
};

// Lấy danh sách cụm nhà trọ, phân trang, tìm kiếm
export const getProperties = async (page = 1, limit = 10, search = '') => {
  const res = await axios.get(API_URL, {
    headers: { Authorization: getToken() },
    params: { page, limit, search }
  });
  return res.data;
};

// Lấy chi tiết cụm nhà trọ theo ID
export const getPropertyById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: getToken() }
  });
  return res.data;
};

// Thêm cụm nhà trọ mới
export const createProperty = async (data) => {
  const res = await axios.post(API_URL, data, {
    headers: { Authorization: getToken() }
  });
  return res.data;
};

// Cập nhật cụm nhà trọ
export const updateProperty = async (id, data) => {
  const res = await axios.put(`${API_URL}/${id}`, data, {
    headers: { Authorization: getToken() }
  });
  return res.data;
};

// Xóa cụm nhà trọ (update is_active = false)
export const deleteProperty = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: getToken() }
  });
  return res.data;
};
