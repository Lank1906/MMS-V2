import React, { useState } from 'react';

const RegisterForm = ({ onRegister }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(username, email, password, phone); // Gọi hàm đăng ký từ trang
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <div className="input-group">
        <label>Tên người dùng</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input-field"
          placeholder="Nhập tên người dùng"
          required
        />
      </div>
      <div className="input-group">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          placeholder="Nhập email"
          required
        />
      </div>
      <div className="input-group">
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
          placeholder="Nhập mật khẩu"
          required
        />
      </div>
      <div className="input-group">
        <label>Số điện thoại</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input-field"
          placeholder="Nhập số điện thoại"
          required
        />
      </div>
      <button type="submit" className="submit-button">Đăng ký</button>
      <p><a href='/login'>Đã có tài khoản? Đăng nhập</a></p>
    </form>
  );
};

export default RegisterForm;
