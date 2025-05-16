import axios from 'axios';

const API_URL = 'https://ho-ng-b-i-1.paiza-user-free.cloud:5000/api/rooms';

const getToken = () => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Token không tồn tại hoặc hết hạn');
  return `Bearer ${token}`;
};

export const getRooms = async (filters) => {
  const { page = 1, limit = 10, search = '', propertyId, status, priceMin, priceMax } = filters;
  const res = await axios.get(API_URL, {
    headers: { Authorization: getToken() },
    params: { page, limit, search, propertyId, status, priceMin, priceMax }
  });
  return res.data;
};

export const createRoom = async (data) => {
  const res = await axios.post(API_URL, data, { headers: { Authorization: getToken() } });
  return res.data;
};

export const updateRoom = async (id, data) => {
  const res = await axios.put(`${API_URL}/${id}`, data, { headers: { Authorization: getToken() } });
  return res.data;
};

export const deleteRoom = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: getToken() } });
  return res.data;
};
