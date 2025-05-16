import axios from 'axios';

const API_URL = 'https://ho-ng-b-i-1.paiza-user-free.cloud:5000/api/roomtypes';

// Hàm lấy token từ localStorage và thêm 'Bearer '
const getToken = () => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Token không tồn tại hoặc đã hết hạn');
  return `Bearer ${token}`;
};

// Lấy danh sách RoomTypes có phân trang, tìm kiếm theo tên
export const getRoomTypes = async (page = 1, limit = 15, search = '') => {
  const res = await axios.get(API_URL, {
    headers: { Authorization: getToken() },
    params: { page, limit, search },
  });
  return res.data;
};

// Lấy chi tiết RoomType theo ID
export const getRoomTypeById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: getToken() },
  });
  return res.data;
};

// Tạo mới RoomType
export const createRoomType = async (data) => {
  const res = await axios.post(API_URL, data, {
    headers: { Authorization: getToken() },
  });
  return res.data;
};

// Cập nhật RoomType
export const updateRoomType = async (id, data) => {
  const res = await axios.put(`${API_URL}/${id}`, data, {
    headers: { Authorization: getToken() },
  });
  return res.data;
};

// Xóa RoomType (đánh dấu inactive)
export const deleteRoomType = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: getToken() },
  });
  return res.data;
};
