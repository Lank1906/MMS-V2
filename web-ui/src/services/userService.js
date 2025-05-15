import axios from 'axios';

const API_URL = 'https://ho-ng-b-i-1.paiza-user-free.cloud:5000/api/users';

// Lấy token trực tiếp từ localStorage
const getToken = () => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Token không tồn tại hoặc đã hết hạn');
  return `Bearer ${token}`;
};

// Lấy danh sách users
export const getUsers = async (page, limit, search) => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: getToken() },
    params: { page, limit, search }
  });
  return response.data;
};

// Cập nhật role
export const updateUserRole = async (id, role) => {
  const response = await axios.patch(`${API_URL}/${id}/role`, { role }, {
    headers: { Authorization: getToken() }
  });
  return response.data;
};

// Xóa user
export const deleteUser = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: getToken() }
  });
  return response.data;
};
