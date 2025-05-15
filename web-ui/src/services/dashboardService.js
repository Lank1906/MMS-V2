import axios from 'axios';

// API để lấy dữ liệu tổng quan Dashboard cho Admin
export const getAdminDashboardData = async () => {
  try {
    const response = await axios.get('https://ho-ng-b-i-1.paiza-user-free.cloud:5000/api/dashboard');
    return response.data;
  } catch (error) {
    throw new Error('Không thể tải dữ liệu dashboard');
  }
};
