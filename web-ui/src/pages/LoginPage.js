import { useState } from 'react';
import LoginForm from '../components/LoginForm';
import { login } from '../services/authService';

const LoginPage = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Thêm loading state

  const handleLogin = async (email, password) => {
    setLoading(true); // Bắt đầu loading
    try {
      const response = await login(email, password);
      console.log('Login successful', response);
      window.location.href = "/";
    } catch (err) {
      setError('Đăng nhập thất bại. Kiểm tra lại thông tin.');
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Đăng nhập</h1>
        {error && <p className="error-message">{error}</p>}
        <LoginForm onLogin={handleLogin} />

        {/* Hiển thị trạng thái loading khi đang đăng nhập */}
        {loading && <p className="loading-message">Đang đăng nhập...</p>}
      </div>
    </div>
  );
};

export default LoginPage;
