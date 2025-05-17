import React from 'react';
import { Link ,useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/authService';

const Sidebar = () => {
  const currentUser = getCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); 
    navigate('/login'); 
  };

  if (!currentUser) return null;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Menu</h2>
      </div>
      <ul className="menu-list">
        

        {currentUser.role === 'Admin' && (
          <>
            <li><Link to="/dashboard" className="menu-item">📊 Dashboard</Link></li>
            <li><Link to="/user-management" className="menu-item">👤 Quản lý người dùng</Link></li>
          </>
        )}

        {currentUser.role === 'Landlord' && (
          <>
            <li><Link to="/property-management" className="menu-item">🏘 Quản lý cụm nhà trọ</Link></li>
            <li><Link to="/room-management" className="menu-item">🏠 Quản lý phòng</Link></li>
            <li><Link to="/room-type-management" className="menu-item">⚙️ Quản lý loại phòng</Link></li>
            <li><Link to="/service-management" className="menu-item">🔧 Quản lý dịch vụ</Link></li>
          </>
        )}

         {currentUser.role === 'Renter' && (
          <>
            <li>
              <Link to="/free-rooms" className="menu-item">📊 Dashboard</Link>
            </li>
            <li>
              <Link to="/my-room" className="menu-item">🏡 Phòng đang thuê</Link>
            </li>
            <li>
              <Link to="/profile" className="menu-item">👤 Thông tin cá nhân</Link>
            </li>
          </>
        )}

        <li>
          <button onClick={handleLogout} className="menu-item logout-button">
            🔒 Đăng xuất
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
