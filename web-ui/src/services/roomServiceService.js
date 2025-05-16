import axios from 'axios';

const API_URL = 'https://ho-ng-b-i-1.paiza-user-free.cloud:5000/api/room-services';

const getToken = () => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Token không tồn tại hoặc đã hết hạn');
  return `Bearer ${token}`;
};

// Lấy danh sách dịch vụ theo roomId
export const getRoomServices = async (roomId) => {
  const res = await axios.get(API_URL, {
    headers: { Authorization: getToken() },
    params: { roomId }
  });
  return res.data;
};

// Thêm dịch vụ phòng mới
export const createRoomService = async (data) => {
  const res = await axios.post(API_URL, data, {
    headers: { Authorization: getToken() }
  });
  return res.data;
};

// Xoá dịch vụ phòng (truyền roomId & serviceId)
export const deleteRoomService = async (roomId, serviceId) => {
  const res = await axios.delete(API_URL, {
    headers: { Authorization: getToken() },
    params: { roomId, serviceId }
  });
  return res.data;
};
