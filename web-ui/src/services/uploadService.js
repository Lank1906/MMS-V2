import axios from 'axios';

const API_URL = 'https://ho-ng-b-i-1.paiza-user-free.cloud:5000/api';

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const token = localStorage.getItem('authToken'); // hoặc token bạn lưu

  const res = await axios.post(`${API_URL}/upload-image`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data; // { message, imageUrl }
};
