import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/renterService'; // Import service
import '../assets/ProfilePage.css'; // Thêm CSS nếu cần

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModified, setIsModified] = useState(false);  // Để kiểm tra nếu có thay đổi

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setUser(data);
        setForm({
          username: data.username,
          email: data.email,
          phone: data.phone,
          address: data.address,
        });
      } catch (error) {
        setError('Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setIsModified(true);  // Đánh dấu khi có sự thay đổi trong form
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateProfile(form);  // Gọi API cập nhật thông tin
      alert('Cập nhật thông tin thành công!');
      setIsModified(false);  // Reset khi cập nhật thành công
    } catch (error) {
      setError('Lỗi khi cập nhật thông tin');
    }
    setLoading(false);
  };

  if (loading) return <p>Đang tải thông tin người dùng...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="profile-container">
      <h2>Thông tin cá nhân</h2>
      {user && (
        <div className="profile-info">
          <div className="profile-field">
            <label htmlFor="fullName">Họ và tên:</label>
            <input
              className='input'
              type="text"
              id="fullName"
              name="username"
              value={form.username}
              onChange={handleChange}
            />
          </div>

          <div className="profile-field">
            <label htmlFor="email">Email:</label>
            <input
              className='input'
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="profile-field">
            <label htmlFor="phone">Số điện thoại:</label>
            <input
              className='input'
              type="text"
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="profile-field">
            <label htmlFor="address">Địa chỉ:</label>
            <input
              className='input'
              type="text"
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isModified || loading}  // Disable khi không có thay đổi hoặc đang loading
          >
            {loading ? 'Đang xử lý...' : 'Cập nhật'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
