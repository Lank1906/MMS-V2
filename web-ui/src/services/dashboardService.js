import axios from 'axios';

// Định nghĩa URL API chung cho Dashboard
const API_URL = 'https://ho-ng-b-i-1.paiza-user-free.cloud:5000/api/dashboard';

// Lấy token từ localStorage
const getToken = () => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Token không tồn tại hoặc hết hạn');
  return `Bearer ${token}`;
};

// API để lấy dữ liệu tổng quan Dashboard cho Admin
export const getDashboardData = async () => {
  try {
    const res = await axios.get(`${API_URL}`, {
      headers: { Authorization: getToken() }
    });
    return res.data;  // Trả về role và data của Dashboard
  } catch (error) {
    throw new Error('Không thể tải dữ liệu dashboard');
  }
};

// API để lấy doanh thu của từng Landlord
export const getLandlordRevenue = async () => {
  try {
    const res = await axios.get(`${API_URL}/landlord-revenue`, {
      headers: { Authorization: getToken() }
    });
    return res.data;  // Trả về dữ liệu doanh thu từng Landlord
  } catch (error) {
    throw new Error('Không thể tải dữ liệu doanh thu Landlord');
  }
};

// API để lấy doanh thu theo ngày cho từng Renter
export const getRenterRevenue = async () => {
  try {
    const res = await axios.get(`${API_URL}/renter-revenue`, {
      headers: { Authorization: getToken() }
    });
    return res.data;  // Trả về dữ liệu doanh thu từng Renter
  } catch (error) {
    throw new Error('Không thể tải dữ liệu doanh thu Renter');
  }
};

export default { getDashboardData, getLandlordRevenue, getRenterRevenue };
