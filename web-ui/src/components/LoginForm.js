import React, { useState } from 'react';

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="input-group">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
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
          required
        />
      </div>
      <button type="submit" className="submit-button">Đăng nhập</button>
      <p><a href='/#/register'>Chưa có tài khoản? Đăng ký ngay</a></p>
    </form>
  );
};

export default LoginForm;
