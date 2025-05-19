import axios from 'axios';

const API_URL = 'https://ho-ng-b-i-1.paiza-user-free.cloud:5000/api/renter';

// Lấy token trực tiếp từ localStorage, thêm Bearer
const getToken = () => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Token không tồn tại hoặc đã hết hạn');
  return `Bearer ${token}`;
};

// Lấy danh sách phòng trống, filter theo địa chỉ, giá, phân trang
export const getAvailableRooms = async (filters = {}) => {
  // filters = { address, minPrice, maxPrice, page, limit }
  try {
    const res = await axios.get(`${API_URL}/rooms/available`, {
      headers: { Authorization: getToken() },
      params: filters,
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    throw error;
  }
};

// Lấy chi tiết phòng theo ID
export const getRoomById = async (roomId) => {
  try {
    const res = await axios.get(`${API_URL}/rooms/${roomId}`, {
      headers: { Authorization: getToken() },
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching room details:', error);
    throw error;
  }
};

// Lấy hợp đồng active của user
export const getActiveContracts = async () => {
  try {
    const res = await axios.get(`${API_URL}/contracts/active`, {
      headers: { Authorization: getToken() },
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching active contracts:', error);
    throw error;
  }
};

// Thuê phòng (tạo hợp đồng)
export const rentRoom = async (data) => {
  // data = { room_id, rent_price }
  try {
    const res = await axios.post(`${API_URL}/contracts/rent`, data, {
      headers: { Authorization: getToken() },
    });
    return res.data;
  } catch (error) {
    console.error('Error renting room:', error);
    throw error;
  }
};

// Trả phòng (update hợp đồng)
export const leaveRoom = async (contractId) => {
  try {
    const res = await axios.put(`${API_URL}/contracts/leave/${contractId}`, null, {
      headers: { Authorization: getToken() },
    });
    return res.data;
  } catch (error) {
    console.error('Error leaving room:', error);
    throw error;
  }
};

// Lấy thông tin profile user
export const getProfile = async () => {
  try {
    const res = await axios.get(`${API_URL}/profile`, {
      headers: { Authorization: getToken() },
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Cập nhật profile user
export const updateProfile = async (data) => {
  try {
    const res = await axios.put(`${API_URL}/profile`, data, {
      headers: { Authorization: getToken() },
    });
    return res.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const createPayment = async (amount, orderId, orderInfo, redirectUrl, ipnUrl) => {
  try {
    const res = await axios.post(`${API_URL}/create-payment`, {
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
    }, {
      headers: { Authorization: getToken() },
    });
    return res.data;  // trả về payUrl
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

export default {
  getAvailableRooms,
  getRoomById,
  getActiveContracts,
  rentRoom,
  leaveRoom,
  getProfile,
  updateProfile,
  createPayment
};
