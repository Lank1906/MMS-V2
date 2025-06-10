// services/api.ts (dành cho React Native - Expo)
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

const BASE_URL = 'https://ho-ng-b-i-1.paiza-user-free.cloud:5000/api';
const AUTH_URL = `${BASE_URL}/auth`;
const RENTER_URL = `${BASE_URL}/renter`;

const getToken = async () => {
  const token = await AsyncStorage.getItem('authToken');
  if (!token) throw new Error('Token không tồn tại hoặc đã hết hạn');
  return `Bearer ${token}`;
};

// ------------------------ AUTH ------------------------
export const register = async (username: string, email: string, password: string, phone: string) => {
  const res = await axios.post(`${AUTH_URL}/register`, { username, email, password, phone });
  return res.data;
};

export const login = async (email: string, password: string) => {
  const res = await axios.post(`${AUTH_URL}/login`, { email, password });
  await AsyncStorage.setItem('authToken', res.data.token);

  const decoded: any = jwtDecode(res.data.token);
  await AsyncStorage.setItem('role', decoded.role);
  return res.data;
};

export const logout = async () => {
  await AsyncStorage.removeItem('authToken');
  await AsyncStorage.removeItem('role');
};

export const getCurrentUser = async () => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    const decoded = jwtDecode(token);
    return decoded;
  }
  return null;
};

// ------------------------ RENTER ------------------------
export const getAvailableRooms = async (filters: any = {}) => {
  const token = await getToken();
  const res = await axios.get(`${RENTER_URL}/rooms/available`, {
    headers: { Authorization: token },
    params: filters,
  });
  return res.data;
};

export const getRoomById = async (roomId: string) => {
  const token = await getToken();
  const res = await axios.get(`${RENTER_URL}/rooms/${roomId}`, {
    headers: { Authorization: token },
  });
  return res.data;
};

export const getActiveContracts = async () => {
  const token = await getToken();
  const res = await axios.get(`${RENTER_URL}/contracts/active`, {
    headers: { Authorization: token },
  });
  return res.data;
};

export const rentRoom = async (data: any) => {
  const token = await getToken();
  const res = await axios.post(`${RENTER_URL}/contracts/rent`, data, {
    headers: { Authorization: token },
  });
  return res.data;
};

export const leaveRoom = async (contractId: string) => {
  const token = await getToken();
  const res = await axios.put(`${RENTER_URL}/contracts/leave/${contractId}`, null, {
    headers: { Authorization: token },
  });
  return res.data;
};

export const getProfile = async () => {
  const token = await getToken();
  const res = await axios.get(`${RENTER_URL}/profile`, {
    headers: { Authorization: token },
  });
  return res.data;
};

export const updateProfile = async (data: any) => {
  const token = await getToken();
  const res = await axios.put(`${RENTER_URL}/profile`, data, {
    headers: { Authorization: token },
  });
  return res.data;
};

export const createPayment = async (amount: number, orderId: string, orderInfo: string, redirectLink: string) => {
  const token = await getToken();
  const res = await axios.post(`${RENTER_URL}/create-payment`, {
    amount,
    orderId,
    orderInfo,
    redirectLink,
  }, {
    headers: { Authorization: token },
  });
  return res.data;
};

export const uploadImage = async (file: any) => {
  const token = await getToken();
  const formData = new FormData();
  formData.append('image', file);

  const res = await axios.post(`${BASE_URL}/upload-image`, formData, {
    headers: {
      Authorization: token,
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
};

export const cancelContract = async (contractId: string) => {
  const token = await getToken();
  const res = await axios.put(`${RENTER_URL}/contracts/${contractId}/cancel`, null, {
    headers: { Authorization: token },
  });
  return res.data;
};

export const checkRentCondition = async () => {
  const token = await getToken();
  const res = await axios.get(`${RENTER_URL}/contracts/check-rent`, {
    headers: { Authorization: token },
  });
  return res.data; // { canRent: true/false, reason?: string }
};

export const createDepositPayment = async (room_id: number, rent_price: number, redirectLink: string) => {
  const token = await getToken();
  const amount = Math.floor(rent_price * 0.3); // 30% tiền thuê
  const orderId = `${room_id}-${Date.now()}`;
  const orderInfo = `Đặt cọc thuê phòng ${room_id}`;

  const res = await axios.post(`${RENTER_URL}/create-payment`, {
    amount,
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
    headers: { Authorization: token },
  });

  return res.data; // trả về { payUrl }
};

export const mockPayment = async ({
  orderId,
  amount,
  type,
  room_id,
  rent_price,
  months,
  redirectLink
}: {
  orderId: string;
  amount: number;
  type: string;
  room_id: number;
  rent_price: number;
  months:number;
  redirectLink: string;
}) => {
  const token = await getToken();
  const res = await axios.post(`${RENTER_URL}/mock-payment`, {
    orderId,
    amount,
    type,
    room_id,
    rent_price,
    months,
    redirectLink,
  }, {
    headers: { Authorization: token },
  });

  return res.data;
};

export const simulatePayment = async (contractId: number): Promise<any> => {
  try {
    const token = await getToken(); // <-- CHỖ SỬA
    const res = await axios.put(
      `${RENTER_URL}/contracts/${contractId}/simulate-payment`,
      null,
      {
        headers: { Authorization: token },
      }
    );
    return res.data;
  } catch (error: any) {
    console.error('Error simulating payment:', error.response?.data || error.message);
    throw error;
  }
};

export const getBillsByContractId = async (contractId: number) => {
  const token = await getToken();
  const res = await axios.get(`${RENTER_URL}/bills`, {
    headers: { Authorization: token },
    params: { contractId }
  });
  return res.data;
};

export default {
  login,
  register,
  logout,
  getCurrentUser,
  getAvailableRooms,
  getRoomById,
  getActiveContracts,
  rentRoom,
  leaveRoom,
  getProfile,
  updateProfile,
  createPayment,
  uploadImage,
  cancelContract,
  checkRentCondition,
  createDepositPayment,
  mockPayment,
  simulatePayment,
  getBillsByContractId
};
