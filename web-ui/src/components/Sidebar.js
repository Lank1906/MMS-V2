import React from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';

const Sidebar = () => {
  const currentUser = getCurrentUser();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Menu</h2>
      </div>
      <ul className="menu-list">
        {/* Link dashboard cho tất cả các role */}
        <li><Link to="/dashboard" className="menu-item">Dashboard</Link></li>

        {/* Menu cho Admin */}
        {currentUser?.role === 'Admin' && (
          <>
            <li><Link to="/user-management" className="menu-item">Quản lý người dùng</Link></li>
          </>
        )}

        {/* Menu cho Landlord */}
        {currentUser?.role === 'Landlord' && (
          <>
            <li><Link to="/room-management" className="menu-item">Quản lý phòng của tôi</Link></li>
            <li><Link to="/contract-management" className="menu-item">Quản lý hợp đồng</Link></li>
          </>
        )}

        {/* Menu cho Renter */}
        {currentUser?.role === 'Renter' && (
          <>
            <li><Link to="/room-management" className="menu-item">Xem phòng</Link></li>
            <li><Link to="/contract-management" className="menu-item">Xem hợp đồng</Link></li>
          </>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
