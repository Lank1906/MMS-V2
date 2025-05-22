import axios from 'axios';

const API_URL = 'https://ho-ng-b-i-1.paiza-user-free.cloud:5000/api/services';

// Lấy token từ localStorage
const getToken = () => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Token không tồn tại hoặc đã hết hạn');
  return `Bearer ${token}`;
};

// Lấy danh sách dịch vụ, phân trang, tìm kiếm theo tên
export const getServices = async (page = 1, limit = 10, search = '') => {
  const res = await axios.get(API_URL+`?page=${page}&limit=${limit}&search=${search}`, {
    headers: { Authorization: getToken() },
    params: { page, limit, search }
  });
  return res.data;
};

// Lấy chi tiết dịch vụ theo ID
export const getServiceById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: getToken() }
  });
  return res.data;
};

// Thêm dịch vụ mới
export const createService = async (data) => {
  const res = await axios.post(API_URL, data, {
    headers: { Authorization: getToken() }
  });
  return res.data;
};

// Cập nhật dịch vụ
export const updateService = async (id, data) => {
  const res = await axios.put(`${API_URL}/${id}`, data, {
    headers: { Authorization: getToken() }
  });
  return res.data;
};

// Xóa dịch vụ (update is_active = false)
export const deleteService = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: getToken() }
  });
  return res.data;
};
