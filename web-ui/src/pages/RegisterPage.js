import React, { useState } from 'react';
import RegisterForm from '../components/RegisterForm';
import { register } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Thêm loading state
  const navigate = useNavigate();

  const handleRegister = async (username, email, password, phone) => {
    setLoading(true); // Bắt đầu loading
    try {
      const response = await register(username, email, password, phone);
      console.log('Registration successful', response);
      navigate('/login')
    } catch (err) {
      setError('Đăng ký thất bại. Kiểm tra lại thông tin.');
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>Đăng ký</h1>
        {error && <p className="error-message">{error}</p>}
        <RegisterForm onRegister={handleRegister} />
        {/* Hiển thị trạng thái loading khi đang đăng ký */}
        {loading && <p className="loading-message">Đang đăng ký...</p>}
      </div>
    </div>
  );
};

export default RegisterPage;
