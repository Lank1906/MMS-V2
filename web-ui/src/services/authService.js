import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Cấu hình URL của API
const API_URL = 'https://ho-ng-b-i-1.paiza-user.cloud:5000/api/auth'; // Đảm bảo rằng URL này trỏ đúng tới API backend của bạn

// Đăng ký người dùng
export const register = async (username, email, password, phone) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      username,
      email,
      password,
      phone
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Đăng ký thất bại');
  }
};

// Đăng nhập người dùng
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password
    });
    // Lưu token JWT vào localStorage (hoặc sử dụng state để lưu token)
    localStorage.setItem('authToken', response.data.token);
    const decodedToken = jwtDecode(response.data.token);
    localStorage.setItem('role', decodedToken.role); // Lưu role vào localStorage
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Đăng nhập thất bại');
  }
};

// Lấy thông tin người dùng từ localStorage (nếu có)
export const getCurrentUser = () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    const decoded = JSON.parse(atob(token.split('.')[1])); // Giải mã JWT
    return decoded;
  }
  return null;
};

// Đăng xuất người dùng
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('role');
};
