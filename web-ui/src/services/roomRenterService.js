import axios from 'axios';

const API_URL = 'https://ho-ng-b-i-1.paiza-user-free.cloud:5000/api/room-renter';
const getToken = () => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Token không tồn tại hoặc hết hạn');
  return `Bearer ${token}`;
};

// Lấy danh sách renter của 1 phòng
export const getRoomRentersByRoomId = async (roomId) => {
  const res = await axios.get(`${API_URL}/${roomId}`, {
    headers: { Authorization: getToken() }
  });
  return res.data;
};

// Thêm người thuê vào phòng
export const createRoomRenter = async (roomId, data) => {
  const res = await axios.post(`${API_URL}/${roomId}`, data, {
    headers: { Authorization: getToken() }
  });
  return res.data;
};

// Cập nhật renter sang Left
export const updateRoomRenter = async (roomId, roomRenterId, data) => {
  const res = await axios.put(`${API_URL}/${roomId}/${roomRenterId}`, data, {
    headers: { Authorization: getToken() }
  });
  return res.data;
};

// Xoá người thuê khỏi phòng
export const deleteRoomRenter = async (roomId, roomRenterId) => {
  const res = await axios.delete(`${API_URL}/${roomId}/${roomRenterId}`, {
    headers: { Authorization: getToken() }
  });
  return res.data;
};
