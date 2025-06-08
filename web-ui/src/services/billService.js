import axios from 'axios';

const API_URL = 'https://ho-ng-b-i-1.paiza-user-free.cloud:5000/api/bills';

const getToken = () => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Token không tồn tại hoặc đã hết hạn');
  return `Bearer ${token}`;
};

// Lấy danh sách bill theo contract_id
export const getBillsByContract = async (contractId) => {
  const res = await axios.get(`${API_URL}/contract/${contractId}`, {
    headers: { Authorization: getToken() }
  });
  return res.data;
};

// Lấy chi tiết 1 bill
export const getBillById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: getToken() }
  });
  return res.data;
};

// Tạo bill mới
export const createBill = async (data) => {
  // data bao gồm: contract_id, bill_month, total_amount, water_amount, electricity_amount, service_amount, payment_status, payment_date
  const res = await axios.post(API_URL, data, {
    headers: { Authorization: getToken() }
  });
  return res.data;
};

// Xoá bill
export const deleteBill = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: getToken() }
  });
  return res.data;
};
