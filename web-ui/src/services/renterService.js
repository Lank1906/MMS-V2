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

export const createPayment = async (amount, orderId, orderInfo, redirectLink) => {
  try {
    const res = await axios.post(`${API_URL}/create-payment`, {
      amount,
      orderId,
      orderInfo,
      redirectLink,
    }, {
      headers: { Authorization: getToken() },
    });
    return res.data;  // trả về payUrl
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

// Hủy hợp đồng
export const cancelContract = async (contractId) => {
  try {
    const res = await axios.put(`${API_URL}/contracts/${contractId}/cancel`, null, {
      headers: { Authorization: getToken() },
    });
    return res.data;
  } catch (error) {
    console.error('Error cancelling contract:', error);
    throw error;
  }
};

export const checkRentCondition = async () => {
  try {
    const res = await axios.get(`${API_URL}/contracts/check-rent`, {
      headers: { Authorization: getToken() },
    });
    return res.data;
  } catch (error) {
    console.error('Error checking rent condition:', error);
    throw error;
  }
};

export const createDepositPayment = async (room_id, rent_price, redirectLink) => {
  const depositAmount = Math.floor(rent_price * 0.3);
  const orderId = `${room_id}-${Date.now()}`;
  const orderInfo = `Đặt cọc thuê phòng ${room_id}`;

  const res = await axios.post(`${API_URL}/create-payment`, {
    amount: depositAmount,
    orderId,
    orderInfo,
    redirectLink,
    extraData: {
      room_id,
      rent_price,
      type: 'deposit',
      redirectLink
    }
  }, {
    headers: { Authorization: getToken() }
  });

  return res.data; // payUrl
};

export const mockPayment = async ({ orderId, amount, type, room_id, rent_price,months, redirectLink }) => {
  try {
    const res = await axios.post(`${API_URL}/mock-payment`, {
      orderId,
      amount,
      type,
      room_id,
      rent_price,
      months,
      redirectLink
    }, {
      headers: { Authorization: getToken() },
    });

    return res.data;
  } catch (error) {
    console.error('Error mocking payment:', error);
    throw error;
  }
};

export const simulatePayment = async (contractId) => {
  try {
    const res = await axios.put(`${API_URL}/contracts/${contractId}/simulate-payment`, null, {
      headers: { Authorization: getToken() }
    });
    return res.data;
  } catch (error) {
    console.error('Error simulating payment:', error);
    throw error;
  }
};

// ✅ Lấy danh sách bills theo contractId
export const getBillsByContractId = async (contractId) => {
  try {
    const res = await axios.get(`${API_URL}/bills`, {
      headers: { Authorization: getToken() },
      params: { contractId }
    });
    return res.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách hóa đơn:', error);
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
  createPayment,
  cancelContract,
  checkRentCondition,
  createDepositPayment,
  mockPayment,
  simulatePayment,
  getBillsByContractId
};
